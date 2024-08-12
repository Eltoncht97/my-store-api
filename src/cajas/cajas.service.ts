import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCajaDto } from './dto/create-caja.dto';
import { ArrayContains, Between, Repository, Raw } from 'typeorm';
import { Caja, CajaState } from './entities/caja.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateMovimientoDto } from './dto/create-momvimiento-caja.dto';
import { Movimiento, MovimientoType } from './entities/movimiento.entity';
import { User } from '../auth/entities/user.entity';
import { Cron } from '@nestjs/schedule';
import { ValidRoles } from '../auth/interfaces/valid-roles';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { CreateTraspasoDto } from './dto/create-traspaso.dto';

@Injectable()
export class CajasService {
  constructor(
    @InjectRepository(Caja)
    private readonly cajaRepository: Repository<Caja>,
    @InjectRepository(Movimiento)
    private readonly movimientoRepository: Repository<Movimiento>,
  ) {}

  async create(createCajaDto: CreateCajaDto) {
    const caja = this.cajaRepository.create(createCajaDto);

    await this.cajaRepository.save(caja);

    return caja;
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit, offset = 0, keyword = '' } = paginationDto;

    const [cajas, count] = await this.cajaRepository.findAndCount({
      where: [
        {
          user: {
            fullName: Raw(
              (fullName) => `LOWER(${fullName}) LIKE LOWER(:value)`,
              {
                value: `%${keyword}%`,
              },
            ),
          },
        },
      ],
      order: { state: 'ASC' },
      take: limit || null,
      skip: offset,
    });

    return {
      cajas,
      count,
    };
  }

  async findOne(id: number) {
    const caja = await this.cajaRepository.findOne({
      where: {
        id,
      },
      relations: { movimientos: true, user: true },
      loadEagerRelations: false,
      order: {
        movimientos: {
          createdAt: 'DESC',
        },
      },
    });

    caja.movimientos = caja.movimientos.filter(
      (movimiento) => movimiento.tipo !== MovimientoType.CUENTA_CORRIENTE,
    );
    if (!caja) throw new NotFoundException(`Caja with id "${id}" not found`);

    return caja;
  }

  async getMovimientosCajaByDates({ startDate, endDate }) {
    //movimientos de caja del dia
    const movimientos = await this.movimientoRepository.findAndCount({
      where: {
        createdAt: Between(startDate, endDate),
      },
      order: {
        createdAt: 'DESC',
      },
    });
    //ventas del dia

    return movimientos;
  }

  async createMovement(user: User, createMovimientoDto: CreateMovimientoDto) {
    const caja = await this.cajaRepository.findOne({
      where: { userId: user.id, state: CajaState.ABIERTA },
    });

    const movimiento = this.movimientoRepository.create({
      ...createMovimientoDto,
    });
    movimiento.caja = caja;

    switch (movimiento.tipo) {
      case MovimientoType.EFECTIVO:
        caja.efectivo += createMovimientoDto.monto;
        break;
      case MovimientoType.TRANSFERENCIA:
        caja.transferencias += createMovimientoDto.monto;
        break;
      case MovimientoType.CUENTA_CORRIENTE:
        caja.cuentaCorriente += createMovimientoDto.monto;
        break;
      case MovimientoType.TARJETA_DE_CREDITO:
        caja.credito += createMovimientoDto.monto;
        break;
      case MovimientoType.TARJETA_DE_DEBITO:
        caja.debito += createMovimientoDto.monto;
        break;
    }

    caja.saldo =
      caja.efectivo + caja.credito + caja.transferencias + caja.debito;

    await this.cajaRepository.save(caja);

    await this.movimientoRepository.save(movimiento);

    return movimiento;
  }

  async traspasoEfectivoCajas(
    emisor: string,
    receptor: string,
    createTraspasoDto: CreateTraspasoDto,
  ) {
    const { monto } = createTraspasoDto;
    try {
      const cajaEmisor = await this.cajaRepository.findOne({
        where: { id: Number(emisor) },
      });

      const cajaReceptor = await this.cajaRepository.findOne({
        where: {
          id: Number(receptor),
        },
      });

      //movimiento negativo
      const movimientoCajaEmisor = this.movimientoRepository.create({
        tipo: MovimientoType.EFECTIVO,
        description: `Traspaso a caja ${cajaEmisor.user.fullName}`,
        monto: -monto,
      });
      movimientoCajaEmisor.caja = cajaEmisor;
      cajaEmisor.efectivo -= monto;
      cajaEmisor.saldo -= monto;

      //movimineto positivo
      const movimientoCajaReceptor = this.movimientoRepository.create({
        tipo: MovimientoType.EFECTIVO,
        description: `Traspaso de caja ${cajaEmisor.user.fullName}`,
        monto: monto,
      });
      movimientoCajaReceptor.caja = cajaReceptor;
      cajaReceptor.efectivo += monto;
      cajaReceptor.saldo += monto;

      await this.movimientoRepository.save([
        movimientoCajaReceptor,
        movimientoCajaEmisor,
      ]);
      await this.cajaRepository.save([cajaReceptor, cajaEmisor]);

      return { ok: true, message: 'Traspaso completado' };
    } catch (error) {
      console.log(error);
    }
  }

  @Cron('05 00 * * *', {
    name: 'cajasCronjob',
    timeZone: 'America/Argentina/Cordoba',
  })
  async traspasoCaja() {
    const cajaGerente = await this.cajaRepository.findOne({
      where: { user: { roles: ArrayContains([ValidRoles.gerente]) } },
    });

    const cajaVenta = await this.cajaRepository.findOne({
      where: {
        user: { roles: ArrayContains([ValidRoles.venta]) },
        state: CajaState.ABIERTA,
      },
    });

    const efectivo = cajaVenta.efectivo;

    const newCajaVenta = await this.cajaRepository.create({
      userId: cajaVenta.userId,
    });

    cajaVenta.state = CajaState.CERRADA;

    if (efectivo === 0) {
      await this.cajaRepository.save([cajaVenta, newCajaVenta]);
      return;
    }

    //movimiento negativo
    const movimientoVenta = this.movimientoRepository.create({
      tipo: MovimientoType.EFECTIVO,
      description: `Traspaso a caja gerente - cronjob`,
      monto: -efectivo,
    });
    movimientoVenta.caja = cajaVenta;
    cajaVenta.efectivo = 0;
    cajaVenta.saldo -= efectivo;

    //movimineto positivo
    const movimientoGerencia = this.movimientoRepository.create({
      tipo: MovimientoType.EFECTIVO,
      description: `Traspaso de caja venta - cronjob`,
      monto: efectivo,
    });
    movimientoGerencia.caja = cajaGerente;
    cajaGerente.efectivo += efectivo;
    cajaGerente.saldo += efectivo;

    await this.movimientoRepository.save([movimientoGerencia, movimientoVenta]);
    await this.cajaRepository.save([cajaGerente, cajaVenta, newCajaVenta]);

    return { cajaGerente, cajaVenta };
  }
}

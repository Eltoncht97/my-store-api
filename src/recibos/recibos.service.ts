import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateReciboDto } from './dto/create-recibo.dto';
import { Recibo } from './entities/recibo.entity';
import { Raw, Repository } from 'typeorm';
import { validate as isUUID } from 'uuid';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { VouchersService } from '../vouchers/vouchers.service';
import { VoucherType } from '../vouchers/entities/voucher.entity';
import { ClientsService } from '../clients/clients.service';
import { MovimientoType } from '../cajas/entities/movimiento.entity';
import { CajasService } from '../cajas/cajas.service';

@Injectable()
export class RecibosService {
  constructor(
    @InjectRepository(Recibo)
    private readonly reciboRepository: Repository<Recibo>,
    private readonly voucherService: VouchersService,
    private readonly clientService: ClientsService,
    private readonly cajaService: CajasService,
  ) {}
  async create(createReciboDto: CreateReciboDto, user) {
    const {
      createMovement = true,
      description = '',
      ...createData
    } = createReciboDto;
    const recibo = this.reciboRepository.create(createData);
    recibo.voucher = await this.voucherService.createVoucher(
      VoucherType.RECIBO,
    );
    await this.reciboRepository.save(recibo);
    const client = await this.clientService.findOne(createReciboDto.clientId);

    this.cajaService.createMovement(user, {
      tipo: <MovimientoType>createReciboDto.paymentMethod,
      description:
        description ||
        `Cobro en ${createReciboDto.paymentMethod.toLowerCase()} ${
          client.lastname
        } ${client.name}`,
      monto: createReciboDto.total,
    });

    if (createMovement) {
      await this.clientService.createClientAccountMovement(
        client.account,
        createReciboDto.total,
        'Recibo',
        `Pago en ${createReciboDto.paymentMethod}: ${recibo.voucher.code}`,
      );
    }

    return recibo;
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0, keyword = '' } = paginationDto;

    const [recibos, count] = await this.reciboRepository.findAndCount({
      where: [
        {
          client: {
            name: Raw((name) => `LOWER(${name}) LIKE LOWER(:value)`, {
              value: `%${keyword}%`,
            }),
          },
        },
        {
          voucher: {
            code: Raw((code) => `LOWER(${code}) LIKE LOWER(:value)`, {
              value: `%${keyword}%`,
            }),
          },
        },
      ],
      take: limit,
      skip: offset,
      relations: {
        client: true,
        voucher: true,
      },
      order: {
        voucher: {
          id: 'DESC',
        },
      },
      withDeleted: true,
    });
    return { recibos, count };
  }

  async findOne(id: string) {
    let recibo: Recibo;
    if (isUUID(id)) {
      recibo = await this.reciboRepository.findOne({
        where: { id },
        relations: {
          client: true,
          voucher: true,
          venta: {
            products: false,
          },
        },
      });
    }

    if (!recibo) throw new NotFoundException(`Recibo with "${id}" not found`);

    return recibo;
  }

  async remove(id: string, user, isVenta = false) {
    const promises = [];
    try {
      const recibo = await this.findOne(id);

      promises.push(
        this.cajaService.createMovement(user, {
          tipo: <MovimientoType>recibo.paymentMethod,
          description: `Recibo eliminado: ${recibo.voucher.code}`,
          monto: -recibo.total,
        }),
      );

      if (!isVenta) {
        promises.push(
          this.clientService.createClientAccountMovement(
            recibo.client.account,
            -recibo.total,
            'Recibo',
            `Reicbo eliminado: ${recibo.voucher.code}`,
          ),
        );
      }

      await Promise.all(promises);
      await this.reciboRepository.remove(recibo);
    } catch (error) {
      console.log(error);
    }
  }

  async deleteAllRecibos() {
    const query = this.reciboRepository.createQueryBuilder('recibo');
    try {
      return await query.delete().where({}).execute();
    } catch (error) {
      console.log(error);
    }
  }
}

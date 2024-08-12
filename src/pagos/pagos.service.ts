import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { ProveedoresService } from 'src/proveedores/proveedores.service';
import { CajasService } from 'src/cajas/cajas.service';
import { VouchersService } from 'src/vouchers/vouchers.service';
import { Raw, Repository } from 'typeorm';
import { CreatePagoDto } from './dto/create-pago.dto';
import { Pago } from './entities/pago.entity';
import { validate as isUUID } from 'uuid';
import { VoucherType } from 'src/vouchers/entities/voucher.entity';
import { MovimientoType } from '../cajas/entities/movimiento.entity';

@Injectable()
export class PagosService {
  constructor(
    @InjectRepository(Pago)
    private readonly pagoRepository: Repository<Pago>,
    private readonly voucherService: VouchersService,
    private readonly proveedorService: ProveedoresService,
    private readonly cajaService: CajasService,
  ) {}

  async create(createPagoDto: CreatePagoDto, user) {
    console.log(user, createPagoDto);

    const { createMovement = true, ...createData } = createPagoDto;
    const pago = this.pagoRepository.create(createData);
    pago.voucher = await this.voucherService.createVoucher(VoucherType.PAGO);

    await this.pagoRepository.save(pago);

    if (createMovement) {
      await this.proveedorService.createAccountMovement(
        createPagoDto.proveedorId,
        createPagoDto.total,
        `Pago ${pago.voucher.code} `,
        pago.id,
      );
    }

    console.log(pago);

    if (createPagoDto.paymentMethod === 'Efectivo') {
      //crear movimiento en caja negativo
      await this.cajaService.createMovement(user, {
        tipo: <MovimientoType>pago.paymentMethod,
        description: `Pago ${pago.voucher.code}`,
        monto: -pago.total,
      });
    }

    return pago;
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0, keyword = '' } = paginationDto;

    const [pagos, count] = await this.pagoRepository.findAndCount({
      where: [
        {
          proveedor: {
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
        proveedor: true,
        voucher: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
    return { pagos, count };
  }

  async findOne(id: string) {
    let pago: Pago;
    if (isUUID(id)) {
      pago = await this.pagoRepository.findOne({
        where: { id },
        relations: {
          proveedor: true,
          voucher: true,
        },
      });
    }

    if (!pago) throw new NotFoundException(`Pago with "${id}" not found`);

    return pago;
  }

  remove(id: string) {
    return `This action removes a #${id} pago`;
  }
}

import {
  Injectable,
  Logger,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Raw } from 'typeorm';
import { validate as isUUID } from 'uuid';

import { CreateVentaDto } from './dto/create-venta.dto';
import { UpdateVentaDto } from './dto/update-venta.dto';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { Venta } from './entities/venta.entity';
import { ClientsService } from '../clients/clients.service';
import { VentaProduct } from './entities/venta-product.entity';
import { User } from '../auth/entities/user.entity';
import { MovimientoType } from '../cajas/entities/movimiento.entity';
import { VouchersService } from '../vouchers/vouchers.service';
import { VoucherType } from '../vouchers/entities/voucher.entity';
import { CajasService } from '../cajas/cajas.service';
import { RecibosService } from '../recibos/recibos.service';
import { ProductsService } from '../products/products.service';
import { Category } from '../categories/entities/category.entity';

@Injectable()
export class VentasService {
  private logger = new Logger();
  constructor(
    @InjectRepository(Venta)
    private readonly ventaRepository: Repository<Venta>,
    @InjectRepository(VentaProduct)
    private readonly ventaProductRepository: Repository<VentaProduct>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    private readonly voucherService: VouchersService,
    private readonly cajaService: CajasService,
    private readonly clientService: ClientsService,
    private readonly reciboService: RecibosService,
    private readonly productService: ProductsService,
  ) {}

  async create(createVentaDto: CreateVentaDto, user: User) {
    const { clientId, products, ...createData } = createVentaDto;

    try {
      const client = await this.clientService.findOne(clientId);

      const venta = this.ventaRepository.create({
        ...createData,
        client,
        products: products.map((productData) =>
          this.ventaProductRepository.create({
            ...productData,
          }),
        ),
      });

      venta.voucher = await this.voucherService.createVoucher(
        VoucherType.VENTA,
      );

      const ventaDB = await this.ventaRepository.save(venta);

      const promises = [];

      products.forEach((p) => {
        console.log(p);

        promises.push(this.productService.decreaseStock(p.product, p.quantity));
      });

      await Promise.all(promises);

      if (venta.paymentMethod === MovimientoType.CUENTA_CORRIENTE) {
        await this.clientService.createClientAccountMovement(
          client.account,
          -venta.total,
          'Compra',
          `Compra en tienda de ${
            venta.total > 0 ? venta.total : venta.total * -1
          }`,
        );
      } else {
        const recibo = await this.reciboService.create(
          {
            clientId,
            paymentMethod: createData.paymentMethod,
            total: createData.total,
            createMovement: false,
            description: `Cobro en ${venta.paymentMethod.toLowerCase()} venta ${
              venta.voucher.code
            }`,
          },
          user,
        );
        ventaDB.recibo = recibo;
        await this.ventaRepository.save(ventaDB);
      }

      return ventaDB;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0, keyword = '' } = paginationDto;
    const [ventas, count] = await this.ventaRepository.findAndCount({
      where: [
        {
          voucher: {
            code: Raw((code) => `LOWER(${code}) LIKE LOWER(:value)`, {
              value: `%${keyword}%`,
            }),
          },
        },
        {
          client: {
            name: Raw((name) => `LOWER(${name}) LIKE LOWER(:value)`, {
              value: `%${keyword}%`,
            }),
          },
        },
        {
          client: {
            lastname: Raw(
              (lastname) => `LOWER(${lastname}) LIKE LOWER(:value)`,
              {
                value: `%${keyword}%`,
              },
            ),
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
        createdAt: 'DESC',
      },
      withDeleted: true,
    });
    return { ventas, count };
  }

  async findOnePlain(id: string) {
    let venta: Venta;
    if (isUUID(id)) {
      venta = await this.ventaRepository.findOne({
        where: { id },
      });
    }

    if (!venta) throw new NotFoundException(`Venta with "${id}" not found`);

    return venta;
  }

  async findOne(id: string) {
    //this function will return all relationships
    let venta: Venta;
    if (isUUID(id)) {
      venta = await this.ventaRepository.findOne({
        where: { id },
        relations: {
          client: true,
          products: {
            product: true,
          },
          voucher: true,
          recibo: true,
        },
      });
    }

    if (!venta) throw new NotFoundException(`Venta with "${id}" not found`);

    return venta;
  }

  async update(id: string, updateVentaDto: UpdateVentaDto) {
    const venta = await this.ventaRepository.preload({
      id,
      ...updateVentaDto,
    });

    if (!venta) throw new NotFoundException(`Venta with id: ${id} not found`);

    try {
      await this.ventaRepository.save(venta);

      return this.findOne(id);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async remove(id: string, user) {
    const promises = [];

    try {
      const venta = await this.findOne(id);

      venta.products.forEach((p) => {
        promises.push(
          this.productService.increaseStock(p.product.id, p.quantity),
        );
      });

      if (venta.paymentMethod === MovimientoType.CUENTA_CORRIENTE) {
        promises.push(
          this.clientService.createClientAccountMovement(
            venta.client.account,
            venta.total,
            'Compra',
            `Venta eliminada de ${
              venta.total > 0 ? venta.total : venta.total * -1
            }`,
          ),
        );
      }

      await Promise.all(promises);

      if (venta.paymentMethod !== 'Cuenta Corriente' && venta.recibo) {
        this.reciboService.remove(venta.recibo.id, user, true);
      }

      await this.ventaRepository.remove(venta);
    } catch (error) {
      console.log(error);
    }
  }

  private handleDBExceptions(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);

    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }

  async deleteAllVentas() {
    const query = this.ventaRepository.createQueryBuilder('venta');
    try {
      return await query.delete().where({}).execute();
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async getVentasByDate({ startDate, endDate }) {
    try {
      const [ventas, count] = await this.ventaRepository.findAndCount({
        where: {
          createdAt: Between(startDate, endDate),
        },
        relations: {
          client: true,
        },
        order: {
          createdAt: 'DESC',
        },
      });

      return { ventas, count };
    } catch (error) {
      console.log(error);
      return { ok: false };
    }
  }

  async getInformeVentas({ startDate, endDate }) {
    try {
      const [ventas, count] = await this.ventaRepository.findAndCount({
        select: {
          id: true,
          date: true,
          paymentMethod: true,
          total: true,
          client: {
            id: true,
            name: true,
            lastname: true,
          },
          products: {
            id: true,
            total: true,
            quantity: true,
            product: {
              id: true,
              name: true,
              categoryId: true,
              category: {
                id: true,
                name: true,
              },
            },
          },
        },
        where: {
          createdAt: Between(startDate, endDate),
        },
        relations: {
          client: true,
          products: { product: { category: true } },
        },
        order: {
          date: 'DESC',
        },
      });

      const categories = await this.categoryRepository
        .createQueryBuilder('category')
        .select(['category.id', 'category.name'])
        .getMany();

      const categoriesWithCount = categories.map((category) => ({
        ...category,
        count: ventas.reduce(
          (total, venta) =>
            total +
            venta.products
              .filter((p) => p.product.categoryId === category.id)
              .reduce(
                (totalProduct, product) => totalProduct + product.total,
                0,
              ),
          0,
        ),
      }));

      return {
        ventas,
        count,
        categories: categoriesWithCount,
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }
}

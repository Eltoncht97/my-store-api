import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Repository, Raw, Between } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { validate as isUUID } from 'uuid';

import { CreateOrdenesIngresoDto } from './dto/create-ordenes-ingreso.dto';
import { OrdenIngreso } from './entities/ordenes-ingreso.entity';
import { OrdenIngresoProduct } from './entities/ordenes-ingreso-product';
import { ProveedoresService } from '../proveedores/proveedores.service';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { ProductsService } from '../products/products.service';
import { Category } from '../categories/entities/category.entity';

@Injectable()
export class OrdenesIngresoService {
  private logger = new Logger();
  constructor(
    @InjectRepository(OrdenIngreso)
    private readonly ordenIngresoRepository: Repository<OrdenIngreso>,
    @InjectRepository(OrdenIngresoProduct)
    private readonly ordenIngresoProductRepository: Repository<OrdenIngresoProduct>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    private readonly proveedorService: ProveedoresService,
    private readonly productService: ProductsService,
  ) {}

  async create(createOrdenIngresoDto: CreateOrdenesIngresoDto) {
    const { products, ...createData } = createOrdenIngresoDto;

    try {
      const ordenIngreso = this.ordenIngresoRepository.create({
        ...createData,
        products: products.map((product) =>
          this.ordenIngresoProductRepository.create({ ...product }),
        ),
      });

      const ingresoDB = await this.ordenIngresoRepository.save(ordenIngreso);

      await this.proveedorService.createAccountMovement(
        createOrdenIngresoDto.proveedorId,
        -createOrdenIngresoDto.total,
        `Orden de ingreso factura "${createOrdenIngresoDto.factura}"`,
        ordenIngreso.id,
      );

      const promises = [];
      console.log(createOrdenIngresoDto.products);

      createOrdenIngresoDto.products.forEach((p) => {
        promises.push(
          this.productService.increaseStock(p.product, p.quantity, true, p),
        );
      });

      // actualizamos stock
      await Promise.all(promises);

      return ingresoDB;
    } catch (error) {
      console.log(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit, offset = 0, keyword = '' } = paginationDto;

    const [ingresos, count] = await this.ordenIngresoRepository.findAndCount({
      where: [
        {
          factura: Raw((factura) => `LOWER(${factura}) LIKE LOWER(:value)`, {
            value: `%${keyword}%`,
          }),
        },
        {
          proveedor: {
            name: Raw((name) => `LOWER(${name}) LIKE LOWER(:value)`, {
              value: `%${keyword}%`,
            }),
          },
        },
      ],
      order: { date: 'DESC' },
      take: limit || null,
      skip: offset,
      withDeleted: true,
    });

    return {
      ingresos,
      count,
    };
  }

  async findOne(id: string) {
    let ingreso: OrdenIngreso;
    if (isUUID(id)) {
      ingreso = await this.ordenIngresoRepository.findOne({
        where: { id },
        relations: {
          proveedor: true,
          products: {
            product: true,
          },
        },
      });
    }

    if (!ingreso) throw new NotFoundException(`Ingreso with "${id}" not found`);

    return ingreso;
  }

  async remove(id: string) {
    //Se deben poder eliminar las ordenes de ingreso ?
    try {
      const ingreso = await this.findOne(id);

      if (!ingreso)
        throw new NotFoundException(
          `Orden de Ingreso with id: ${id} not found`,
        );

      await this.ordenIngresoRepository.softDelete(id);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  // USAR SOLO EN SEED
  async deleteAll() {
    const query = this.ordenIngresoRepository.createQueryBuilder('ingresos');
    try {
      return await query.delete().where({}).execute();
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  private handleDBExceptions(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);

    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }

  async getInformeOrdenesDeIngreso({ startDate, endDate }) {
    try {
      const [compras, count] = await this.ordenIngresoRepository.findAndCount({
        select: {
          id: true,
          date: true,
          total: true,
          factura: true,
          proveedor: {
            id: true,
            name: true,
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
          proveedor: true,
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
        count: compras.reduce(
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
        compras,
        count,
        categories: categoriesWithCount,
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }
}

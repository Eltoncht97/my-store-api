import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Raw } from 'typeorm';
import { validate as isUUID } from 'uuid';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities';
import { Category } from '../categories/entities/category.entity';
import { CategoriesService } from '../categories/categories.service';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductService');
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,

    private readonly categoriesService: CategoriesService,
  ) {}

  async create(createProductDto: CreateProductDto) {
    try {
      const product = this.productRepository.create({
        ...createProductDto,
      });
      product.category = await this.categoriesService.findOneById(
        createProductDto.categoryId,
      );

      await this.productRepository.save(product);

      return product;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async createWithSeed(createProductDto: CreateProductDto) {
    try {
      const { categoryId, ...data } = createProductDto;

      const category = await this.categoryRepository.findOne({
        where: { name: categoryId },
      });

      const product = this.productRepository.create(data);
      product.category = category;

      await this.productRepository.save(product);

      return product;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0, keyword = '', category } = paginationDto;

    const [products, count] = await this.productRepository.findAndCount({
      where: [
        {
          name: Raw((name) => `LOWER(${name}) LIKE LOWER(:value)`, {
            value: `%${keyword}%`,
          }),
          category: {
            id: category,
          },
        },
        {
          code: Raw((code) => `LOWER(${code}) LIKE LOWER(:value)`, {
            value: `%${keyword}%`,
          }),
          category: {
            id: category,
          },
        },
        {
          category: {
            name: Raw((name) => `LOWER(${name}) LIKE LOWER(:value)`, {
              value: `%${keyword}%`,
            }),
            id: category,
          },
        },
      ],
      take: limit,
      skip: offset,
      relations: {
        category: true,
      },
      order: {
        name: 'ASC',
      },
    });
    return { products, count };
  }

  async findOne(id: string) {
    let product: Product;
    if (isUUID(id)) {
      product = await this.productRepository.findOne({
        where: { id },
        relations: ['category'],
      });
    }

    if (!product) throw new NotFoundException(`Product with "${id}" not found`);

    return product;
  }

  async findOnePlain(id: string) {
    let product: Product;
    if (isUUID(id)) {
      product = await this.productRepository.findOne({
        where: { id },
        relations: ['category'],
      });
    }

    if (!product) throw new NotFoundException(`Product with "${id}" not found`);

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const { categoryId, ...toUpdate } = updateProductDto;
    const product = await this.productRepository.preload({
      id,
      ...toUpdate,
    });

    if (!product)
      throw new NotFoundException(`Product with id: ${id} not found`);
    try {
      if (categoryId) {
        product.category = await this.categoriesService.findOneById(categoryId);
      }

      await this.productRepository.save(product);

      return this.findOnePlain(id);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async remove(id: string) {
    try {
      const product = await this.findOne(id);

      if (!product)
        throw new NotFoundException(`Product with id: ${id} not found`);

      await this.productRepository.softDelete(id);
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

  async deleteAllProducts() {
    const query = this.productRepository.createQueryBuilder('product');
    try {
      return await query.delete().where({}).execute();
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async increaseStock(
    id,
    quantity: number,
    updatePrice = false,
    productData = null,
  ) {
    try {
      const product = await this.findOne(id);

      if (!product)
        throw new NotFoundException(`Product with id: ${id} not found`);

      product.stock = product.stock + quantity;

      if (updatePrice) {
        product.costWithoutIva = productData.price;
        product.ivaType = productData.iva;
        product.costPrice =
          productData.price + productData.impuestos / productData.quantity;
        product.utilities =
          (product.costPrice * product.utilitiesPercentage) / 100;
        product.price = product.costPrice + product.utilities;
      }

      await this.productRepository.save(product);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async decreaseStock(id, quantity: number) {
    try {
      const product = await this.findOne(id);

      if (!product)
        throw new NotFoundException(`Product with id: ${id} not found`);

      product.stock = product.stock - quantity;

      await this.productRepository.save(product);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }
}

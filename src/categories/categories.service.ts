import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Raw, Repository } from 'typeorm';
import { validate as isUUID } from 'uuid';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';
import { PaginationDto } from '../common/dtos/pagination.dto';

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger('ProductService');
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    try {
      const category = this.categoryRepository.create(createCategoryDto);

      await this.categoryRepository.save(category);

      return category;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0, keyword = '' } = paginationDto;

    const [categories, count] = await this.categoryRepository.findAndCount({
      where: [
        {
          name: Raw((name) => `LOWER(${name}) LIKE LOWER(:value)`, {
            value: `%${keyword}%`,
          }),
        },
      ],
      take: limit,
      skip: offset,
      loadEagerRelations: false,
      order: {
        name: 'ASC',
      },
    });

    return { categories, count };
  }

  async findOneById(id: string) {
    let category: Category;
    if (isUUID(id)) {
      category = await this.categoryRepository.findOne({
        where: { id },
        loadEagerRelations: false,
      });
    }

    if (!category)
      throw new NotFoundException(`Category with "${id}" not found`);

    return category;
  }

  async findOne(id: string) {
    let category: Category;
    if (isUUID(id)) {
      category = await this.categoryRepository.findOne({
        where: { id },
        relations: { products: true },
      });
    }

    if (!category)
      throw new NotFoundException(`Category with "${id}" not found`);

    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.categoryRepository.preload({
      id,
      ...updateCategoryDto,
    });

    if (!category)
      throw new NotFoundException(`Category with id: ${id} not found`);

    try {
      await this.categoryRepository.save(category);

      return this.findOne(id);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async remove(id: string) {
    try {
      const category = await this.findOne(id);

      if (!category)
        throw new NotFoundException(`Category with id: ${id} not found`);

      await this.categoryRepository.softDelete(id);
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

  async deleteAllCategories() {
    const query = this.categoryRepository.createQueryBuilder('category');
    try {
      return await query.delete().where({}).execute();
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }
}

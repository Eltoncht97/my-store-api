import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from 'src/auth/auth.module';
import { CategoriesModule } from '../categories/categories.module';

import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';

import { Product, ProductImage } from './entities';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
  imports: [
    TypeOrmModule.forFeature([Product, ProductImage]),
    CategoriesModule,
    AuthModule,
  ],
  exports: [ProductsService, TypeOrmModule, CategoriesModule],
})
export class ProductsModule {}

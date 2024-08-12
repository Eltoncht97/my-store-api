import { IVA } from '../entities/product.entity';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @MinLength(1)
  code: string;

  @IsString()
  @MinLength(1)
  name: string;

  @IsString()
  @MinLength(1)
  categoryId: string;

  @IsNumber()
  @IsOptional()
  stockMin?: number;

  @IsNumber()
  @IsOptional()
  stock?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  costWithoutIva?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  discountPercentage?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  discount?: number;

  @IsEnum(IVA)
  @IsOptional()
  ivaType?: IVA;

  @IsNumber()
  @Min(0)
  @IsOptional()
  iva?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  costPrice?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  utilitiesPercentage?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  utilities?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsBoolean()
  @IsOptional()
  active?: boolean;
}

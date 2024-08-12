import {
  IsDateString,
  IsString,
  MinLength,
  IsNumber,
  IsPositive,
  IsArray,
} from 'class-validator';
import { OrdenIngresoProduct } from '../entities/ordenes-ingreso-product';
export class CreateOrdenesIngresoDto {
  @IsString()
  @MinLength(1)
  proveedorId: string;

  @IsString()
  @MinLength(1)
  factura: string;

  @IsDateString()
  date: Date;

  @IsNumber()
  @IsPositive()
  subtotal: number;

  @IsNumber()
  discount: number;

  @IsNumber()
  @IsPositive()
  total: number;

  @IsArray()
  products: OrdenIngresoProduct[];
}

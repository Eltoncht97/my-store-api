import { VentaProduct } from '../entities/venta-product.entity';
import { PaymentMethod } from '../interfaces/payment-methods.interface';
import {
  IsArray,
  IsDateString,
  IsNumber,
  IsPositive,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateVentaDto {
  @IsString()
  @MinLength(1)
  clientId: string;

  @IsDateString()
  date: Date;

  @IsString()
  @MinLength(1)
  paymentMethod: PaymentMethod;

  @IsNumber()
  @IsPositive()
  subtotal: number;

  @IsNumber()
  discount: number;

  @IsNumber()
  @IsPositive()
  total: number;

  @IsArray()
  products: VentaProduct[];
}

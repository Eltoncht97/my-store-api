import {
  IsOptional,
  IsNumber,
  IsPositive,
  MinLength,
  IsString,
} from 'class-validator';
import { PaymentMethod } from '../../ventas/interfaces/payment-methods.interface';
import { Venta } from '../../ventas/entities/venta.entity';

export class CreateReciboDto {
  @IsString()
  @MinLength(1)
  clientId: string;

  @IsString()
  @MinLength(1)
  paymentMethod: PaymentMethod;

  @IsNumber()
  @IsPositive()
  total: number;

  @IsOptional()
  createMovement?: boolean;

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  venta?: Venta;
}

import {
  IsOptional,
  IsNumber,
  IsPositive,
  MinLength,
  IsString,
} from 'class-validator';
import { PaymentMethod } from '../../ventas/interfaces/payment-methods.interface';

export class CreatePagoDto {
  @IsString()
  @MinLength(1)
  proveedorId: string;

  @IsString()
  @MinLength(1)
  paymentMethod: PaymentMethod;

  @IsNumber()
  @IsPositive()
  total: number;

  @IsOptional()
  createMovement?: boolean;
}

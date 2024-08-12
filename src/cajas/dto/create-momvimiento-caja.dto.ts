import { IsString, IsNumber, IsPositive, IsEnum } from 'class-validator';
import { MovimientoType } from '../entities/movimiento.entity';

export class CreateMovimientoDto {
  @IsEnum(MovimientoType)
  tipo: MovimientoType;

  @IsString()
  description: string;

  @IsNumber()
  @IsPositive()
  monto: number;
}

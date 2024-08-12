import { IsNumber, IsPositive } from 'class-validator';

export class CreateTraspasoDto {
  @IsNumber()
  @IsPositive()
  monto: number;
}

import { IsUUID } from 'class-validator';

export class CreateCajaDto {
  @IsUUID()
  userId: string;
}

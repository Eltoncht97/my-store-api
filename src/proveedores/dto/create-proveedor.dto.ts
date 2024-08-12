import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateProveedorDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsString()
  @IsOptional()
  @MinLength(1)
  cuit?: string;

  @IsString()
  @MinLength(1)
  phone: string;

  @IsString()
  @MinLength(1)
  address: string;
}

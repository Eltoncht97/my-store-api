import { Type } from 'class-transformer';
import { IsOptional, IsNumber } from 'class-validator';

export class PaginationDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  @Type(() => Number)
  offset?: number;

  @IsOptional()
  @Type(() => String)
  keyword?: string;

  @IsOptional()
  @Type(() => String)
  category?: string;

  @IsOptional()
  @Type(() => Boolean)
  saldo?: boolean;
}

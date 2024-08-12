import { PartialType } from '@nestjs/mapped-types';
import { CreateOrdenesIngresoDto } from './create-ordenes-ingreso.dto';

export class UpdateOrdenesIngresoDto extends PartialType(CreateOrdenesIngresoDto) {}

import { PartialType } from '@nestjs/mapped-types';
import { CreateOrdenesPagoDto } from './create-ordenes-pago.dto';

export class UpdateOrdenesPagoDto extends PartialType(CreateOrdenesPagoDto) {}

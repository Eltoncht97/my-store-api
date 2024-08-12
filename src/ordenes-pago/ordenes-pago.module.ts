import { Module } from '@nestjs/common';
import { OrdenesPagoService } from './ordenes-pago.service';
import { OrdenesPagoController } from './ordenes-pago.controller';

@Module({
  controllers: [OrdenesPagoController],
  providers: [OrdenesPagoService]
})
export class OrdenesPagoModule {}

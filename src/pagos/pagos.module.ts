import { Module } from '@nestjs/common';
import { PagosService } from './pagos.service';
import { PagosController } from './pagos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pago } from './entities/pago.entity';
import { ProveedoresModule } from 'src/proveedores/proveedores.module';
import { VouchersModule } from 'src/vouchers/vouchers.module';
import { CajasModule } from '../cajas/cajas.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [PagosController],
  providers: [PagosService],
  imports: [
    TypeOrmModule.forFeature([Pago]),
    VouchersModule,
    ProveedoresModule,
    CajasModule,
    AuthModule,
  ],
  exports: [TypeOrmModule],
})
export class PagosModule {}

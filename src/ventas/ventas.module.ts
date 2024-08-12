import { Module } from '@nestjs/common';
import { VentasService } from './ventas.service';
import { VentasController } from './ventas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Venta } from './entities/venta.entity';
import { ClientsModule } from '../clients/clients.module';
import { VentaProduct } from './entities/venta-product.entity';
import { ProductsModule } from '../products/products.module';
import { AuthModule } from '../auth/auth.module';
import { CajasModule } from '../cajas/cajas.module';
import { VouchersModule } from '../vouchers/vouchers.module';
import { RecibosModule } from '../recibos/recibos.module';

@Module({
  controllers: [VentasController],
  providers: [VentasService],
  imports: [
    TypeOrmModule.forFeature([Venta, VentaProduct]),
    ClientsModule,
    ProductsModule,
    AuthModule,
    CajasModule,
    VouchersModule,
    RecibosModule,
  ],
  exports: [TypeOrmModule, VentasService],
})
export class VentasModule {}

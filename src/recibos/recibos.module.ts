import { Module } from '@nestjs/common';
import { RecibosService } from './recibos.service';
import { RecibosController } from './recibos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Recibo } from './entities/recibo.entity';
import { VouchersModule } from '../vouchers/vouchers.module';
import { ClientsModule } from '../clients/clients.module';
import { ProductsModule } from '../products/products.module';
import { CajasModule } from '../cajas/cajas.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [RecibosController],
  providers: [RecibosService],
  imports: [
    TypeOrmModule.forFeature([Recibo]),
    VouchersModule,
    ClientsModule,
    ProductsModule,
    CajasModule,
    AuthModule,
  ],
  exports: [TypeOrmModule, RecibosService],
})
export class RecibosModule {}

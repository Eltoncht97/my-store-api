import { Module } from '@nestjs/common';

import { ProductsModule } from '../products/products.module';
import { CategoriesModule } from '../categories/categories.module';
import { ClientsModule } from '../clients/clients.module';
import { VentasModule } from '../ventas/ventas.module';
import { AuthModule } from 'src/auth/auth.module';

import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { CajasModule } from '../cajas/cajas.module';
import { RecibosModule } from '../recibos/recibos.module';
import { ProveedoresModule } from '../proveedores/proveedores.module';

@Module({
  controllers: [SeedController],
  providers: [SeedService],
  imports: [
    ProductsModule,
    CategoriesModule,
    ClientsModule,
    VentasModule,
    AuthModule,
    CajasModule,
    RecibosModule,
    ProveedoresModule,
  ],
})
export class SeedModule {}

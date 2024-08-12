import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from './products/products.module';
import { CommonModule } from './common/common.module';
import { SeedModule } from './seed/seed.module';
import { FilesModule } from './files/files.module';
import { CategoriesModule } from './categories/categories.module';
import { ClientsModule } from './clients/clients.module';
import { VentasModule } from './ventas/ventas.module';
import { CajasModule } from './cajas/cajas.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RecibosModule } from './recibos/recibos.module';
import { VouchersModule } from './vouchers/vouchers.module';
import { ProveedoresModule } from './proveedores/proveedores.module';
import { OrdenesIngresoModule } from './ordenes-ingreso/ordenes-ingreso.module';
import { PagosModule } from './pagos/pagos.module';
import { OrdenesPagoModule } from './ordenes-pago/ordenes-pago.module';
import { ScheduleModule } from '@nestjs/schedule';
@Module({
  imports: [
    ConfigModule.forRoot(),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      database: process.env.DB_NAME,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      autoLoadEntities: true,
      synchronize: true,
      ssl:
        process.env.NODE_ENV === 'production'
          ? { rejectUnauthorized: false }
          : false,
    }),
    ProductsModule,
    CommonModule,
    SeedModule,
    FilesModule,
    CategoriesModule,
    ClientsModule,
    VentasModule,
    CajasModule,
    AuthModule,
    UsersModule,
    RecibosModule,
    VouchersModule,
    ProveedoresModule,
    OrdenesIngresoModule,
    PagosModule,
    OrdenesPagoModule,
  ],
})
export class AppModule {}

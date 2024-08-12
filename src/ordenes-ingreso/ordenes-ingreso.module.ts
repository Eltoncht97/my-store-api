import { Module } from '@nestjs/common';
import { OrdenesIngresoService } from './ordenes-ingreso.service';
import { OrdenesIngresoController } from './ordenes-ingreso.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdenIngreso } from './entities/ordenes-ingreso.entity';
import { OrdenIngresoProduct } from './entities/ordenes-ingreso-product';
import { ProveedoresModule } from '../proveedores/proveedores.module';
import { ProductsModule } from '../products/products.module';

@Module({
  controllers: [OrdenesIngresoController],
  providers: [OrdenesIngresoService],
  imports: [
    TypeOrmModule.forFeature([OrdenIngreso, OrdenIngresoProduct]),
    ProveedoresModule,
    ProductsModule,
  ],
  exports: [TypeOrmModule],
})
export class OrdenesIngresoModule {}

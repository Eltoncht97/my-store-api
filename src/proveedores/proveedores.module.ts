import { Module } from '@nestjs/common';
import { ProveedoresService } from './proveedores.service';
import { ProveedoresController } from './proveedores.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Proveedor,
  ProveedorAccount,
  ProveedorAccountMovement,
} from './entities';

@Module({
  controllers: [ProveedoresController],
  providers: [ProveedoresService],
  imports: [
    TypeOrmModule.forFeature([
      Proveedor,
      ProveedorAccount,
      ProveedorAccountMovement,
    ]),
  ],
  exports: [ProveedoresService],
})
export class ProveedoresModule {}

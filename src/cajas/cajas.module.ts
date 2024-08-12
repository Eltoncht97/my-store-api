import { Module } from '@nestjs/common';
import { CajasService } from './cajas.service';
import { CajasController } from './cajas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Caja } from './entities/caja.entity';
import { Movimiento } from './entities/movimiento.entity';
import { AuthModule } from '../auth/auth.module';
import { ClientsModule } from '../clients/clients.module';

@Module({
  controllers: [CajasController],
  providers: [CajasService],
  imports: [
    TypeOrmModule.forFeature([Caja, Movimiento]),
    AuthModule,
    ClientsModule,
  ],
  exports: [TypeOrmModule, CajasService],
})
export class CajasModule {}

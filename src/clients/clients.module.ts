import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsService } from './clients.service';
import { ClientsController } from './clients.controller';
import { Client } from './entities/client.entity';
import { ClientAccount } from './entities/client-account.entity';
import { ClientAccountMovement } from './entities/client-accoun-movement.entity';

@Module({
  controllers: [ClientsController],
  providers: [ClientsService],
  imports: [
    TypeOrmModule.forFeature([Client, ClientAccount, ClientAccountMovement]),
  ],
  exports: [ClientsService, TypeOrmModule],
})
export class ClientsModule {}

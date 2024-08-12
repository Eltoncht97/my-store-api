import { Module } from '@nestjs/common';
import { VouchersService } from './vouchers.service';
import { VouchersController } from './vouchers.controller';
import { Voucher } from './entities/voucher.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  controllers: [VouchersController],
  providers: [VouchersService],
  imports: [TypeOrmModule.forFeature([Voucher])],
  exports: [TypeOrmModule, VouchersService],
})
export class VouchersModule {}

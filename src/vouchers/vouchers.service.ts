import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Voucher, VoucherType } from './entities/voucher.entity';

@Injectable()
export class VouchersService {
  constructor(
    @InjectRepository(Voucher)
    private voucherRepository: Repository<Voucher>,
  ) {}

  async createVoucher(type: VoucherType): Promise<Voucher> {
    const latestVoucher = await this.voucherRepository.findOne({
      where: {
        type,
      },
      order: {
        id: 'DESC',
      },
    });

    let nextVoucherNumber: number;
    if (!latestVoucher) {
      nextVoucherNumber = 1;
    } else {
      nextVoucherNumber = latestVoucher.number + 1;
    }

    const voucher = new Voucher();
    voucher.number = nextVoucherNumber;
    voucher.code = `${type[0]}-${this.padVoucherNumber(nextVoucherNumber, 5)}`;
    voucher.type = type;

    const voucherDB = await this.voucherRepository.save(voucher);

    return voucherDB;
  }

  private padVoucherNumber(num: number, size: number): string {
    let s = num + '';
    while (s.length < size) {
      s = '0' + s;
    }
    return s;
  }
}

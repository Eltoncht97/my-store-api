import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

export enum VoucherType {
  VENTA = 'Venta',
  RECIBO = 'Recibo',
  PAGO = 'Pago',
}

@Entity('vouchers')
export class Voucher {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  code: string;

  @Column()
  number: number;

  @Column({
    type: 'enum',
    enum: VoucherType,
  })
  type: VoucherType;
}

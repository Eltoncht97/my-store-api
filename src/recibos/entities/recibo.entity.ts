import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Client } from '../../clients/entities/client.entity';
import { PaymentMethod } from '../../ventas/interfaces/payment-methods.interface';
import { Voucher } from '../../vouchers/entities/voucher.entity';
import { Venta } from '../../ventas/entities/venta.entity';
import { OneToMany } from 'typeorm';

@Entity({ name: 'recibos' })
export class Recibo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'client_id' })
  clientId: string;

  @Column('text', { name: 'payment_method' })
  paymentMethod: PaymentMethod;

  @Column('float4')
  total: number;

  @CreateDateColumn({ default: new Date() })
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  @ManyToOne(() => Client, (client) => client.recibos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @ManyToOne(() => Voucher, (voucher) => voucher.id)
  voucher: Voucher;

  @OneToMany(() => Venta, (venta) => venta.recibo)
  @JoinColumn({ name: 'venta_id' })
  venta?: Venta;
}

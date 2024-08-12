import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Client } from '../../clients/entities/client.entity';
import { VentaProduct } from './venta-product.entity';
import { PaymentMethod } from '../interfaces/payment-methods.interface';
import { Recibo } from '../../recibos/entities/recibo.entity';
import { Voucher } from '../../vouchers/entities/voucher.entity';

@Entity({ name: 'ventas' })
export class Venta {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Client, (client) => client.ventas, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @Column('date')
  date: Date;

  @Column('text', { name: 'payment_method' })
  paymentMethod: PaymentMethod;

  @Column('float4')
  subtotal: number;

  @Column('float4')
  discount: number;

  @Column('float4')
  total: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Voucher, (voucher) => voucher.id)
  voucher: Voucher;

  @OneToMany(() => VentaProduct, (ventaProduct) => ventaProduct.venta, {
    cascade: true,
  })
  products: VentaProduct[];

  @ManyToOne(() => Recibo, (recibo) => recibo.venta)
  recibo?: Recibo;
}

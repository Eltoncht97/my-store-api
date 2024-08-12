import { Proveedor } from 'src/proveedores/entities';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PaymentMethod } from '../../ventas/interfaces/payment-methods.interface';
import { Voucher } from '../../vouchers/entities/voucher.entity';

@Entity({ name: 'pagos' })
export class Pago {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'proveedor_id' })
  proveedorId: string;

  @Column('text', { name: 'payment_method' })
  paymentMethod: PaymentMethod;

  @Column('float4')
  total: number;

  @CreateDateColumn({ default: new Date() })
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  @ManyToOne(() => Proveedor, (proveedor) => proveedor.pagos, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'proveedor_id' })
  proveedor: Proveedor;

  @ManyToOne(() => Voucher, (voucher) => voucher.id)
  voucher: Voucher;
}

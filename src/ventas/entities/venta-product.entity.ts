import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { Venta } from './venta.entity';

@Entity({ name: 'ventas_products' })
export class VentaProduct {
  @PrimaryGeneratedColumn()
  id: string;

  @ManyToOne(() => Venta, (venta) => venta.products, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'venta_id' })
  venta: Venta;

  @ManyToOne(() => Product, (product) => product.id)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column('float4')
  price: number;

  @Column('integer')
  quantity: number;

  @Column('float')
  subtotal: number;

  @Column('float4')
  discount: number;

  @Column('float4')
  total: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

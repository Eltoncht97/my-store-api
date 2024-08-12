import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { OrdenIngreso } from './ordenes-ingreso.entity';
import { Product } from '../../products/entities/product.entity';
import { DeleteDateColumn } from 'typeorm';

export enum IVA {
  IVA_0 = 'IVA 0',
  IVA_10 = 'IVA 10.5',
  IVA_21 = 'IVA 21',
  IVA_27 = 'IVA 27.5',
}

@Entity({ name: 'ordenes_ingresos_products' })
export class OrdenIngresoProduct {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => OrdenIngreso, (ingreso) => ingreso.products, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'ingreso_id' })
  ingreso: OrdenIngreso;

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
  impuestos: number;

  @Column({
    type: 'enum',
    enum: IVA,
    default: IVA.IVA_21,
    name: 'iva',
  })
  iva: IVA;

  @Column('float4')
  total: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}

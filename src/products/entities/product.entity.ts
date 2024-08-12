import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Category } from '../../categories/entities/category.entity';

export enum IVA {
  IVA_0 = 'IVA 0',
  IVA_10 = 'IVA 10.5',
  IVA_21 = 'IVA 21',
  IVA_27 = 'IVA 27.5',
}

@Entity({ name: 'products' })
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', { unique: true })
  code: string;

  @Column('text')
  name: string;

  @Column({ name: 'category_id' })
  categoryId: string;

  @ManyToOne(() => Category, (category) => category.products, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column('int', { default: 0 })
  stockMin: number;

  @Column('int', { default: 0 })
  stock: number;

  @Column('float', { default: 0 })
  costWithoutIva: number;

  @Column('float', { default: 0 })
  discountPercentage: number;

  @Column('float', { default: 0 })
  discount: number;

  @Column({
    type: 'enum',
    enum: IVA,
    default: IVA.IVA_21,
    name: 'iva_type',
  })
  ivaType: IVA;

  @Column('float', { default: 0 })
  iva: number;

  @Column('float', { default: 0 })
  costPrice: number;

  @Column('float', { default: 0 })
  utilitiesPercentage: number;

  @Column('float', { default: 0 })
  utilities: number;

  @Column('float', { default: 0 })
  price: number;

  @CreateDateColumn({ default: new Date() })
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}

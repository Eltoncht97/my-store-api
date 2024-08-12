import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Proveedor } from '../../proveedores/entities/proveedor.entity';
import { OrdenIngresoProduct } from './ordenes-ingreso-product';
import { CreateDateColumn, DeleteDateColumn } from 'typeorm';
@Entity({ name: 'ordenes_ingresos' })
export class OrdenIngreso {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'proveedor_id' })
  proveedorId: string;

  @ManyToOne(() => Proveedor, (proveedor) => proveedor.ingresos, {
    eager: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'proveedor_id' })
  proveedor: Proveedor;

  @OneToMany(() => OrdenIngresoProduct, (product) => product.ingreso, {
    cascade: true,
  })
  products: OrdenIngresoProduct[];

  @Column('text', { unique: true })
  factura: string;

  @Column('date')
  date: Date;

  @Column('float')
  subtotal: number;

  @Column('float')
  discount: number;

  @Column('float')
  total: number;

  @CreateDateColumn({ default: new Date() })
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  //TODO! agregar productos , proveedor,
}

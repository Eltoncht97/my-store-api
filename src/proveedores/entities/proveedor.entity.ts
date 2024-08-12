import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProveedorAccount } from './proveedor-account.entity';
import { CreateDateColumn, DeleteDateColumn, OneToMany } from 'typeorm';
import { OrdenIngreso } from '../../ordenes-ingreso/entities/ordenes-ingreso.entity';
import { Pago } from 'src/pagos/entities/pago.entity';

@Entity({ name: 'proveedores' })
export class Proveedor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  name: string;

  @Column('text', { nullable: true })
  cuit?: string;

  @Column('text')
  address: string;

  @Column('text')
  phone: string;

  @OneToOne(() => ProveedorAccount, (account) => account.proveedor, {
    eager: true,
  })
  @JoinColumn({ name: 'account_id' })
  account: ProveedorAccount;

  @CreateDateColumn({ default: new Date() })
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  @OneToMany(() => OrdenIngreso, (ingresos) => ingresos.proveedor)
  ingresos: OrdenIngreso[];

  @OneToMany(() => Pago, (pago) => pago.proveedor, { cascade: true })
  pagos: Pago[];
}

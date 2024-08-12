import {
  Column,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
import { Proveedor } from './proveedor.entity';
import { ProveedorAccountMovement } from './proveedor-account-movement.entity';

@Entity({ name: 'proveedores_accounts' })
export class ProveedorAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Proveedor, (proveedor) => proveedor.account, {
    onDelete: 'CASCADE',
  })
  proveedor: Proveedor;

  @Column('float', { default: 0 })
  saldo: number;

  @OneToMany(
    () => ProveedorAccountMovement,
    (movimiento) => movimiento.account,
    {
      cascade: true,
    },
  )
  movimientos?: ProveedorAccountMovement[];
}

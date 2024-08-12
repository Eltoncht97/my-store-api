import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { ProveedorAccount } from './proveedor-account.entity';

export enum MovimientoProveedorType {
  EFECTIVO = 'Efectivo',
  TARJETA_DE_CREDITO = 'Tarjeta de Credito',
  TRANSFERENCIA = 'Transferencia',
  CUENTA_CORRIENTE = 'Cuenta Corriente',
}

@Entity({ name: 'proveedor_account_movements' })
export class ProveedorAccountMovement {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ProveedorAccount, (account) => account.movimientos, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'account_id' })
  account: ProveedorAccount;

  @Column({
    type: 'enum',
    enum: MovimientoProveedorType,
  })
  tipo: MovimientoProveedorType;

  @Column('text')
  description: string;

  @Column('float')
  monto: number;

  @CreateDateColumn({ name: 'created_at', default: new Date() })
  createdAt: Date;

  @Column('text', { name: 'operation_id' })
  operationId: string;
}

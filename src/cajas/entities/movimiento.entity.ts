import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Caja } from './caja.entity';

export enum MovimientoType {
  EFECTIVO = 'Efectivo',
  TARJETA_DE_CREDITO = 'Tarjeta de Credito',
  TARJETA_DE_DEBITO = 'Tarjeta de Debito',
  TRANSFERENCIA = 'Transferencia',
  CUENTA_CORRIENTE = 'Cuenta Corriente',
}

@Entity({ name: 'movimientos' })
export class Movimiento {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Caja, (caja) => caja.movimientos, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'caja_id' })
  caja: Caja;

  @Column({
    type: 'enum',
    enum: MovimientoType,
  })
  tipo: MovimientoType;

  @Column('text')
  description: string;

  @Column('float')
  monto: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

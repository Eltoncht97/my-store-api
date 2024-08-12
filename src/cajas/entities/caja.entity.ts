import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { Movimiento } from './movimiento.entity';
import { CreateDateColumn, DeleteDateColumn } from 'typeorm';

export enum CajaState {
  ABIERTA = 'Abierta',
  CERRADA = 'Cerrada',
}

@Entity({ name: 'cajas' })
export class Caja {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.caja, {
    eager: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @Column('float', { default: 0 })
  efectivo: number;

  @Column('float', { default: 0 })
  transferencias: number;

  @Column('float', { default: 0 })
  credito: number;

  @Column('float', { default: 0 })
  debito: number;

  @Column('float', { name: 'cuenta_corriente', default: 0 })
  cuentaCorriente: number;

  @Column('float', { default: 0 })
  saldo: number;

  @OneToMany(() => Movimiento, (movimiento) => movimiento.caja, {
    cascade: true,
  })
  movimientos?: Movimiento[];

  @Column({
    type: 'enum',
    enum: CajaState,
    default: CajaState.ABIERTA,
  })
  state: CajaState;

  @CreateDateColumn({ default: new Date() })
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}

import {
  Column,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { Client } from './client.entity';
import { ClientAccountMovement } from './client-accoun-movement.entity';

@Entity({ name: 'clients_accounts' })
export class ClientAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Client, (client) => client.account, {
    onDelete: 'CASCADE',
  })
  client: Client;

  @Column('float', { default: 0 })
  saldo: number;

  @OneToMany(() => ClientAccountMovement, (movimiento) => movimiento.account, {
    cascade: true,
  })
  movimientos?: ClientAccountMovement[];

  @CreateDateColumn({ default: new Date() })
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}

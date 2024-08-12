import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { ClientAccount } from './client-account.entity';

@Entity({ name: 'client_account_movements' })
export class ClientAccountMovement {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ClientAccount, (account) => account.movimientos, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'account_id' })
  account: ClientAccount;

  @Column('text')
  tipo: string;

  @Column('text')
  description: string;

  @Column('float')
  monto: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

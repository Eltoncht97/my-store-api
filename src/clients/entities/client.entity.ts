import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ClientAccount } from './client-account.entity';
import { Venta } from '../../ventas/entities/venta.entity';
import { Recibo } from '../../recibos/entities/recibo.entity';

@Entity({ name: 'clients' })
export class Client {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  name: string;

  @Column('text')
  lastname: string;

  @Column('text')
  phone: string;

  @Column('text')
  address: string;

  @Column('text', { unique: true, nullable: true })
  dni: string;

  @CreateDateColumn({ default: new Date() })
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  @OneToOne(() => ClientAccount, (account) => account.client, { eager: true })
  @JoinColumn({ name: 'account_id' })
  account: ClientAccount;

  @OneToMany(() => Venta, (venta) => venta.client)
  ventas: Venta[];

  @OneToMany(() => Recibo, (recibo) => recibo.client)
  recibos: Recibo[];
}

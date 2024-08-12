import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
@Entity({ name: 'ordenes_pago' })
export class OrdenesPago {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', { name: 'proveedor_id' })
  proveedorId: string;

  @Column('text', { name: 'orden_ingreso_id' })
  ordenIngresoId: string;

  @Column('date')
  date: Date;

  @Column('float')
  subtotal: number;

  @Column('float')
  discount: number;

  @Column('float')
  total: number;
}

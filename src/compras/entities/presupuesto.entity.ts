// src/compras/entities/presupuesto.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Proveedor } from '../../proveedores/entities/proveedor.entity';
import { EstadoPresupuesto } from '../enums/compras.enum';

@Entity('presupuesto')
export class Presupuesto {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Proveedor, { nullable: true })
  @JoinColumn({ name: 'id_proveedor' })
  proveedor: Proveedor;

  @Column({ type: 'varchar', length: 150 })
  producto: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  precio: number;

  @Column({ type: 'varchar', length: 100 })
  unidad: string;

  @Column({ type: 'varchar', length: 150 })
  areaMunicipio: string;

  @Column({ type: 'date' })
  fechaSolicitud: string;

  @Column({ type: 'date' })
  fechaEntrega: string;

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @Column({
    type: 'enum',
    enum: EstadoPresupuesto,
    default: EstadoPresupuesto.PENDIENTE,
  })
  estado: EstadoPresupuesto;

  @CreateDateColumn({ nullable: false })
  created_at: Date;
}

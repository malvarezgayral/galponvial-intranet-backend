// src/compras/entities/orden-compra.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Suministro } from './suministro.entity';
import { Proveedor } from '../../proveedores/entities/proveedor.entity';
import { EstadoOrdenCompra, TipoFactura } from '../enums/compras.enum';

@Entity('orden_compra')
export class OrdenCompra {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  numeroOrden: string;

  @ManyToOne(() => Suministro, { nullable: true })
  @JoinColumn({ name: 'id_suministro' })
  suministro: Suministro;

  @ManyToOne(() => Proveedor, { nullable: true })
  @JoinColumn({ name: 'id_proveedor' })
  proveedor: Proveedor;

  @Column({
    type: 'enum',
    enum: TipoFactura,
    nullable: true,
  })
  tipoFactura: TipoFactura;

  @Column({ type: 'varchar', length: 50, nullable: true })
  numeroFactura: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  monto: number;

  @Column({ type: 'date', nullable: true })
  fechaEntrega: string;

  @Column({
    type: 'enum',
    enum: EstadoOrdenCompra,
    default: EstadoOrdenCompra.PENDIENTE,
  })
  estado: EstadoOrdenCompra;

  @Column({ type: 'varchar', length: 100, nullable: true })
  unidad: string;

  @CreateDateColumn({ nullable: false })
  created_at: Date;
}

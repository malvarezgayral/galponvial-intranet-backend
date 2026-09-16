// src/compras/entities/suministro.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { Proveedor } from '../../proveedores/entities/proveedor.entity';
import { Presupuesto } from './presupuesto.entity';
import { SuministroItem } from './suministro-item.entity';

@Entity('suministro')
export class Suministro {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  fecha: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  numeroSuministro: string;

  @ManyToOne(() => Proveedor, { nullable: true })
  @JoinColumn({ name: 'id_proveedor' })
  proveedor: Proveedor;

  @Column({ type: 'varchar', length: 150, nullable: true })
  producto: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  agente: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  jurisdiccion: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  unidadEjecutora: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  dependenciaSolicitante: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  unidad: string;

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @ManyToOne(() => Presupuesto, { nullable: true })
  @JoinColumn({ name: 'id_presupuesto' })
  presupuesto: Presupuesto;

  @OneToMany(() => SuministroItem, (item) => item.suministro, {
    cascade: true,
  })
  items: SuministroItem[];

  @CreateDateColumn({ nullable: false })
  created_at: Date;
}

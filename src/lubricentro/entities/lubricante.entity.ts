// src/lubricentro/entities/lubricante.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Vehiculo } from '../../vehiculos/entities/vehiculo.entity';

@Entity('lubricante')
export class Lubricante {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Vehiculo, (vehiculo) => vehiculo.lubricantes)
  @JoinColumn({ name: 'id_vehiculo' })
  vehiculo: Vehiculo;

  @Column({ type: 'date' })
  fecha: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  ordenRetiro: string;

  @Column({ type: 'float', default: 0 })
  cantidad: number;

  @Column({ type: 'varchar', length: 100 })
  tipo: string;

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @CreateDateColumn({ nullable: false })
  created_at: Date;
}

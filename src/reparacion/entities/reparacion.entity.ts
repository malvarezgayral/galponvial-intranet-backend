// src/reparacion/entities/reparacion.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Vehiculo } from '../../vehiculos/entities/vehiculo.entity';
import { TallerTipo } from '../enums/reparacion.enum';

@Entity('reparacion')
export class Reparacion {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Vehiculo, (vehiculo) => vehiculo.reparaciones)
  @JoinColumn({ name: 'id_vehiculo' })
  vehiculo: Vehiculo;

  @Column({ type: 'text' })
  descripcion: string;

  @Column({
    type: 'enum',
    enum: TallerTipo,
  })
  taller: TallerTipo;

  @Column({ type: 'date' })
  fecha_entrada: string;

  @Column({ type: 'date', nullable: true })
  fecha_salida: string;

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @CreateDateColumn({ nullable: false })
  created_at: Date;
}

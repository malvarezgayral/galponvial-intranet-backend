import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Vehiculo } from './vehiculo.entity';

@Entity('recordatorio')
export class Recordatorio {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  fecha: Date;

  @Column('text')
  descripcion: string;

  @ManyToOne(() => Vehiculo, (vehiculo) => vehiculo.recordatorios)
  @JoinColumn({ name: 'id_vehiculo' })
  vehiculo: Vehiculo;
}

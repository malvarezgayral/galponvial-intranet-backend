import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Vehiculo } from './vehiculo.entity';
import { VehiculoStatus } from '../enums/vehiculo.enum';

@Entity('status_update')
export class StatusUpdate {
  @PrimaryGeneratedColumn()
  id_status: number;

  @Column({
    type: 'enum',
    enum: VehiculoStatus,
  })
  tipo: VehiculoStatus;

  @Column({ type: 'date' })
  fecha_desde: Date;

  @Column({ type: 'date', nullable: true })
  fecha_hasta: Date | null;

  @ManyToOne(() => Vehiculo, (vehiculo) => vehiculo.statusUpdates)
  @JoinColumn({ name: 'id_vehiculo' })
  vehiculo: Vehiculo;
}
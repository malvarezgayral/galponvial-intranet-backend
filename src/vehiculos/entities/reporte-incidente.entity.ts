import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Vehiculo } from './vehiculo.entity';
import { TipoIncidente, CriticidadIncidente, StatusIncidente } from '../enums/vehiculo.enum';

@Entity('reporte_incidente')
export class ReporteIncidente {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('date')
  fecha: Date;

  @Column({
    type: 'enum',
    enum: TipoIncidente,
  })
  tipo: TipoIncidente;

  @Column('text')
  descripcion: string;

  @Column({
    type: 'enum',
    enum: CriticidadIncidente,
  })
  falla: CriticidadIncidente;

  @Column({
    type: 'enum',
    enum: StatusIncidente,
    default: StatusIncidente.PENDIENTE,
  })
  status: StatusIncidente;

  @CreateDateColumn()
  fecha_creacion: Date;

  @ManyToOne(() => Vehiculo)
  @JoinColumn({ name: 'id_vehiculo' })
  vehiculo: Vehiculo;
}
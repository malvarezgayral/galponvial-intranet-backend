import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Vehiculo } from './vehiculo.entity';
import { ReporteIncidente } from './reporte-incidente.entity';
import { TipoServicio } from '../enums/vehiculo.enum';

@Entity('servicio')
export class Servicio {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: TipoServicio,
  })
  tipo: TipoServicio;

  @Column('date')
  fecha_inicio: Date;

  @Column('date')
  fecha_hasta: Date;

  @Column('text', { nullable: true })
  descripcion: string;

  @CreateDateColumn()
  fecha_creacion: Date;

  @ManyToOne(() => Vehiculo)
  @JoinColumn({ name: 'id_vehiculo' })
  vehiculo: Vehiculo;

  @ManyToOne(() => ReporteIncidente, { nullable: true })
  @JoinColumn({ name: 'incidente_id' })
  incidente: ReporteIncidente;
}
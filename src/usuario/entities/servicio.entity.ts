// src/vehiculo/entities/servicio.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ReporteIncidente } from './reporte-incidente.entity';
import { TipoServicio } from 'src/vehiculos/enums/vehiculo.enum';

@Entity('servicio')
export class Servicio {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: TipoServicio,
  })
  tipo: TipoServicio;

  @Column({ type: 'date' })
  fecha_inicio: Date;

  @Column({ type: 'date', nullable: true })
  fecha_hasta: Date | null; 

  @Column({ type: 'text' })
  descripcion: string;

  @Column({ nullable: true })
  incidente_id?: number;

  @ManyToOne(() => ReporteIncidente, (incidente) => incidente.servicios, {
    nullable: true,
  })
  @JoinColumn({ name: 'incidente_id' })
  incidente: ReporteIncidente | null;
}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ReporteIncidente } from './reporte-incidente.entity';

@Entity('servicio')
export class Servicio {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar')
  tipo: string;

  @Column('date')
  fecha_inicio: Date;

  @Column('date')
  fecha_hasta: Date;

  @Column('text')
  descripcion: string;

  @Column({ nullable: true })
  incidente_id: number;

  @ManyToOne(() => ReporteIncidente, (incidente) => incidente.servicios, {
    nullable: true,
  })
  @JoinColumn({ name: 'incidente_id' })
  incidente: ReporteIncidente;
}

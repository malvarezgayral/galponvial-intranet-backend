import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Usuario } from './usuario.entity';
import { Vehiculo } from '../../vehiculos/entities/vehiculo.entity';
import { Servicio } from './servicio.entity';
import { FallaIncidente } from '../enums/usuario.enum';

@Entity('reporte_incidente')
export class ReporteIncidente {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('date')
  fecha: Date;

  @Column('varchar')
  tipo: string;

  @Column('text')
  descripcion: string;

  @Column({
    type: 'enum',
    enum: FallaIncidente,
  })
  falla: FallaIncidente;

  @Column('bigint')
  id_usuario: number;

  @Column()
  id_vehiculo: number;

  @ManyToOne(() => Usuario, (usuario) => usuario.reportesIncidentes)
  @JoinColumn({ name: 'id_usuario' })
  usuario: Usuario;

  @ManyToOne(() => Vehiculo)
  @JoinColumn({ name: 'id_vehiculo' })
  vehiculo: Vehiculo;

  @OneToMany(() => Servicio, (servicio) => servicio.incidente)
  servicios: Servicio[];
}

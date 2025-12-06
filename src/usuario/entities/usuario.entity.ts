import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Rol } from './rol.entity';
import { UsuarioVehiculo } from './usuario-vehiculo.entity';
import { ReporteIncidente } from './reporte-incidente.entity';

@Entity('usuario')
export class Usuario {
  @PrimaryColumn('bigint')
  dni: number;

  @Column()
  nombre: string;

  @Column()
  apellido: string;

  @Column('date')
  fecha_alta: Date;

  @Column('date', { nullable: true })
  fecha_baja: Date;

  @ManyToOne(() => Rol, (rol) => rol.usuarios)
  @JoinColumn({ name: 'rol_id' })
  rol: Rol;

  @Column()
  rol_id: number;

  @OneToMany(() => UsuarioVehiculo, (uv) => uv.usuario)
  vehiculos: UsuarioVehiculo[];

  @OneToMany(() => ReporteIncidente, (ri) => ri.usuario)
  reportesIncidentes: ReporteIncidente[];
}

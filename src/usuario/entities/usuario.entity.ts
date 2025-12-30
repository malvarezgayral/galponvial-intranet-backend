import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { Rol } from './rol.entity';
import { UsuarioVehiculo } from './usuario-vehiculo.entity';
import { ReporteIncidente } from './reporte-incidente.entity';
import { RefreshToken } from './refresh-token.entity';

@Entity('usuario')
export class Usuario {
  @PrimaryColumn('bigint')
  dni: number;

  @Column()
  nombre: string;

  @Column()
  apellido: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column('boolean', { default: false })
  isActive: boolean;

  @Column('int', { default: 0 })
  tokenVersion: number;

  @Column('date')
  fecha_alta: Date;

  @Column('date', { nullable: true })
  fecha_baja: Date;

  @ManyToOne(() => Rol, (rol) => rol.usuarios, { nullable: true })
  @JoinColumn({ name: 'rol_id' })
  rol: Rol;

  @OneToMany(() => UsuarioVehiculo, (uv) => uv.usuario)
  vehiculos: UsuarioVehiculo[];

  @OneToMany(() => ReporteIncidente, (ri) => ri.usuario)
  reportesIncidentes: ReporteIncidente[];

  @OneToOne(() => RefreshToken, (rt) => rt.usuario)
  refreshToken: RefreshToken;
}

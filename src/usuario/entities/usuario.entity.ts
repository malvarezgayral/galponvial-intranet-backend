import { Entity, PrimaryColumn, Column, OneToMany, OneToOne } from 'typeorm';
import { Rol } from './rol.entity';
import { UsuarioRol } from './usuario-rol.entity';
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

  @Column('date', { nullable: true })
  fecha_alta: Date | null;

  @Column('date', { nullable: true })
  fecha_baja: Date | null;

  @OneToMany(() => UsuarioRol, (ur) => ur.usuario, {
    cascade: true,
    eager: true,
  })
  usuarioRoles: UsuarioRol[];

  // Getter para acceso conveniente a roles
  get roles(): Rol[] {
    return this.usuarioRoles?.map((ur) => ur.rol) ?? [];
  }

  @OneToMany(() => UsuarioVehiculo, (uv) => uv.usuario)
  vehiculos: UsuarioVehiculo[];

  @OneToMany(() => ReporteIncidente, (ri) => ri.usuario)
  reportesIncidentes: ReporteIncidente[];

  @OneToOne(() => RefreshToken, (rt) => rt.usuario)
  refreshToken: RefreshToken | null;
}

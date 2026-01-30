import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Permisos, ValidRoles } from '../enums/usuario.enum';
import { UsuarioRol } from './usuario-rol.entity';

@Entity('rol')
export class Rol {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: Permisos,
    array: true,
  })
  permisos: Permisos[];

  @Column({
    type: 'enum',
    enum: ValidRoles,
  })
  rol: ValidRoles;

  @OneToMany(() => UsuarioRol, (ur) => ur.rol)
  usuarioRoles: UsuarioRol[];
}

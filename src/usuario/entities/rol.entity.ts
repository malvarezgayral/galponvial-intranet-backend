import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Permisos, ValidRoles } from '../enums/usuario.enum';
import { Usuario } from './usuario.entity';

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

  @OneToMany(() => Usuario, (usuario) => usuario.rol)
  usuarios: Usuario[];
}

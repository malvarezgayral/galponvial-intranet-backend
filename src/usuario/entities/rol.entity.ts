import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { RolTipo, Permiso } from '../enums/usuario.enum';
import { Usuario } from './usuario.entity';

@Entity('rol')
export class Rol {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: RolTipo,
  })
  tipo: RolTipo;

  @Column({
    type: 'enum',
    enum: Permiso,
    array: true,
  })
  permisos: Permiso[];

  @OneToMany(() => Usuario, (usuario) => usuario.rol)
  usuarios: Usuario[];
}

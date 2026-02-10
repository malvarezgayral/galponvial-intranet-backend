import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Usuario } from './usuario.entity';
import { Vehiculo } from '../../vehiculos/entities/vehiculo.entity';

@Entity('usuario_vehiculo')
export class UsuarioVehiculo {
  @PrimaryGeneratedColumn()
  id_usuario_vehiculo: number;

  @Column()
  id_vehiculo: number;

  @Column('bigint')
  id_usuario: number;

  @Column('date')
  fecha_desde: Date;

  @Column('date', { nullable: true })
  fecha_hasta: Date | null;

  @ManyToOne(() => Usuario, (usuario) => usuario.vehiculos)
  @JoinColumn({ name: 'id_usuario' })
  usuario: Usuario;

  @ManyToOne(() => Vehiculo)
  @JoinColumn({ name: 'id_vehiculo' })
  vehiculo: Vehiculo;
}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Usuario } from '../../usuario/entities/usuario.entity';

@Entity('recordatorio')
export class Recordatorio {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'timestamp', nullable: true })
  fecha: Date;

  @Column('text')
  descripcion: string;

  @ManyToOne(() => Usuario, (usuario) => usuario.recordatorios)
  @JoinColumn({ name: 'dni_usuario' })
  usuario: Usuario;
}

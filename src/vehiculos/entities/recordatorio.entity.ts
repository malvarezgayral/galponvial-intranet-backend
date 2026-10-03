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

  // Destino del recordatorio: un admin puntual (destino_dni)
  // o todos (para_todos). Ambos vacíos = sin destino (recordatorios viejos).
  @Column({ name: 'destino_dni', type: 'bigint', nullable: true })
  destinoDni: number | null;

  @Column({ name: 'para_todos', type: 'boolean', default: false })
  paraTodos: boolean;
}

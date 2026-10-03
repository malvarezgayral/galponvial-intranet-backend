// src/notificaciones/entities/notificacion-lectura.entity.ts
import { Entity, PrimaryColumn, CreateDateColumn } from 'typeorm';

// Una fila = esa persona ya leyo ese aviso. El "leido" es independiente por persona.
@Entity('notificacion_lectura')
export class NotificacionLectura {
  @PrimaryColumn({ name: 'notificacion_id', type: 'int' })
  notificacionId!: number;

  @PrimaryColumn({ type: 'bigint' })
  dni!: number;

  @CreateDateColumn()
  fecha!: Date;
}

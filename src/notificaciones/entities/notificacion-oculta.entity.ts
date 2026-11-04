// src/notificaciones/entities/notificacion-oculta.entity.ts
import { Entity, PrimaryColumn, CreateDateColumn } from 'typeorm';

// Una fila = esa persona elimino (oculto) ese aviso. Al resto le sigue apareciendo.
@Entity('notificacion_oculta')
export class NotificacionOculta {
  @PrimaryColumn({ name: 'notificacion_id', type: 'int' })
  notificacionId!: number;

  @PrimaryColumn({ type: 'bigint' })
  dni!: number;

  @CreateDateColumn()
  fecha!: Date;
}

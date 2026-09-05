// src/notificaciones/entities/notificacion.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('notificacion')
export class Notificacion {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 30 })
  tipo!: string;

  @Column({ type: 'varchar', length: 150 })
  titulo!: string;

  @Column({ type: 'text' })
  mensaje!: string;

  @CreateDateColumn()
  fecha!: Date;

  @Column({ type: 'boolean', default: false })
  leida!: boolean;

  @Column({ name: 'dni_usuario', type: 'bigint' })
dniUsuario!: number;
}
// src/mensajes-privados/entities/grupo-lectura.entity.ts
import { Entity, PrimaryColumn, Column } from 'typeorm';

// Hasta que mensaje del "Grupo Galpon Vial" leyo cada admin (para contar los sin leer)
@Entity('mensaje_grupo_lectura')
export class GrupoLectura {
  @PrimaryColumn({ type: 'bigint' })
  dni!: number;

  @Column({ name: 'ultimo_id', type: 'int', default: 0 })
  ultimoId!: number;
}

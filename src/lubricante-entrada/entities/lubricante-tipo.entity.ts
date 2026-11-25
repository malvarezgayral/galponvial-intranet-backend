// src/lubricante-entrada/entities/lubricante-tipo.entity.ts
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** Lista de tipos de lubricante. Se administra desde Eliminar/Editar Lubricante. */
@Entity('lubricante_tipo')
export class LubricanteTipo {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  nombre!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}

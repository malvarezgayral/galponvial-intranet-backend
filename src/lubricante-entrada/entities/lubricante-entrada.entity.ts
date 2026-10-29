// src/lubricante-entrada/entities/lubricante-entrada.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('lubricante_entrada')
export class LubricanteEntrada {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'date' })
  fecha!: string;

  @Column({ type: 'varchar', length: 100 })
  tipo!: string;

  @Column({ name: 'nro_remito', type: 'varchar', length: 50, nullable: true })
  nroRemito!: string | null;

  @Column({ type: 'float' })
  cantidad!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}

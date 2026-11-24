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

  @Column({ name: 'cantidad_salida', type: 'float', default: 0 })
  cantidadSalida!: number;

  @Column({ name: 'fecha_estado', type: 'date', nullable: true })
  fechaEstado!: string | null;

  /** DNI del usuario que cargó el registro (bigint: TypeORM lo devuelve como texto). */
  @Column({ name: 'creado_por_dni', type: 'bigint', nullable: true })
  creadoPorDni!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}

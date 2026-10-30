// src/lubricante-entrada/entities/lubricante-stock-historial.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('lubricante_stock_historial')
export class LubricanteStockHistorial {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'entrada_id', type: 'int' })
  entradaId!: number;

  @Column({ name: 'fecha_estado', type: 'date' })
  fechaEstado!: string;

  @Column({ type: 'varchar', length: 100 })
  tipo!: string;

  @Column({ name: 'cantidad_entrada', type: 'float' })
  cantidadEntrada!: number;

  @Column({ name: 'cantidad_salida', type: 'float' })
  cantidadSalida!: number;

  @Column({ name: 'estado_parcial', type: 'float' })
  estadoParcial!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}

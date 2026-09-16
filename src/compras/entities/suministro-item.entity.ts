// src/compras/entities/suministro-item.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Suministro } from './suministro.entity';

@Entity('suministro_item')
export class SuministroItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Suministro, (suministro) => suministro.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_suministro' })
  suministro: Suministro;

  @Column({ type: 'varchar', length: 100, nullable: true })
  cantidad: string;

  @Column({ type: 'varchar', length: 250, nullable: true })
  descripcion: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  costoUnitario: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  costoEstimado: number;
}

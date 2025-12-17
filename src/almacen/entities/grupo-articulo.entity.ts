/* eslint-disable prettier/prettier */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { SectorGalpon } from './sector-galpon.entity';

@Entity('grupo_articulo')
export class GrupoArticulo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column('text')
  descripcion: string;

  @ManyToOne(() => SectorGalpon)
  @JoinColumn({ name: 'ubicacion' })
  sector: SectorGalpon;
}

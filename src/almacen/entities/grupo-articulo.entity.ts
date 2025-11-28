import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { SectorGalpon } from './sector-galpon.entity';

@Entity('grupo_articulo')
export class GrupoArticulo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column('text')
  descripcion: string;

  @ManyToOne(() => SectorGalpon)
  @JoinColumn({ name: 'ubicacion' })
  sector: SectorGalpon;
}

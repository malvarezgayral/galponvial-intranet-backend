/* eslint-disable prettier/prettier */
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { SectorTipo } from '../enums/almacen.enum';

@Entity('sector_galpon')
export class SectorGalpon {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int')
  nro_sector: number;

  @Column({
    type: 'enum',
    enum: SectorTipo,
  })
  tipo: SectorTipo;

  @Column('text')
  descripcion: string;
}

import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('sector_galpon')
export class SectorGalpon {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nro_sector: number;

  @Column('text')
  descripcion: string;
}

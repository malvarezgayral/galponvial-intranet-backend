import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('sector')
export class Sector {
  @PrimaryGeneratedColumn()
  id_sector: number;

  @Column('varchar', { length: 20 })
  nombre: string;
}

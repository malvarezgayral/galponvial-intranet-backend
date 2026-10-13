import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('jurisdiccion')
export class Jurisdiccion {
  @PrimaryGeneratedColumn()
  id_jurisdiccion: number;

  @Column('varchar', { length: 20 })
  nombre: string;
}

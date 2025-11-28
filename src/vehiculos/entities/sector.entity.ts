import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('sector')
export class Sector {
  @PrimaryGeneratedColumn()
  id_sector: number;

  @Column()
  nombre: string;
}

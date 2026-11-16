import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Dependencia } from './dependencia.entity';

@Entity('jurisdiccion')
export class Jurisdiccion {
  @PrimaryGeneratedColumn()
  id_jurisdiccion: number;

  @Column('varchar', { length: 80 })
  nombre: string;

  @OneToMany(() => Dependencia, (dependencia) => dependencia.jurisdiccion)
  dependencias: Dependencia[];
}

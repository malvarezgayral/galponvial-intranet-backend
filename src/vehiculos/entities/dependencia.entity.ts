import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Jurisdiccion } from './jurisdiccion.entity';

@Entity('dependencia')
export class Dependencia {
  @PrimaryGeneratedColumn()
  id_dependencia: number;

  @Column('varchar', { length: 100 })
  nombre: string;

  @Index()
  @ManyToOne(() => Jurisdiccion, (jurisdiccion) => jurisdiccion.dependencias, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'id_jurisdiccion' })
  jurisdiccion: Jurisdiccion;
}

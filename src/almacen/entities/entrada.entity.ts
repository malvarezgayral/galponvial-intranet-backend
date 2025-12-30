/* eslint-disable prettier/prettier */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Movimiento } from './movimiento.entity';
import { EntradaTipo } from '../enums/almacen.enum';

@Entity('entrada')
export class Entrada {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: EntradaTipo,
  })
  tipo: EntradaTipo;

  @Column('text')
  detalle: string;

  @Column('varchar', { length: 100 })
  proveedor: string;

  @OneToOne(() => Movimiento)
  @JoinColumn({ name: 'movimiento_id' })
  movimiento: Movimiento;
}

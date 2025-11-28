import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Movimiento } from './movimiento.entity';

export enum EntradaTipo {
  COMPRA = 'compra',
  INVENTARIO_INICIAL = 'inventario inicial',
  CAMBIO = 'cambio',
  TRASPASO = 'traspaso',
  CAMBIO_UNIDAD = 'cambio de unidad',
  ALQUILER = 'alquiler',
}

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

  @Column()
  proveedor: string;

  @OneToOne(() => Movimiento)
  @JoinColumn({ name: 'movimiento_id' })
  movimiento: Movimiento;
}

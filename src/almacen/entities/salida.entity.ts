import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Movimiento } from './movimiento.entity';

export enum SalidaTipo {
  ROTURA = 'rotura',
  PERDIDA = 'perdida',
  CONSUMO = 'consumo',
  ROBO = 'robo',
  DEVOLUCION = 'devolucion',
}

@Entity('salida')
export class Salida {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: SalidaTipo,
  })
  tipo: SalidaTipo;

  @Column('text')
  detalle: string;

  @Column()
  motivo_salida: string;

  @Column('text')
  detalle_motivo: string;

  @OneToOne(() => Movimiento)
  @JoinColumn({ name: 'movimiento_id' })
  movimiento: Movimiento;
}

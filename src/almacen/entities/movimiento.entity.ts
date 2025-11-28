import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Articulo } from './articulo.entity';
import { MovimientoTipo } from '../enums/almacen.enum';

@Entity('movimiento')
export class Movimiento {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: MovimientoTipo,
  })
  tipo: MovimientoTipo;

  @Column({ type: 'date' })
  fecha: string;

  @ManyToOne(() => Articulo, art => art.movimientos)
  @JoinColumn({ name: 'articulo_id' })
  articulo: Articulo;

  @Column()
  usuario_id: number; // se relaciona con usuario.dni
}

/* eslint-disable prettier/prettier */
import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UnidadTipo } from '../enums/almacen.enum';
import { GrupoArticulo } from './grupo-articulo.entity';
import { UnidadMedidaCuant } from './unidad-medida-cuant.entity';
import { Movimiento } from './movimiento.entity';

@Entity('articulo')
export class Articulo {
  @PrimaryGeneratedColumn()
  cod: number;

  @Column({ nullable: true })
  cod_proveedor?: string;

  @Column()
  nombre: string;

  @Column()
  modelo: string;

  @Column('text')
  descripcion: string;

  @Column({ type: 'text', nullable: true })
  img_url: string;

  @Column({ type: 'int', nullable: true })
  stock?: number;

  @Column({
    type: 'enum',
    enum: UnidadTipo,
  })
  unidad_tipo: UnidadTipo;

  @ManyToOne(() => GrupoArticulo)
  @JoinColumn({ name: 'grupo_id' })
  grupo: GrupoArticulo;

  @ManyToOne(() => UnidadMedidaCuant, { nullable: true })
  @JoinColumn({ name: 'unidad_medida_id' })
  unidadMedida: UnidadMedidaCuant;

  @OneToMany(() => Movimiento, (mov) => mov.articulo)
  movimientos: Movimiento[];
}

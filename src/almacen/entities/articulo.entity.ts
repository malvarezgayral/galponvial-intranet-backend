/* eslint-disable prettier/prettier */
import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { UnidadTipo } from '../enums/almacen.enum';
import { GrupoArticulo } from './grupo-articulo.entity';
import { UnidadMedidaCuant } from './unidad-medida-cuant.entity';
import { Movimiento } from './movimiento.entity';

@Entity('articulo')
export class Articulo {
  @PrimaryColumn('uuid')
  cod: string;

  @Column()
  nombre: string;

  @Column()
  modelo: string;

  @Column('text')
  descripcion: string;

  @Column('text')
  img_url: string;

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

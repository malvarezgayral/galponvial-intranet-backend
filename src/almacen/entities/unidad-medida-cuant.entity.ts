import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { UnidadCuantTipo } from '../enums/almacen.enum';

@Entity('unidad_medida_cuant')
export class UnidadMedidaCuant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: UnidadCuantTipo,
  })
  tipo: UnidadCuantTipo;

  @Column('float')
  cantidad: number;
}

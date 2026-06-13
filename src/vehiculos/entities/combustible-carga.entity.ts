import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Vehiculo } from './vehiculo.entity';

@Entity('combustible_carga')
export class CombustibleCarga {
  @PrimaryGeneratedColumn()
  id_carga!: number;

  @Column({ type: 'date' })
  fecha_carga!: Date;

  @Column({ nullable: true })
  despachante!: string;

  @Column({ type: 'varchar', length: 50 })
  tipo_combustible!: string;

  @Column('float')
  km_actual!: number;

  @Column('float')
  cant_combustible_despachado!: number;

  @Column({ type: 'varchar', length: 150 })
  chofer!: string;

  @Column({ type: 'varchar', length: 150 })
  estacion_servicio!: string;

  @Column('float')
  litros_entrada!: number;

  @Column('float')
  litros_salida!: number;

  @Column({ type: 'varchar', length: 255 })
  estado_parcial!: string;

  @ManyToOne(() => Vehiculo, (vehiculo) => vehiculo.cargas)
  @JoinColumn({ name: 'id_vehiculo' })
  vehiculo!: Vehiculo;
}

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Vehiculo } from './vehiculo.entity';

@Entity('combustible_carga')
export class CombustibleCarga {
  @PrimaryGeneratedColumn()
  id_carga: number;

  @Column({ type: 'date' })
  fecha_carga: string;

  @Column({ nullable: true })
  despachante: string;

  @Column('float')
  km_actual: number;

  @Column('float')
  cant_combustible_despachado: number;

  @ManyToOne(() => Vehiculo, vehiculo => vehiculo.cargas)
  @JoinColumn({ name: 'id_vehiculo' })
  vehiculo: Vehiculo;
}

// src/filtro-service/entities/filtro-service.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Vehiculo } from '../../vehiculos/entities/vehiculo.entity';

@Entity('filtro_service')
export class FiltroService {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'id_vehiculo', type: 'int', nullable: true })
  idVehiculo!: number | null;

  @ManyToOne(() => Vehiculo, { nullable: true })
  @JoinColumn({ name: 'id_vehiculo' })
  vehiculoRef!: Vehiculo | null;

  @Column({ type: 'date', nullable: true })
  fecha!: string | null;

  @Column({ name: 'tipo_filtro', type: 'varchar', length: 150 })
  tipoFiltro!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  codigo!: string | null;

  @Column({ type: 'int', default: 1 })
  cantidad!: number;
}

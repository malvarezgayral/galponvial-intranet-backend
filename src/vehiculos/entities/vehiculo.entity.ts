import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { InfoAdicional } from './info-adicional.entity';
import { StatusUpdate } from './status-update.entity';
import { CombustibleCarga } from './combustible-carga.entity';
import { Recordatorio } from './recordatorio.entity';

export enum VehiculoStatus {
  DISPONIBLE = 'disponible',
  EN_TALLER = 'en taller',
  FUERA_DE_SERVICIO = 'fuera de servicio',
}

@Entity('vehiculo')
export class Vehiculo {
  @PrimaryGeneratedColumn()
  id_vehiculo: number;

  @Column()
  nombre: string;

  @Column()
  marca: string;

  @Column()
  modelo: string;

  @Column('year')
  anio: number;

  @Column({
    type: 'enum',
    enum: VehiculoStatus,
  })
  status: VehiculoStatus;

  @Column('float')
  uso_combustible: number;

  @Column('float')
  uso_km: number;

  @Column('varchar', { length: 20 })
  tipo_vehiculo: string;

  @OneToOne(() => InfoAdicional, (info) => info.vehiculo)
  infoAdicional: InfoAdicional;

  @OneToMany(() => StatusUpdate, (status) => status.vehiculo)
  statusUpdates: StatusUpdate[];

  @OneToMany(() => CombustibleCarga, (carga) => carga.vehiculo)
  cargas: CombustibleCarga[];

  @OneToMany(() => Recordatorio, (rec) => rec.vehiculo)
  recordatorios: Recordatorio[];
}

import { Entity, PrimaryGeneratedColumn, Column, OneToOne, OneToMany } from 'typeorm';
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

  @Column({ nullable: true })
  ubicacion: string;

  @Column()
  nombre: string;

  @Column()
  marca: string;

  @Column()
  modelo: string;

  @Column()
  anio: number;

  @Column({
    type: 'enum',
    enum: VehiculoStatus,
  })
  status: VehiculoStatus;

  @Column('float', { nullable: true })
  uso_combustible: number;

  @Column('float', { nullable: true })
  uso_km: number;

  @Column()
  tipo_vehiculo: string;

  @OneToOne(() => InfoAdicional, info => info.vehiculo)
  infoAdicional: InfoAdicional;

  @OneToMany(() => StatusUpdate, status => status.vehiculo)
  statusUpdates: StatusUpdate[];

  @OneToMany(() => CombustibleCarga, carga => carga.vehiculo)
  cargas: CombustibleCarga[];

  @OneToMany(() => Recordatorio, rec => rec.vehiculo)
  recordatorios: Recordatorio[];
}

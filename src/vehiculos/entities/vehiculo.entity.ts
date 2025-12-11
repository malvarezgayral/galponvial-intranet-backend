import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { InfoAdicional } from './info-adicional.entity';
import { StatusUpdate } from './status-update.entity';
import { CombustibleCarga } from './combustible-carga.entity';
import { Recordatorio } from './recordatorio.entity';
import { VehiculoStatus, TipoVehiculo, UnidadMedidaUso, UnidadMedidaCombustible } from '../enums/vehiculo.enum';

@Entity('vehiculo')
export class Vehiculo {
  @PrimaryGeneratedColumn()
  id_vehiculo: number;

  @Column('varchar', { length: 100 })
  nombre: string;

  @Column('varchar', { length: 50 })
  marca: string;

  @Column('varchar', { length: 50 })
  modelo: string;

  @Column('int')
  anio: number;

  @Column({
    type: 'enum',
    enum: VehiculoStatus,
    default: VehiculoStatus.DISPONIBLE,
  })
  status: VehiculoStatus;

  @Column('float', { default: 0 })
  uso_combustible: number;

  @Column('float', { default: 0 })
  uso_km: number;

  @Column({
    type: 'enum',
    enum: TipoVehiculo,
  })
  tipo_vehiculo: TipoVehiculo;

  @Column({
    type: 'enum',
    enum: UnidadMedidaUso,
    default: UnidadMedidaUso.KILOMETROS,
  })
  unidad_medida_uso: UnidadMedidaUso;

  @Column({
    type: 'enum',
    enum: UnidadMedidaCombustible,
    default: UnidadMedidaCombustible.LITROS,
  })
  unidad_medida_combustible: UnidadMedidaCombustible;

  @CreateDateColumn()
  fecha_registro: Date;

  @UpdateDateColumn()
  fecha_actualizacion: Date;

  // Relaciones
  @OneToOne(() => InfoAdicional, (info) => info.vehiculo, { cascade: true })
  infoAdicional: InfoAdicional;

  @OneToMany(() => StatusUpdate, (status) => status.vehiculo)
  statusUpdates: StatusUpdate[];

  @OneToMany(() => CombustibleCarga, (carga) => carga.vehiculo)
  cargas: CombustibleCarga[];

  @OneToMany(() => Recordatorio, (rec) => rec.vehiculo)
  recordatorios: Recordatorio[];
}
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { InfoAdicional } from './info-adicional.entity';
import { StatusUpdate } from './status-update.entity';
import { CombustibleCarga } from './combustible-carga.entity';
import { Recordatorio } from './recordatorio.entity';
import { VehiculoStatus, TipoVehiculo } from '../enums/vehiculo.enum';
import { UsuarioVehiculo } from '../../usuario/entities/usuario-vehiculo.entity';

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

  @CreateDateColumn({ nullable: false })
  created_at: Date;

  // Relaciones
  @OneToOne(() => InfoAdicional, (info) => info.vehiculo, { cascade: true })
  infoAdicional: InfoAdicional;

  @OneToMany(() => StatusUpdate, (status) => status.vehiculo)
  statusUpdates: StatusUpdate[];

  @OneToMany(() => CombustibleCarga, (carga) => carga.vehiculo)
  cargas: CombustibleCarga[];

  @OneToMany(() => Recordatorio, (rec) => rec.vehiculo)
  recordatorios: Recordatorio[];

  @OneToMany(() => UsuarioVehiculo, (uv) => uv.vehiculo)
  usuarios: UsuarioVehiculo[];
}

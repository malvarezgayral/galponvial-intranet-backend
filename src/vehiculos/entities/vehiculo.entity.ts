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
import { VehiculoStatus } from '../enums/vehiculo.enum';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { UsuarioVehiculo } from 'src/usuario/entities/usuario-vehiculo.entity';

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

  @Column('date')
  anio: Date;

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

  @OneToMany(() => UsuarioVehiculo, (uv) => uv.vehiculo)
  usuarios: UsuarioVehiculo[];
}

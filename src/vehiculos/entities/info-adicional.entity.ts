import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Vehiculo } from './vehiculo.entity';
import { Sector } from './sector.entity';

@Entity('info_adicional')
export class InfoAdicional {
  @PrimaryGeneratedColumn()
  id_info_adicional: number;

  // Ya no se carga desde el formulario; se conserva para los datos viejos
  @Column('bigint', { nullable: true })
  numero_serie: number | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  numero_motor: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  numero_chasis: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  tipo_combustible: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true, unique: true })
  patente: string | null;

  @Column()
  licencia_conductor: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  licencia_categoria: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  licencia_clase: string | null;

  @Column({ type: 'date', nullable: true })
  licencia_vencimiento: string | null;

  @Column('varchar', { length: 15 })
  color: string;

  @Column()
  seguro_empresa: string;

  @Column()
  poliza: string;

  @ManyToOne(() => Sector)
  @JoinColumn({ name: 'id_sector_pertenencia' })
  sector: Sector;

  @OneToOne(() => Vehiculo, (vehiculo) => vehiculo.infoAdicional)
  @JoinColumn({ name: 'id_vehiculo' })
  vehiculo: Vehiculo;
}

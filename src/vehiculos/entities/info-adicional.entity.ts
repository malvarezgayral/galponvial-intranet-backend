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

  @Column('bigint', { nullable: true })
  numero_serie: number;

  @Column({ nullable: true })
  licencia_conductor: string;

  @Column('varchar', { length: 15, nullable: true })
  color: string;

  @Column()
  seguro_empresa: string;

  @Column()
  poliza: string;

  @Column('varchar', { length: 50, nullable: true })
  grupo: string;

  @ManyToOne(() => Sector, { nullable: true })
  @JoinColumn({ name: 'id_sector_pertenencia' })
  sector: Sector;

  @OneToOne(() => Vehiculo, (vehiculo) => vehiculo.infoAdicional)
  @JoinColumn({ name: 'id_vehiculo' })
  vehiculo: Vehiculo;
}
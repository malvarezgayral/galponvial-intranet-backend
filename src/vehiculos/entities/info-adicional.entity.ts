import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, ManyToOne } from 'typeorm';
import { Vehiculo } from './vehiculo.entity';
import { Sector } from './sector.entity';

@Entity('info_adicional')
export class InfoAdicional {
  @PrimaryGeneratedColumn()
  id_info_adicional: number;

  @Column('bigint')
  numero_serie: number;

  @Column()
  licencia_conductor: string;

  @Column()
  color: string;

  @Column()
  seguro_empresa: string;

  @Column()
  poliza: string;

  @ManyToOne(() => Sector)
  @JoinColumn({ name: 'id_sector_pertenencia' })
  sector: Sector;

  @OneToOne(() => Vehiculo, vehiculo => vehiculo.infoAdicional)
  @JoinColumn({ name: 'id_vehiculo' })
  vehiculo: Vehiculo;
}

import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('combustible_carro')
export class CombustibleCarro {
  @PrimaryGeneratedColumn()
  id_carro!: number;

  @Column({ type: 'date' })
  fecha_carga!: Date;

  @Column({ type: 'varchar', length: 150 })
  chofer!: string;

  @Column({ type: 'varchar', length: 150 })
  estacion_servicio!: string;

  @Column({ type: 'varchar', length: 150 })
  despachante!: string;

  @Column({ type: 'varchar', length: 50 })
  tipo_combustible!: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  galpon_vial?: string;

  @Column('float')
  litros_entrada!: number;

  @Column('float')
  litros_salida!: number;

  @Column({ type: 'varchar', length: 255 })
  estado_parcial!: string;
}

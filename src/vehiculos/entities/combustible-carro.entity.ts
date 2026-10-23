import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('combustible_carro')
export class CombustibleCarro {
  @PrimaryGeneratedColumn()
  id_carro!: number;

  @Column({ type: 'varchar', length: 150 })
  maquina!: string;

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

  @Column({ type: 'float', default: 0 })
  litros_entrada!: number;

  @Column({ type: 'float', default: 0 })
  litros_salida!: number;

  @Column({ type: 'float' })
  total_combustible!: number;

  @Column({ type: 'float' })
  estado_parcial!: number;

  @Column({ type: 'varchar', length: 100 })
  registrada_por_nombre!: string;

  @Column({ type: 'varchar', length: 100 })
  registrada_por_apellido!: string;

  @Column({ type: 'varchar', length: 20 })
  registrada_por_dni!: string;
}

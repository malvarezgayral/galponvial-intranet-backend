// src/personal/entities/registro-administrativo.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('registro_administrativo')
export class RegistroAdministrativo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({ type: 'varchar', length: 100 })
  apellido: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  legajo: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  categoriaActual: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  tipoDni: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  numeroDni: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  numeroCuil: string | null;

  @Column({ type: 'varchar', length: 150, nullable: true })
  secretariaACargo: string | null;

  @Column({ type: 'varchar', length: 150, nullable: true })
  direccionACargo: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  tipoCargo: string | null;

  @Column({ type: 'varchar', length: 150, nullable: true })
  areaEspecifica: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  antiguedad: string | null;

  @Column({ type: 'date', nullable: true })
  fechaIngreso: string | null;

  // Historial académico y de salud
  @Column({ type: 'varchar', length: 30, nullable: true })
  estudiosAlcanzados: string | null;

  @Column({ type: 'varchar', length: 150, nullable: true })
  titulo: string | null;

  // Licencia anual
  @Column({ type: 'date', nullable: true })
  licAnualFechaPresentada: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  licAnualAsunto: string | null;

  @Column({ type: 'varchar', length: 4, nullable: true })
  licAnualAnio: string | null;

  @Column({ type: 'date', nullable: true })
  licAnualDesde: string | null;

  @Column({ type: 'date', nullable: true })
  licAnualHasta: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  licAnualDias: string | null;

  @Column({ type: 'text', nullable: true })
  licAnualObservaciones: string | null;

  // Licencia de conducir
  @Column({ type: 'varchar', length: 30, nullable: true })
  licConducirCategoria: string | null;

  @Column({ type: 'date', nullable: true })
  licConducirDesde: string | null;

  @Column({ type: 'date', nullable: true })
  licConducirHasta: string | null;

  // Unidad a cargo
  @Column({ type: 'date', nullable: true })
  unidadACargoDesde: string | null;

  // Situación de revista
  @Column({ type: 'date', nullable: true })
  plantaPermanenteDesde: string | null;

  @Column({ type: 'date', nullable: true })
  temporarioMensualizadoDesde: string | null;

  @Column({ type: 'date', nullable: true })
  destajistaDesde: string | null;

  @Column({ type: 'date', nullable: true })
  planesEmpleoDesde: string | null;

  @Column({ type: 'date', nullable: true })
  cooperativaDesde: string | null;

  @Column({ type: 'date', nullable: true })
  cargoTemporarioDesde: string | null;

  @Column({ type: 'date', nullable: true })
  cargoTemporarioHasta: string | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

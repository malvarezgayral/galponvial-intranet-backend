// src/personal/entities/documentacion-personal.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('documentacion_personal')
export class DocumentacionPersonal {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({ type: 'varchar', length: 100 })
  apellido: string;

  @Column({ type: 'varchar', length: 20 })
  numeroDocumento: string;

  @Column({ type: 'varchar', length: 20 })
  numeroCuil: string;

  @Column({ type: 'date' })
  fechaNacimiento: string;

  // Domicilio actual
  @Column({ type: 'varchar', length: 100, nullable: true })
  ciudad: string | null;

  @Column({ type: 'varchar', length: 150, nullable: true })
  direccion: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  numero: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  piso: string | null;

  @Column({ type: 'varchar', length: 30, nullable: true })
  telefonoContacto: string | null;

  // Historial académico
  @Column({ type: 'varchar', length: 30, nullable: true })
  estudiosAlcanzados: string | null;

  @Column({ type: 'varchar', length: 150, nullable: true })
  titulo: string | null;

  // Historial de salud
  @Column({ type: 'text', nullable: true })
  preocupacional: string | null;

  @Column({ type: 'date', nullable: true })
  fechaPreocupacional: string | null;

  @Column({ type: 'text', nullable: true })
  constanciaAptitudFisica: string | null;

  @Column({ type: 'date', nullable: true })
  fechaConstanciaAptitudFisica: string | null;

  @Column({ type: 'text', nullable: true })
  examenesMedicos: string | null;

  @Column({ type: 'date', nullable: true })
  fechaExamenesMedicos: string | null;

  @Column({ type: 'text', nullable: true })
  examenesMedicosArt: string | null;

  @Column({ type: 'date', nullable: true })
  fechaExamenesMedicosArt: string | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

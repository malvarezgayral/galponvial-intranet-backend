// src/proveedores/entities/proveedor.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('proveedor')
export class Proveedor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 150 })
  nombre: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  telefono: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  direccion: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  horarios: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  ciudad: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  rubro: string;

  @Column({ type: 'text', nullable: true })
  codigo: string;

  @Column({ type: 'text', nullable: true })
  nombre_fantasia: string;

  @Column({ type: 'text', nullable: true })
  numero: string;

  @Column({ type: 'text', nullable: true })
  codigo_area: string;

  @Column({ type: 'text', nullable: true })
  codigo_postal: string;

  @Column({ type: 'text', nullable: true })
  cuit: string;

  @Column({ type: 'varchar', length: 20, default: 'NORMAL' })
  estado: string;

  @CreateDateColumn({ nullable: false })
  created_at: Date;
}

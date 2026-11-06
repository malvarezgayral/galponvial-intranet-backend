// src/personal/entities/documentacion-personal-archivo.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { DocumentacionPersonal } from './documentacion-personal.entity';

@Entity('documentacion_personal_archivo')
export class DocumentacionPersonalArchivo {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ type: 'int' })
  documentacionId: number;

  @ManyToOne(() => DocumentacionPersonal, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'documentacionId' })
  documentacion?: DocumentacionPersonal;

  // dni | cuil | certificado
  @Column({ type: 'varchar', length: 20 })
  tipo: string;

  @Column({ type: 'varchar', length: 255 })
  nombreOriginal: string;

  // Nombre en disco (uuid.ext), dentro de la carpeta privada
  @Column({ type: 'varchar', length: 100 })
  archivo: string;

  @Column({ type: 'varchar', length: 100 })
  mimetype: string;

  @Column({ type: 'int' })
  tamano: number;

  @CreateDateColumn()
  created_at: Date;
}

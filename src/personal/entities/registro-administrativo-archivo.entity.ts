// src/personal/entities/registro-administrativo-archivo.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { RegistroAdministrativo } from './registro-administrativo.entity';

@Entity('registro_administrativo_archivo')
export class RegistroAdministrativoArchivo {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ type: 'int' })
  registroId: number;

  @ManyToOne(() => RegistroAdministrativo, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'registroId' })
  registro?: RegistroAdministrativo;

  // certificacion | aptitud | acto | licencia_anual | licencia_conducir
  @Column({ type: 'varchar', length: 30 })
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

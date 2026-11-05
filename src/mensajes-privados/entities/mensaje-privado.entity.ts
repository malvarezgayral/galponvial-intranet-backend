// src/mensajes-privados/entities/mensaje-privado.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

// Un renglon = un mensaje privado entre un admin y el superadmin.
// dniAdmin es el duenio de la conversacion; dniAutor quien lo escribio (el admin o, en el chat, el superadmin).
@Entity('mensaje_privado')
export class MensajePrivado {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index()
  @Column({ name: 'dni_admin', type: 'bigint' })
  dniAdmin!: number;

  @Column({ name: 'dni_autor', type: 'bigint' })
  dniAutor!: number;

  // 'mensaje' (boton Mensajes) o 'chat' (boton Chat)
  @Column({ type: 'varchar', length: 10 })
  tipo!: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  asunto?: string | null;

  @Column({ type: 'text' })
  texto!: string;

  @CreateDateColumn()
  fecha!: Date;

  // Chat: cuando lo leyo el otro participante (null = sin leer)
  @Column({ name: 'leido_en', type: 'timestamp', nullable: true })
  leidoEn?: Date | null;
}

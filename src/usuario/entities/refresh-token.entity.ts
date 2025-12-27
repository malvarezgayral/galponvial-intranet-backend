import { Column, Entity, OneToOne, PrimaryGeneratedColumn, JoinColumn } from 'typeorm';
import { Usuario } from './usuario.entity';

@Entity('refresh_token')
export class RefreshToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('timestamp')
  expiresAt: Date;

  @Column('text')
  tokenHash: string;

  @Column('boolean', { default: false })
  revoked: boolean;

  @OneToOne(() => Usuario, (u) => u.refreshToken)
  @JoinColumn({ name: 'dni_usuario' })
  usuario: Usuario;

  @Column('bigint')
  dni_usuario: number;
}

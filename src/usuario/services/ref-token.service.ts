import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshToken } from '../entities/refresh-token.entity';
import { UsuarioService } from './usuario.service';
import { Usuario } from '../entities/usuario.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class RefToken {
  constructor(
    @InjectRepository(RefreshToken)
    private refTokenRepository: Repository<RefreshToken>,
    private usuarioService: UsuarioService,
  ) {}

  async createRefreshToken({
    refreshToken,
    expiresIn,
    dni,
  }: {
    refreshToken: string;
    expiresIn: string;
    dni: number;
  }): Promise<RefreshToken> {
    const usuario: Usuario | null =
      await this.usuarioService.obtenerUsuarioPorDni(dni);

    if (!usuario) {
      throw new Error('User not found');
    }

    const refToken: Partial<RefreshToken> = {
      tokenHash: await this.hashToken(refreshToken),
      expiresAt: this.calculateExpiryDate(expiresIn),
      revoked: false,
      usuario,
      dni_usuario: dni,
    };
    return this.refTokenRepository.save(refToken);
  }

  private async hashToken(token: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    const tokenHashed = await bcrypt.hash(token, salt);

    return tokenHashed;
  }

  private calculateExpiryDate(expiresIn: string): Date {
    const expiresInSeconds = parseInt(expiresIn, 10);
    const expiryDate = new Date();
    expiryDate.setSeconds(expiryDate.getSeconds() + expiresInSeconds);
    return expiryDate;
  }
}

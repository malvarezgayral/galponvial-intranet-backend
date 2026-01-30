import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { Usuario } from '../entities/usuario.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshToken } from '../entities/refresh-token.entity';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    @InjectRepository(Usuario)
    private readonly userRepository: Repository<Usuario>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
  ) {
    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;

    if (!jwtRefreshSecret) {
      throw new Error(
        'JWT_REFRESH_SECRET is not defined in environment variables',
      );
    }
    super({
      secretOrKey: jwtRefreshSecret,
      /*jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => req.cookies?.refresh_token,
      ]),*/
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
    });
  }

  async validate(payload: JwtPayload): Promise<Usuario | null> {
    const { email } = payload;

    const user: Usuario | null = await this.userRepository.findOne({
      where: { email },
      relations: ['refreshTokens'],
    });

    if (!user) throw new UnauthorizedException();

    // Verificar que exista al menos un token activo (no revocado)
    const activeTokens = user.refreshTokens?.filter((rt) => !rt.revoked) ?? [];

    if (activeTokens.length === 0) {
      throw new UnauthorizedException(
        'Sesión revocada, inicie sesión nuevamente',
      );
    }

    return user;
  }
}

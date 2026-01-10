import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { Usuario } from '../entities/usuario.entity';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    @InjectRepository(Usuario)
    private readonly userRepository: Repository<Usuario>,
    configService: ConfigService,
  ) {
    const jwtRefreshSecret =
      configService.get<string>('jwtRefreshSecret') ||
      process.env.JWT_REFRESH_SECRET;

    if (!jwtRefreshSecret) {
      throw new Error(
        'JWT_REFRESH_SECRET is not defined in environment variables',
      );
    }
    super({
      secretOrKey: jwtRefreshSecret,
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => req.cookies?.refresh_token,
      ]),
    });
  }

  async validate(payload: JwtPayload): Promise<Usuario> {
    const { dni } = payload;

    const refreshToken = req.headers.authorization?.replace('Bearer ', '');

    const user = await this.userRepository.findOne({
      where: { dni },
    });

    if (!user) throw new UnauthorizedException();

    return { user, refreshToken };
  }
}

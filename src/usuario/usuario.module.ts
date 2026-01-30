import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from './entities/usuario.entity';
import { Rol } from './entities/rol.entity';
import { UsuarioRol } from './entities/usuario-rol.entity';
import { UsuarioVehiculo } from './entities/usuario-vehiculo.entity';
import { ReporteIncidente } from './entities/reporte-incidente.entity';
import { Servicio } from './entities/servicio.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { UsuarioService } from './services/usuario.service';
import { UsuarioVehiculoService } from './services/usuario-vehiculo.service';
import { UsuarioController } from './controllers/usuario.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { RolService } from './services/rol.service';
import { JwtAccessStrategy } from './authStrategies/jwt-access.strategy';
import { JwtRefreshStrategy } from './authStrategies/jwt-refresh.strategy';
import { RefToken } from './services/ref-token.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Usuario,
      Rol,
      UsuarioRol,
      UsuarioVehiculo,
      ReporteIncidente,
      Servicio,
      RefreshToken,
    ]),
    PassportModule.register({ defaultStrategy: 'jwt-access' }),

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_ACCESS_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_ACCESS_EXPIRES_IN') ?? '60m',
        },
      }),
    }),
  ],
  providers: [
    UsuarioService,
    RefToken,
    RolService,
    UsuarioVehiculoService,
    JwtAccessStrategy,
    JwtRefreshStrategy,
  ],
  controllers: [UsuarioController],
  exports: [
    UsuarioService,
    UsuarioVehiculoService,
    RefToken,
    TypeOrmModule,
    JwtAccessStrategy,
    JwtRefreshStrategy,
    PassportModule,
    JwtModule,
  ],
})
export class UsuarioModule {}

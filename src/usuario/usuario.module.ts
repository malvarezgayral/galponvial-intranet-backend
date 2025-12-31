import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from './entities/usuario.entity';
import { Rol } from './entities/rol.entity';
import { UsuarioVehiculo } from './entities/usuario-vehiculo.entity';
import { ReporteIncidente } from './entities/reporte-incidente.entity';
import { Servicio } from './entities/servicio.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { UsuarioService } from './services/usuario.service';
import { UsuarioVehiculoService } from './services/usuario-vehiculo.service';
import { UsuarioController } from './controllers/usuario.controller';
import { RolService } from './rol.service';
import { RolController } from './rol.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './authStrategies/jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Usuario,
      Rol,
      UsuarioVehiculo,
      ReporteIncidente,
      Servicio,
      RefreshToken,
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          secret: configService.get('JWT_SECRET'),
          signOptions: {
            expiresIn: '1h',
          },
        };
      },
    }),
  ],
  providers: [UsuarioService, RolService, UsuarioVehiculoService],
  controllers: [UsuarioController, RolController],
  exports: [
    UsuarioService,
    UsuarioVehiculoService,
    TypeOrmModule,
    JwtStrategy,
    PassportModule,
    JwtModule,
  ],
})
export class UsuarioModule {}

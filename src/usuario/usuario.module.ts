import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from './entities/usuario.entity';
import { Rol } from './entities/rol.entity';
import { UsuarioVehiculo } from './entities/usuario-vehiculo.entity';
import { ReporteIncidente } from './entities/reporte-incidente.entity';
import { Servicio } from './entities/servicio.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { UsuarioService } from './usuario.service';
import { UsuarioController } from './usuario.controller';
import { RolService } from './rol.service';
import { RolController } from './rol.controller';

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
  ],
  providers: [UsuarioService, RolService],
  controllers: [UsuarioController, RolController],
})
export class UsuarioModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from './entities/usuario.entity';
import { Rol } from './entities/rol.entity';
import { UsuarioVehiculo } from './entities/usuario-vehiculo.entity';
import { ReporteIncidente } from './entities/reporte-incidente.entity';
import { Servicio } from './entities/servicio.entity';
import { UsuarioService } from './services/usuario.service';
import { UsuarioVehiculoService } from './services/usuario-vehiculo.service'; // ← AGREGAR
import { UsuarioController } from './controllers/usuario.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Usuario,
      Rol,
      UsuarioVehiculo,
      ReporteIncidente,
      Servicio,
    ]),
  ],
  providers: [UsuarioService, UsuarioVehiculoService], // ← AGREGAR
  controllers: [UsuarioController],
  exports: [UsuarioService, UsuarioVehiculoService], // ← EXPORTAR
})
export class UsuarioModule {}

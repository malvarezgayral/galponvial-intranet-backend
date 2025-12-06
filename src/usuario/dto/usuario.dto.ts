import { IsNotEmpty, IsDateString, IsOptional, IsNumber, IsString, IsEnum } from 'class-validator';
import { RolTipo, Permiso, FallaIncidente } from '../enums/usuario.enum';

export class CreateUsuarioDto {
  @IsNotEmpty()
  @IsNumber()
  dni: number;

  @IsNotEmpty()
  @IsString()
  nombre: string;

  @IsNotEmpty()
  @IsString()
  apellido: string;

  @IsNotEmpty()
  @IsDateString()
  fecha_alta: string;

  @IsOptional()
  @IsDateString()
  fecha_baja?: string;

  @IsNotEmpty()
  @IsNumber()
  rol_id: number;
}

export class UpdateUsuarioDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  apellido?: string;

  @IsOptional()
  @IsDateString()
  fecha_baja?: string;

  @IsOptional()
  @IsNumber()
  rol_id?: number;
}

export class CreateRolDto {
  @IsNotEmpty()
  @IsEnum(RolTipo)
  tipo: RolTipo;

  @IsNotEmpty()
  @IsEnum(Permiso, { each: true })
  permisos: Permiso[];
}

export class CreateUsuarioVehiculoDto {
  @IsNotEmpty()
  @IsNumber()
  id_vehiculo: number;

  @IsNotEmpty()
  @IsNumber()
  id_usuario: number;

  @IsNotEmpty()
  @IsDateString()
  fecha_desde: string;

  @IsOptional()
  @IsDateString()
  fecha_hasta?: string;
}

export class CreateReporteIncidenteDto {
  @IsNotEmpty()
  @IsDateString()
  fecha: string;

  @IsNotEmpty()
  @IsString()
  tipo: string;

  @IsNotEmpty()
  @IsString()
  descripcion: string;

  @IsNotEmpty()
  @IsEnum(FallaIncidente)
  falla: FallaIncidente;

  @IsNotEmpty()
  @IsNumber()
  id_usuario: number;

  @IsNotEmpty()
  @IsNumber()
  id_vehiculo: number;
}

export class CreateServicioDto {
  @IsNotEmpty()
  @IsString()
  tipo: string;

  @IsNotEmpty()
  @IsDateString()
  fecha_inicio: string;

  @IsNotEmpty()
  @IsDateString()
  fecha_hasta: string;

  @IsNotEmpty()
  @IsString()
  descripcion: string;

  @IsOptional()
  @IsNumber()
  incidente_id?: number;
}

// src/service/dto/create-service.dto.ts
import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateServiceDto {
  @IsString()
  @IsNotEmpty()
  vehiculo!: string;

  @IsString()
  @IsOptional()
  fecha?: string;

  @IsString()
  @IsOptional()
  aceiteMotor?: string;

  @IsString()
  @IsOptional()
  aceiteCaja?: string;

  @IsString()
  @IsOptional()
  aceiteDiferencial?: string;

  @IsString()
  @IsOptional()
  aceiteTransmision?: string;

  @IsString()
  @IsOptional()
  filtroTransmision?: string;

  @IsString()
  @IsOptional()
  filtroMotorAceite?: string;

  @IsString()
  @IsOptional()
  filtroAire?: string;

  @IsString()
  @IsOptional()
  filtroGasoil?: string;

  @IsString()
  @IsOptional()
  aceiteHidraulico?: string;

  @IsString()
  @IsOptional()
  filtroHidraulico?: string;

  @IsString()
  @IsOptional()
  correasAuxiliares?: string;

  @IsString()
  @IsOptional()
  aceiteTande?: string;

  @IsString()
  @IsOptional()
  regulacionValvulas?: string;

  @IsString()
  @IsOptional()
  cambioDamper?: string;

  @IsString()
  @IsOptional()
  proximoService?: string;

  @IsString()
  @IsOptional()
  cuentaHora?: string;

  @IsString()
  @IsOptional()
  stock?: string;

  @IsString()
  @IsOptional()
  observaciones?: string;
}
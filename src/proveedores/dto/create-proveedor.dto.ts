// src/proveedores/dto/create-proveedor.dto.ts
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateProveedorDto {
  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @IsString()
  @IsOptional()
  telefono?: string;

  @IsString()
  @IsOptional()
  direccion?: string;

  @IsString()
  @IsOptional()
  horarios?: string;

  @IsString()
  @IsOptional()
  ciudad?: string;

  @IsString()
  @IsOptional()
  rubro?: string;
}

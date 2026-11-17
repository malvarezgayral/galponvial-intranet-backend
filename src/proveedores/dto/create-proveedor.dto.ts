// src/proveedores/dto/create-proveedor.dto.ts
import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export const ESTADOS_PROVEEDOR = ['NORMAL', 'FUERA DE ESTADO'];

/** Todos los campos son obligatorios. En pantalla, "nombre" se muestra como "Razón Social". */
export class CreateProveedorDto {
  @IsString()
  @IsNotEmpty()
  codigo!: string;

  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @IsString()
  @IsNotEmpty()
  nombre_fantasia!: string;

  @IsString()
  @IsNotEmpty()
  telefono!: string;

  @IsString()
  @IsNotEmpty()
  direccion!: string;

  @IsString()
  @IsNotEmpty()
  numero!: string;

  @IsString()
  @IsNotEmpty()
  codigo_area!: string;

  @IsString()
  @IsNotEmpty()
  codigo_postal!: string;

  @IsString()
  @IsNotEmpty()
  cuit!: string;

  @IsString()
  @IsIn(ESTADOS_PROVEEDOR)
  estado!: string;

  @IsString()
  @IsNotEmpty()
  horarios!: string;

  @IsString()
  @IsNotEmpty()
  ciudad!: string;

  @IsString()
  @IsNotEmpty()
  rubro!: string;
}

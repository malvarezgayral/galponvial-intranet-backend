// src/compras/dto/create-orden-compra.dto.ts
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { EstadoOrdenCompra, TipoFactura } from '../enums/compras.enum';

export class CreateOrdenCompraDto {
  @IsString()
  @IsNotEmpty()
  numeroOrden!: string;

  @IsInt()
  @IsOptional()
  id_suministro?: number;

  @IsInt()
  @IsOptional()
  id_proveedor?: number;

  @IsEnum(TipoFactura)
  @IsOptional()
  tipoFactura?: TipoFactura;

  @IsString()
  @IsOptional()
  numeroFactura?: string;

  @IsNumber()
  @IsOptional()
  monto?: number;

  @IsString()
  @IsOptional()
  fechaEntrega?: string;

  @IsEnum(EstadoOrdenCompra)
  @IsOptional()
  estado?: EstadoOrdenCompra;

  @IsString()
  @IsOptional()
  unidad?: string;
}

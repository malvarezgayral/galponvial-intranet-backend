import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsDateString,
  IsOptional,
  IsInt,
  ValidateIf,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TipoServicio } from '../enums/vehiculo.enum';

export class CreateServicioDto {
  @ApiProperty({
    description: 'Fecha de inicio del servicio',
    example: '2024-06-01',
  })
  @IsNotEmpty()
  @IsDateString()
  fecha_inicio: string;

  @ApiPropertyOptional({
    description: 'Fecha de finalización del servicio',
    example: '2024-06-05',
  })
  @IsOptional()
  @IsDateString()
  fecha_hasta?: string;

  @ApiProperty({
    description: 'Tipo de servicio',
    enum: TipoServicio,
    example: TipoServicio.MANTENIMIENTO_PREVENTIVO,
  })
  @IsNotEmpty()
  @IsEnum(TipoServicio)
  tipo: TipoServicio;

  @ApiProperty({
    description: 'Descripción del servicio',
    example: 'Cambio de aceite y filtros',
  })
  @IsNotEmpty()
  @IsString()
  descripcion: string;

  @ApiPropertyOptional({
    description: 'ID del vehículo (requerido si no hay incidente)',
    example: 3,
  })
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  @ValidateIf((o) => !o.incidente_id)
  @IsNotEmpty()
  @IsInt()
  id_vehiculo?: number;

  @ApiPropertyOptional({
    description: 'ID del incidente asociado',
    example: 7,
  })
  @IsOptional()
  @IsInt()
  incidente_id?: number;
}

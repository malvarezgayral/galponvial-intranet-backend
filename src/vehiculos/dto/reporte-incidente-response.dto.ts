import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UsuarioMinimalResponseDto } from '../../usuario/dto/usuario-response.dto';

/**
 * DTO de respuesta para ReporteIncidente sin datos sensibles
 */
export class ReporteIncidenteResponseDto {
  @ApiProperty({
    description: 'ID del reporte de incidente',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Fecha del incidente',
  })
  fecha: Date;

  @ApiProperty({
    description: 'Tipo de incidente',
    example: 'Choque',
  })
  tipo: string;

  @ApiProperty({
    description: 'Descripción del incidente',
    example: 'Choque en trasera',
  })
  descripcion: string;

  @ApiProperty({
    description: 'Importancia/Falla del incidente',
    example: 'CRITICA',
  })
  falla: string;

  @ApiProperty({
    description: 'Estado del incidente',
    example: 'pendiente',
  })
  estado: string;

  @ApiProperty({
    description: 'ID del vehículo',
    example: 1,
  })
  id_vehiculo: number;

  @ApiPropertyOptional({
    description: 'Usuario que reportó el incidente (sin datos sensibles)',
  })
  usuario?: UsuarioMinimalResponseDto;

  @ApiPropertyOptional({
    description: 'Vehículo relacionado',
  })
  vehiculo?: any;

  @ApiPropertyOptional({
    description: 'Servicios relacionados',
    type: () => Array,
  })
  servicios?: any[];
}

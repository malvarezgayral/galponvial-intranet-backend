import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReporteIncidenteResponseDto } from './reporte-incidente-response.dto';

/**
 * DTO de respuesta para Servicio sin datos sensibles en relaciones
 */
export class ServicioResponseDto {
  @ApiProperty({
    description: 'ID del servicio',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Tipo de servicio',
    example: 'Mecánica',
  })
  tipo: string;

  @ApiProperty({
    description: 'Fecha de inicio del servicio',
  })
  fecha_inicio: Date;

  @ApiPropertyOptional({
    description: 'Fecha de finalización del servicio',
  })
  fecha_hasta?: Date | null;

  @ApiProperty({
    description: 'Descripción del servicio',
    example: 'Reparación de frenos',
  })
  descripcion: string;

  @ApiPropertyOptional({
    description: 'ID del incidente relacionado',
    example: 1,
  })
  incidente_id?: number;

  @ApiPropertyOptional({
    description: 'Incidente relacionado (sin datos sensibles)',
  })
  incidente?: ReporteIncidenteResponseDto | null;
}

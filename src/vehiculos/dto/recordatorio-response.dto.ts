import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UsuarioMinimalResponseDto } from 'src/usuario/dto/usuario-response.dto';

/**
 * DTO de respuesta para Recordatorio sin datos sensibles del usuario
 */
export class RecordatorioResponseDto {
  @ApiProperty({
    description: 'ID del recordatorio',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Fecha del recordatorio',
  })
  fecha: Date;

  @ApiProperty({
    description: 'Descripción del recordatorio',
    example: 'Revisar presión de llantas',
  })
  descripcion: string;

  @ApiPropertyOptional({
    description: 'Usuario del recordatorio (sin datos sensibles)',
  })
  usuario?: UsuarioMinimalResponseDto;
}

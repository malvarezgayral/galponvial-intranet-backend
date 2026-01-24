import {
  IsNotEmpty,
  IsDateString,
  IsNumber,
  IsString,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { FallaIncidente } from 'src/usuario/enums/usuario.enum';
import { TipoIncidente } from '../enums/vehiculo.enum';

export class CreateReporteIncidenteDto {
  @ApiProperty({
    description: 'Fecha del incidente',
    example: '2024-06-10',
  })
  @IsDateString()
  @IsNotEmpty()
  fecha: string;

  @ApiProperty({
    description: 'Tipo de incidente',
    example: 'Mecánico',
  })
  @IsString()
  @IsNotEmpty()
  tipo: TipoIncidente;

  @ApiProperty({
    description: 'Descripción del incidente',
    example: 'Falla en el sistema de frenos',
  })
  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @ApiProperty({
    description: 'Nivel o tipo de falla',
    enum: FallaIncidente,
    example: FallaIncidente.BAJA,
  })
  @IsEnum(FallaIncidente)
  @IsNotEmpty()
  falla: FallaIncidente;

  @ApiProperty({
    description: 'DNI del usuario que reporta el incidente',
    example: 36878912,
  })
  @IsNumber()
  @IsNotEmpty()
  id_usuario: number;
}

import {
  IsNotEmpty,
  IsDateString,
  IsNumber,
  IsString,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { FallaIncidente } from 'src/usuario/enums/usuario.enum';

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
  tipo: string;

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
    description: 'ID del vehículo involucrado',
    example: 5,
  })
  @IsNumber()
  @IsNotEmpty()
  id_vehiculo: number;
}

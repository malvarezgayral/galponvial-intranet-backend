import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateGrupoArticuloDto {
  @ApiProperty({
    example: 'Lubricantes',
  })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({
    example: 'Grupo de aceites y lubricantes',
  })
  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @ApiProperty({
    description: 'ID del sector del galpón',
    example: 3,
  })
  @IsNotEmpty()
  sector_id: number;
}

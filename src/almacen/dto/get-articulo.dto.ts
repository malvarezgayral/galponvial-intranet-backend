import { ApiProperty } from '@nestjs/swagger';

export class GetArticuloDto {
  @ApiProperty({ example: 1 })
  cod: number;

  @ApiProperty({ example: 'PROV123' })
  cod_proveedor: string;

  @ApiProperty({ example: 'Aceite sintético' })
  nombre: string;

  @ApiProperty({ example: 'SAE 5W30' })
  modelo: string;

  @ApiProperty({ example: 'Aceite de motor de alta calidad' })
  descripcion: string;

  @ApiProperty({ example: 'https://ejemplo.com/imagen.jpg', required: false })
  img_url?: string;

  @ApiProperty({ example: 150, required: false })
  stock?: number;

  @ApiProperty({ example: 'BOTELLA' })
  unidad_tipo: string;

  @ApiProperty({ example: 'Lubricantes' })
  grupo: string;

  @ApiProperty({ example: 'LITRO' })
  unidad_medida: string | null;
}

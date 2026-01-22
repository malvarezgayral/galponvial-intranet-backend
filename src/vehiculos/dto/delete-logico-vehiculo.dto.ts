import { IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DeleteLogicoVehiculoDto {
  @ApiProperty({
    description: 'Flag para marcar el vehículo como eliminado',
    example: true,
    type: Boolean,
  })
  @IsBoolean()
  eliminado: boolean;
}

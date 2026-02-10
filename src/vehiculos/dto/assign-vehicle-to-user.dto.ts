import { IsNotEmpty, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignVehicleToUserDto {
  @ApiProperty({
    example: 12345678,
    description: 'DNI del usuario al que se asignará el vehículo',
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  dni: number;

  @ApiProperty({
    example: 1,
    description: 'ID del vehículo a asignar al usuario',
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  id_vehiculo: number;
}

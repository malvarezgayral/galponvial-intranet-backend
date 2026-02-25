import { IsEnum } from 'class-validator';
import { StatusIncidente } from '../enums/vehiculo.enum';

export class UpdateEstadoIncidenteDto {
  @IsEnum(StatusIncidente, {
    message: `El estado debe ser uno de: ${Object.values(StatusIncidente).join(', ')}`,
  })
  estado: StatusIncidente;
}

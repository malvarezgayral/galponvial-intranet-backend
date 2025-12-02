import { PartialType } from '@nestjs/mapped-types';
import { CreateAlmacenDto } from './create-almacen.dto';

export class UpdateAlmacenDto extends PartialType(CreateAlmacenDto) {}

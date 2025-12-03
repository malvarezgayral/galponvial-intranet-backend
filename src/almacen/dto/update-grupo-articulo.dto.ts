/* eslint-disable prettier/prettier */
import { PartialType } from '@nestjs/mapped-types';
import { CreateGrupoArticuloDto } from './create-grupo-articulo.dto';

export class UpdateGrupoArticuloDto extends PartialType(CreateGrupoArticuloDto) {}

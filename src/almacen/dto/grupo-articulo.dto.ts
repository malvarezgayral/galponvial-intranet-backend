import { UpdateArticuloDto } from './update-articulo.dto';

export class GrupoArticuloDto {
  id: number;
  nombre: string;
  descripcion?: string;
  sector_galpon?: number;
  articulos: Array<UpdateArticuloDto>;
}

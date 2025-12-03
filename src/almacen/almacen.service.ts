import { Injectable } from '@nestjs/common';
import { CreateAlmacenDto } from './dto/update-articulo.dto';
import { UpdateAlmacenDto } from './dto/create-articulo.dto';

@Injectable()
export class AlmacenService {
  create(createAlmacenDto: CreateAlmacenDto) {
    return 'This action adds a new almacen';
  }

  findAll() {
    return `This action returns all almacen`;
  }

  findOne(id: number) {
    return `This action returns a #${id} almacen`;
  }

  update(id: number, updateAlmacenDto: UpdateAlmacenDto) {
    return `This action updates a #${id} almacen`;
  }

  remove(id: number) {
    return `This action removes a #${id} almacen`;
  }
}

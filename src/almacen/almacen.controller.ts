import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AlmacenService } from './almacen.service';

@Controller('almacen')
export class AlmacenController {
  constructor(private readonly almacenService: AlmacenService) {}

  // @Post('/articulo')
  // create(@Body() createAlmacenDto: CreateArticuloDTO) {
  //   return this.almacenService.create(createAlmacenDto);
  // }

  @Get('/articulo')
  findAll() {
    return this.almacenService.findAll();
  }

  @Get('/articulo/:id')
  findOne(@Param('id') id: string) {
    return this.almacenService.findOne(+id);
  }

  // @Patch('/articulo/:id')
  // update(@Param('id') id: string, @Body() updateAlmacenDto: CreateArticuloDTO) {
  //   return this.almacenService.update(+id, updateAlmacenDto);
  // }

  @Delete('/articulo/:id')
  remove(@Param('id') id: string) {
    return this.almacenService.remove(+id);
  }
}

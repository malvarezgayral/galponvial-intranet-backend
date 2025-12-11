import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';

import { CreateArticuloDto } from './dto/create-articulo.dto';
import { UpdateArticuloDto } from './dto/update-articulo.dto';

import { CreateGrupoArticuloDto } from './dto/create-grupo-articulo.dto';
import { UpdateGrupoArticuloDto } from './dto/update-grupo-articulo.dto';
import { GrupoArticuloDto } from './dto/grupo-articulo.dto';

import { MovimientoDTO } from './dto/movimiento.dto';
import { CreateEntradaDto } from './dto/create-entrada.dto';
import { CreateSalidaDto } from './dto/create-salida.dto';

import { AlmacenService } from './almacen.service';

@Controller('almacen')
export class AlmacenController {
  constructor(private readonly almacenService: AlmacenService) { }

  // ---------------------- ARTÍCULOS ----------------------

  @Get('articulos')
  getAllArticles() {
    return this.almacenService.getAllArticles();
  }

  @Post('articulos')
  createArticle(@Body() dto: CreateArticuloDto) {
    return this.almacenService.createArticle(dto);
  }

  @Put('articulos/:cod')
  updateArticle(
    @Param('cod') cod: string,
    @Body() dto: UpdateArticuloDto,
  ) {
    return this.almacenService.updateArticle(cod, dto);
  }

  @Delete('articulos/:cod')
  deleteArticle(@Param('cod') cod: string) {
    return this.almacenService.deleteArticle(cod);
  }

  // ---------------------- GRUPOS ----------------------

  @Get('grupos')
  getAllGroups() {
    return this.almacenService.getAllGroups();
  }

  @Get('grupos/:id')
  getGroup(@Param('id') id: number): Promise<GrupoArticuloDto> {
    return this.almacenService.getGroup(id);
  }

  @Post('grupos')
  createGroup(@Body() dto: CreateGrupoArticuloDto) {
    return this.almacenService.createGroup(dto);
  }

  @Put('grupos/:id')
  updateGroup(@Param('id') id: number, @Body() dto: UpdateGrupoArticuloDto) {
    return this.almacenService.updateGroup(id, dto);
  }

  // ---------------------- MOVIMIENTOS ----------------------

  @Get('movimientos/:idArticulo')
  getMovimientos(@Param('idArticulo') codArticulo: string) {
    return this.almacenService.getMovimientosByArticulo(codArticulo);
  }

  @Post('movimientos')
  createMovimiento(@Body() dto: CreateEntradaDto | CreateSalidaDto) {
    return this.almacenService.createMovimiento(dto);
  }

}

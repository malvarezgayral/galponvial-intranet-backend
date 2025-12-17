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

import { CreateEntradaDto } from './dto/create-entrada.dto';
import { CreateSalidaDto } from './dto/create-salida.dto';

import { AlmacenService } from './almacen.service';

@Controller('almacen')
export class AlmacenController {
  constructor(private readonly almacenService: AlmacenService) {}

  // ---------------------- ARTÍCULOS ----------------------

  @Get('articulos')
  async getAllArticles() {
    return await this.almacenService.getAllArticles();
  }

  @Post('articulos')
  async createArticle(@Body() dto: CreateArticuloDto) {
    return await this.almacenService.createArticle(dto);
  }

  @Put('articulos/:cod')
  async updateArticle(
    @Param('cod') cod: string,
    @Body() dto: UpdateArticuloDto,
  ) {
    return await this.almacenService.updateArticle(cod, dto);
  }

  @Delete('articulos/:cod')
  async deleteArticle(@Param('cod') cod: string) {
    return await this.almacenService.deleteArticle(cod);
  }

  // ---------------------- GRUPOS ----------------------

  @Get('grupos')
  async getAllGroups() {
    return await this.almacenService.getAllGroups();
  }

  @Get('grupos/:id')
  async getGroup(@Param('id') id: number): Promise<GrupoArticuloDto> {
    return await this.almacenService.getGroup(id);
  }

  @Post('grupos')
  async createGroup(@Body() dto: CreateGrupoArticuloDto) {
    return await this.almacenService.createGroup(dto);
  }

  @Put('grupos/:id')
  async updateGroup(
    @Param('id') id: number,
    @Body() dto: UpdateGrupoArticuloDto,
  ) {
    return await this.almacenService.updateGroup(id, dto);
  }

  // ---------------------- MOVIMIENTOS ----------------------

  @Get('movimientos/:idArticulo')
  async getMovimientos(@Param('idArticulo') codArticulo: string) {
    return await this.almacenService.getMovimientosByArticulo(codArticulo);
  }

  @Post('movimientos')
  async createMovimiento(@Body() dto: CreateEntradaDto | CreateSalidaDto) {
    return await this.almacenService.createMovimiento(dto);
  }
}

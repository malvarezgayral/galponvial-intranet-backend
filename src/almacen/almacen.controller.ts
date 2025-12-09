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

@Controller('almacen')
export class AlmacenController {
  // ---------------------- ARTÍCULOS ----------------------

  // Devuelve lista de artículos (stubs)
  @Get('articulos')
  async getAllArticles(): Promise<CreateArticuloDto[]> {
    // return this.almacenService.getAllArticles();
    return [];
  }

  @Post('articulos')
  async createArticle(
    @Body() createArticuloDto: CreateArticuloDto,
  ): Promise<CreateArticuloDto> {
    // return this.almacenService.createArticle(createArticuloDto);
    return createArticuloDto; 
  }

  @Put('articulos/:cod')
  async updateArticle(
    @Param('cod') cod: string,
    @Body() updateArticuloDto: UpdateArticuloDto,
  ): Promise<UpdateArticuloDto> {
    // return this.almacenService.updateArticle(cod, updateArticuloDto);
    return updateArticuloDto; 
  }

  @Delete('articulos/:cod')
  async deleteArticle(@Param('cod') cod: string): Promise<boolean> {
    // this.almacenService.deleteArticle(cod);
    return true; 
  }

  // ---------------------- GRUPOS DE ARTÍCULOS ----------------------

  @Get('grupos')
  async getAllGroups(): Promise<CreateGrupoArticuloDto[]> {
    // return this.almacenService.getAllGroups();
    return []; // stub
  }

  @Get('grupos/:id')
  async getGroup(@Param('id') id: number): Promise<GrupoArticuloDto> {
    // return this.almacenService.getGroup(id);
    return {} as GrupoArticuloDto; // stub (cast para cumplir tipo)
  }

  @Post('grupos')
  async createGroup(
    @Body() createGrupoDto: CreateGrupoArticuloDto,
  ): Promise<CreateGrupoArticuloDto> {
    // return this.almacenService.createGroup(createGrupoDto);
    return createGrupoDto; // stub
  }

  @Put('grupos/:id')
  async updateGroup(
    @Param('id') id: number,
    @Body() updateGrupoDto: UpdateGrupoArticuloDto,
  ): Promise<UpdateGrupoArticuloDto> {
    // return this.almacenService.updateGroup(id, updateGrupoDto);
    return updateGrupoDto; // stub
  }

  // ---------------------- MOVIMIENTOS ----------------------

  @Get('movimientos/:idArticulo')
  async getAllMovimientos(
    @Param('idArticulo') idArticulo: number,
  ): Promise<MovimientoDTO[]> {
    // return this.almacenService.getMovimientosByArticulo(idArticulo);
    return []; // stub
  }

  @Post('movimientos/entrada')
  async createEntrada(
    @Body() createEntradaDto: CreateEntradaDto,
  ): Promise<MovimientoDTO> {
    // return this.almacenService.createEntrada(createEntradaDto);
    return {} as MovimientoDTO; // stub
  }

  @Post('movimientos/salida')
  async createSalida(
    @Body() createSalidaDto: CreateSalidaDto,
  ): Promise<MovimientoDTO> {
    // return this.almacenService.createSalida(createSalidaDto);
    return {} as MovimientoDTO; // stub
  }
}

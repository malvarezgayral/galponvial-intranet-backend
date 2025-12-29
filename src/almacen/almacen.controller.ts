import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import {
  ApiTags,
  ApiExtraModels,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  getSchemaPath,
} from '@nestjs/swagger';

import { CreateArticuloDto } from './dto/create-articulo.dto';
import { UpdateArticuloDto } from './dto/update-articulo.dto';

import { CreateGrupoArticuloDto } from './dto/create-grupo-articulo.dto';
import { UpdateGrupoArticuloDto } from './dto/update-grupo-articulo.dto';
import { GrupoArticuloDto } from './dto/grupo-articulo.dto';

import { CreateEntradaDto } from './dto/create-entrada.dto';
import { CreateSalidaDto } from './dto/create-salida.dto';

import { AlmacenService } from './almacen.service';
import { MovimientoDTO } from './dto/movimiento.dto';

@ApiTags('Almacén')
@ApiExtraModels(CreateEntradaDto, CreateSalidaDto)
@Controller('almacen')
export class AlmacenController {
  constructor(private readonly almacenService: AlmacenService) {}

  // ---------------------- ARTÍCULOS ----------------------

  @ApiOperation({ summary: 'Obtener todos los artículos' })
  @ApiResponse({ status: 200, description: 'Listado de artículos' })
  @Get('articulos')
  async getAllArticles() {
    return await this.almacenService.getAllArticles();
  }

  @ApiOperation({ summary: 'Crear un artículo' })
  @ApiBody({ type: CreateArticuloDto })
  @ApiResponse({ status: 201, description: 'Artículo creado correctamente' })
  @Post('articulos')
  async createArticle(@Body() dto: CreateArticuloDto) {
    return await this.almacenService.createArticle(dto);
  }

  @ApiOperation({ summary: 'Actualizar un artículo por código' })
  @ApiParam({
    name: 'cod',
    type: Number,
    description: 'Código del artículo',
  })
  @ApiBody({ type: UpdateArticuloDto })
  @ApiResponse({ status: 200, description: 'Artículo actualizado' })
  @ApiResponse({ status: 404, description: 'Artículo no encontrado' })
  @Put('articulos/:cod')
  async updateArticle(
    @Param('cod') cod: number,
    @Body() dto: UpdateArticuloDto,
  ) {
    return await this.almacenService.updateArticle(cod, dto);
  }

  @ApiOperation({ summary: 'Eliminar un artículo por código' })
  @ApiParam({
    name: 'cod',
    type: Number,
    description: 'Código del artículo',
  })
  @ApiResponse({ status: 200, description: 'Artículo eliminado' })
  @ApiResponse({ status: 404, description: 'Artículo no encontrado' })
  @Delete('articulos/:cod')
  async deleteArticle(@Param('cod') cod: number) {
    return await this.almacenService.deleteArticle(cod);
  }

  // ---------------------- GRUPOS ----------------------

  @ApiOperation({ summary: 'Obtener todos los grupos de artículos' })
  @ApiResponse({ status: 200, description: 'Listado de grupos' })
  @Get('grupos')
  async getAllGroups() {
    return await this.almacenService.getAllGroups();
  }

  @ApiOperation({ summary: 'Obtener un grupo por ID' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID del grupo',
  })
  @ApiResponse({
    status: 200,
    description: 'Grupo encontrado',
    type: GrupoArticuloDto,
  })
  @ApiResponse({ status: 404, description: 'Grupo no encontrado' })
  @Get('grupos/:id')
  async getGroup(@Param('id') id: number): Promise<GrupoArticuloDto> {
    return await this.almacenService.getGroup(id);
  }

  @ApiOperation({ summary: 'Crear un grupo de artículos' })
  @ApiBody({ type: CreateGrupoArticuloDto })
  @ApiResponse({ status: 201, description: 'Grupo creado correctamente' })
  @Post('grupos')
  async createGroup(@Body() dto: CreateGrupoArticuloDto) {
    return await this.almacenService.createGroup(dto);
  }

  @ApiOperation({ summary: 'Actualizar un grupo de artículos' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID del grupo',
  })
  @ApiBody({ type: UpdateGrupoArticuloDto })
  @ApiResponse({ status: 200, description: 'Grupo actualizado' })
  @Put('grupos/:id')
  async updateGroup(
    @Param('id') id: number,
    @Body() dto: UpdateGrupoArticuloDto,
  ) {
    return await this.almacenService.updateGroup(id, dto);
  }

  // ---------------------- MOVIMIENTOS ----------------------

  @ApiOperation({ summary: 'Obtener movimientos de un artículo' })
  @ApiParam({
    name: 'idArticulo',
    type: Number,
    description: 'Código del artículo',
  })
  @ApiResponse({
    status: 200,
    description: 'Movimientos encontrados',
    type: [MovimientoDTO],
  })
  @Get('movimientos/:idArticulo')
  async getMovimientos(@Param('idArticulo') codArticulo: number) {
    return await this.almacenService.getMovimientosByArticulo(codArticulo);
  }

  @ApiOperation({ summary: 'Registrar un movimiento (entrada o salida)' })
  @ApiBody({
    description: 'Movimiento de entrada o salida',
    schema: {
      oneOf: [
        { $ref: getSchemaPath(CreateEntradaDto) },
        { $ref: getSchemaPath(CreateSalidaDto) },
      ],
    },
  })
  @ApiResponse({ status: 201, description: 'Movimiento registrado' })
  @Post('movimientos')
  async createMovimiento(@Body() dto: CreateEntradaDto | CreateSalidaDto) {
    return await this.almacenService.createMovimiento(dto);
  }
}

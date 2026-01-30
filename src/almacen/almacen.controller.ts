import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
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
import { Auth } from '../usuario/decorators/auth.decorator';
import { ValidRoles, Permisos } from '../usuario/enums/usuario.enum';
import { ObjectServiceResponse } from '../usuario/interfaces/object-service-response.interface';
import { Articulo } from './entities/articulo.entity';
import {
  AlmacenPermissions,
  AlmacenReadPermissions,
} from '../usuario/decorators/almacen-permissions.decorator';
import { AlmacenPermissionsGuard } from '../usuario/guards/almacen-permissions.guard';
import { GetUser } from '../usuario/decorators/get-user.decorator';
import { Usuario } from '../usuario/entities/usuario.entity';

@ApiTags('Almacén')
@ApiExtraModels(CreateEntradaDto, CreateSalidaDto)
@Controller('almacen')
@Auth(ValidRoles.admin)
export class AlmacenController {
  constructor(private readonly almacenService: AlmacenService) {}

  // ---------------------- ARTÍCULOS ----------------------

  @ApiOperation({ summary: 'Obtener todos los artículos paginados' })
  @ApiResponse({ status: 200, description: 'Listado paginado de artículos' })
  @Get('articulos')
  @HttpCode(HttpStatus.OK)
  @Auth()
  @UseGuards(AlmacenPermissionsGuard)
  @AlmacenReadPermissions(
    Permisos.ALMACEN_TALLER_READ,
    Permisos.ALMACEN_COMUN_READ,
    Permisos.ALL_READ,
  )
  async getAllArticles(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe)
    pageSize: number,
    @GetUser() user: Usuario,
  ): Promise<
    ObjectServiceResponse<{
      data: Articulo[];
      total: number;
      page: number;
      pageSize: number;
    }>
  > {
    // Combinar permisos de todos los roles del usuario
    const userRoles = user.roles ?? [];
    const userPermissions: Permisos[] = userRoles.flatMap(
      (role) => role.permisos ?? [],
    );

    const result = await this.almacenService.getAllArticles(
      page,
      pageSize,
      userPermissions,
    );
    return {
      success: true,
      data: result,
      message: `${result.total} artículos encontrados`,
    };
  }

  @ApiOperation({ summary: 'Obtener un artículo por su ID' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Código del artículo (cod)',
  })
  @ApiResponse({
    status: 200,
    description: 'Detalle del artículo encontrado',
  })
  @ApiResponse({
    status: 404,
    description: 'Artículo no encontrado',
  })
  @Get('/articulos/:id')
  @HttpCode(HttpStatus.OK)
  @Auth()
  @UseGuards(AlmacenPermissionsGuard)
  @AlmacenReadPermissions(
    Permisos.ALMACEN_TALLER_READ,
    Permisos.ALMACEN_COMUN_READ,
    Permisos.ALL_READ,
  )
  async getArticleById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ObjectServiceResponse<any>> {
    const result = await this.almacenService.getArticleById(id);

    return {
      success: true,
      data: result,
      message: 'Artículo encontrado con éxito',
    };
  }

  @ApiOperation({ summary: 'Crear un artículo' })
  @ApiBody({ type: CreateArticuloDto })
  @ApiResponse({ status: 201, description: 'Artículo creado correctamente' })
  @Post('articulos')
  @Auth(ValidRoles.superUser, ValidRoles.admin)
  @UseGuards(AlmacenPermissionsGuard)
  @AlmacenPermissions(
    Permisos.ALMACEN_TALLER_WRITE,
    Permisos.ALMACEN_COMUN_WRITE,
    Permisos.ALL_WRITE,
  )
  async createArticle(
    @Body() dto: CreateArticuloDto,
    @GetUser() user: Usuario,
  ) {
    // Combinar permisos de todos los roles del usuario
    const userRoles = user.roles ?? [];
    const userPermissions: Permisos[] = userRoles.flatMap(
      (role) => role.permisos ?? [],
    );

    return await this.almacenService.createArticle(dto, userPermissions);
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
  @Auth(ValidRoles.superUser, ValidRoles.admin)
  @UseGuards(AlmacenPermissionsGuard)
  @AlmacenPermissions(
    Permisos.ALMACEN_TALLER_WRITE,
    Permisos.ALMACEN_COMUN_WRITE,
    Permisos.ALL_WRITE,
  )
  async updateArticle(
    @Param('cod') cod: number,
    @Body() dto: UpdateArticuloDto,
    @GetUser() user: Usuario,
  ) {
    // Combinar permisos de todos los roles del usuario
    const userRoles = user.roles ?? [];
    const userPermissions: Permisos[] = userRoles.flatMap(
      (role) => role.permisos ?? [],
    );

    return await this.almacenService.updateArticle(cod, dto, userPermissions);
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
  @Auth(ValidRoles.superUser, ValidRoles.admin)
  @UseGuards(AlmacenPermissionsGuard)
  @AlmacenPermissions(
    Permisos.ALMACEN_TALLER_WRITE,
    Permisos.ALMACEN_COMUN_WRITE,
    Permisos.ALL_WRITE,
  )
  async deleteArticle(@Param('cod') cod: number, @GetUser() user: Usuario) {
    // Combinar permisos de todos los roles del usuario
    const userRoles = user.roles ?? [];
    const userPermissions: Permisos[] = userRoles.flatMap(
      (role) => role.permisos ?? [],
    );

    return await this.almacenService.deleteArticle(cod, userPermissions);
  }

  // ---------------------- GRUPOS ----------------------

  @ApiOperation({ summary: 'Obtener todos los grupos de artículos' })
  @ApiResponse({ status: 200, description: 'Listado de grupos' })
  @Get('grupos')
  @Auth()
  @UseGuards(AlmacenPermissionsGuard)
  @AlmacenReadPermissions(
    Permisos.ALMACEN_TALLER_READ,
    Permisos.ALMACEN_COMUN_READ,
    Permisos.ALL_READ,
  )
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
  @Auth()
  @UseGuards(AlmacenPermissionsGuard)
  @AlmacenReadPermissions(
    Permisos.ALMACEN_TALLER_READ,
    Permisos.ALMACEN_COMUN_READ,
    Permisos.ALL_READ,
  )
  async getGroup(@Param('id') id: number): Promise<GrupoArticuloDto> {
    return await this.almacenService.getGroup(id);
  }

  @ApiOperation({ summary: 'Crear un grupo de artículos' })
  @ApiBody({ type: CreateGrupoArticuloDto })
  @ApiResponse({ status: 201, description: 'Grupo creado correctamente' })
  @Post('grupos')
  @Auth(ValidRoles.superUser, ValidRoles.admin)
  @UseGuards(AlmacenPermissionsGuard)
  @AlmacenPermissions(
    Permisos.ALMACEN_TALLER_WRITE,
    Permisos.ALMACEN_COMUN_WRITE,
    Permisos.ALL_WRITE,
  )
  async createGroup(
    @Body() dto: CreateGrupoArticuloDto,
    @GetUser() user: Usuario,
  ) {
    // Combinar permisos de todos los roles del usuario
    const userRoles = user.roles ?? [];
    const userPermissions: Permisos[] = userRoles.flatMap(
      (role) => role.permisos ?? [],
    );

    return await this.almacenService.createGroup(dto, userPermissions);
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
  @Auth(ValidRoles.superUser, ValidRoles.admin)
  @UseGuards(AlmacenPermissionsGuard)
  @AlmacenPermissions(
    Permisos.ALMACEN_TALLER_WRITE,
    Permisos.ALMACEN_COMUN_WRITE,
    Permisos.ALL_WRITE,
  )
  async updateGroup(
    @Param('id') id: number,
    @Body() dto: UpdateGrupoArticuloDto,
    @GetUser() user: Usuario,
  ) {
    // Combinar permisos de todos los roles del usuario
    const userRoles = user.roles ?? [];
    const userPermissions: Permisos[] = userRoles.flatMap(
      (role) => role.permisos ?? [],
    );

    return await this.almacenService.updateGroup(id, dto, userPermissions);
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
  @Auth()
  @UseGuards(AlmacenPermissionsGuard)
  @AlmacenReadPermissions(
    Permisos.ALMACEN_TALLER_READ,
    Permisos.ALMACEN_COMUN_READ,
    Permisos.ALL_READ,
  )
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
  @Auth()
  @UseGuards(AlmacenPermissionsGuard)
  @AlmacenPermissions(
    Permisos.ALMACEN_TALLER_WRITE,
    Permisos.ALMACEN_COMUN_WRITE,
    Permisos.ALL_WRITE,
  )
  async createMovimiento(
    @Body() dto: CreateEntradaDto | CreateSalidaDto,
    @GetUser() user: Usuario,
  ) {
    // Combinar permisos de todos los roles del usuario
    const userRoles = user.roles ?? [];
    const userPermissions: Permisos[] = userRoles.flatMap(
      (role) => role.permisos ?? [],
    );

    return await this.almacenService.createMovimiento(dto, userPermissions);
  }
}

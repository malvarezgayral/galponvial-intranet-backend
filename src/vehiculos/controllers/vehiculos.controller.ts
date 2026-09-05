import {
  Controller,
  Post,
  Patch,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Get,
  Put,
  Delete,
  Query,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { VehiculosService } from '../services/vehiculo.service';
import { CreateVehiculoDto } from '../dto/create-vehiculo.dto';
import { UpdateVehiculoDto } from '../dto/update-vehiculo.dto';
import { DeleteLogicoVehiculoDto } from '../dto/delete-logico-vehiculo.dto';
import { AssignVehicleToUserDto } from '../dto/assign-vehicle-to-user.dto';
import { Auth } from 'src/usuario/decorators/auth.decorator';
import { ValidRoles } from 'src/usuario/enums/usuario.enum';
import { CreateReporteIncidenteDto } from '../dto/create-reporte-incidente.dto';
import { CreateCombustibleCargaDto } from '../dto/create-combustible-carga.dto';
import { ObjectServiceResponse } from 'src/usuario/interfaces/object-service-response.interface';
import { ReporteIncidenteResponseDto } from '../dto/reporte-incidente-response.dto';
import { Vehiculo } from '../entities/vehiculo.entity';
import { StatusUpdate } from '../entities/status-update.entity';
import { CombustibleCarga } from '../entities/combustible-carga.entity';
import { UsuarioVehiculo } from 'src/usuario/entities/usuario-vehiculo.entity';
import {
  VehiculoStatus,
  TipoVehiculo,
  TipoIncidente,
  StatusIncidente,
  TipoServicio,
} from '../enums/vehiculo.enum';
import { FallaIncidente } from 'src/usuario/enums/usuario.enum';

@ApiTags('Vehículos')
@Controller('vehiculos')
@Auth(ValidRoles.admin)
export class VehiculosController {
  constructor(private readonly vehiculosService: VehiculosService) {}

  @ApiOperation({ summary: 'Crear un vehículo' })
  @ApiBody({ type: CreateVehiculoDto })
  @ApiResponse({
    status: 201,
    description: 'Vehículo creado correctamente',
  })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Auth(ValidRoles.admin, ValidRoles.superadmin)
  create(@Body() createVehiculoDto: CreateVehiculoDto) {
    return this.vehiculosService.create(createVehiculoDto);
  }

  @ApiOperation({
    summary: 'Obtener la estructura de todos los enums disponibles',
  })
  @ApiResponse({
    status: 200,
    description:
      'Estructura de todos los enums disponibles en el módulo de vehículos',
  })
  @Get('enums/estructura')
  @HttpCode(HttpStatus.OK)
  @Auth()
  async getEnumsEstructura(): Promise<
    ObjectServiceResponse<Record<string, string[]>>
  > {
    // Obtener sectores de la base de datos
    const sectores = await this.vehiculosService.getAllSectores();

    const enumsEstructura: Record<string, string[]> = {
      VehiculoStatus: Object.values(VehiculoStatus),
      TipoVehiculo: Object.values(TipoVehiculo),
      TipoIncidente: Object.values(TipoIncidente),
      StatusIncidente: Object.values(StatusIncidente),
      TipoServicio: Object.values(TipoServicio),
      FallaIncidente: Object.values(FallaIncidente),
      Sector: sectores,
    };

    return {
      success: true,
      data: enumsEstructura,
      message: 'Estructura de enums obtenida correctamente',
    };
  }

  @ApiOperation({
    summary: 'Asignar un vehículo a un usuario',
  })
  @ApiBody({ type: AssignVehicleToUserDto })
  @ApiResponse({
    status: 201,
    description: 'Vehículo asignado al usuario correctamente',
  })
  @ApiResponse({
    status: 400,
    description:
      'El usuario no está activo, vehículo en estado inactivo, o relación ya existe',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario o vehículo no encontrado',
  })
  @Post('assign')
  @HttpCode(HttpStatus.CREATED)
  @Auth(ValidRoles.admin, ValidRoles.superadmin)
  async assignVehicleToUser(
    @Body() dto: AssignVehicleToUserDto,
  ): Promise<ObjectServiceResponse<UsuarioVehiculo>> {
    const relacionCreada = await this.vehiculosService.assignVehicleToUser(
      dto.dni,
      dto.id_vehiculo,
    );
    return {
      success: true,
      data: relacionCreada,
      message: 'Vehículo asignado al usuario correctamente',
    };
  }
  @ApiOperation({ summary: 'Obtener todas las relaciones usuario-vehículo' })
  @ApiResponse({
    status: 200,
    description: 'Listado paginado de todas las relaciones usuario-vehículo',
  })
  @Get('usuario-vehiculo')
  @HttpCode(HttpStatus.OK)
  @Auth(ValidRoles.admin, ValidRoles.superadmin)
  async getAllUsuarioVehiculo(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
  ): Promise<
    ObjectServiceResponse<{
      data: UsuarioVehiculo[];
      total: number;
      page: number;
      pageSize: number;
    }>
  > {
    const resultado = await this.vehiculosService.getAllUsuarioVehiculo(
      page,
      pageSize,
    );
    return {
      success: true,
      data: resultado,
      message: `${resultado.total} relaciones usuario-vehículo encontradas (página ${page} de ${Math.ceil(resultado.total / pageSize)})`,
    };
  }

  @ApiOperation({
    summary: 'Desasignar un vehículo de un usuario',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID de la relación usuario-vehículo',
  })
  @ApiResponse({
    status: 200,
    description: 'Vehículo desasignado del usuario correctamente',
  })
  @ApiResponse({
    status: 400,
    description: 'La relación ya ha sido desasignada',
  })
  @ApiResponse({
    status: 404,
    description: 'Relación usuario-vehículo no encontrada',
  })
   @Delete('usuario-vehiculo/:id')
  @HttpCode(HttpStatus.OK)
  @Auth(ValidRoles.superadmin)
  async unassignVehicleFromUser(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ObjectServiceResponse<UsuarioVehiculo>> {
    const relacionActualizada =
      await this.vehiculosService.unassignVehicleFromUser(id);
    return {
      success: true,
      data: relacionActualizada,
      message: 'Vehículo desasignado del usuario correctamente',
    };
  }

  @ApiOperation({ summary: 'Obtener todos los vehículos' })
  @ApiResponse({
    status: 200,
    description: 'Listado de todos los vehículos',
  })
  @Get()
  @HttpCode(HttpStatus.OK)
  @Auth()
  async findAll(): Promise<ObjectServiceResponse<Vehiculo[]>> {
    const vehiculos = await this.vehiculosService.findAll();
    return {
      success: true,

      data: vehiculos,

      message: `${vehiculos.length} vehículos encontrados`,
    };
  }

  @ApiOperation({ summary: 'Actualizar un vehículo por ID' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID del vehículo',
  })
  @ApiBody({ type: UpdateVehiculoDto })
  @ApiResponse({
    status: 200,
    description: 'Vehículo actualizado correctamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Vehículo no encontrado',
  })
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @Auth(ValidRoles.admin, ValidRoles.superadmin)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateVehiculoDto: UpdateVehiculoDto,
  ) {
    return this.vehiculosService.update(id, updateVehiculoDto);
  }

  @Patch(':id/baja')
  @HttpCode(HttpStatus.OK)
  @Auth(ValidRoles.superadmin)
  darDeBaja(@Param('id', ParseIntPipe) id: number) {
    return this.vehiculosService.cambiarStatus(id, false);
  }

  @Patch(':id/alta')
  @HttpCode(HttpStatus.OK)
  @Auth(ValidRoles.superadmin)
  darDeAlta(@Param('id', ParseIntPipe) id: number) {
    return this.vehiculosService.cambiarStatus(id, true);
  }

  @ApiOperation({ summary: 'Agregar un incidente a un vehículo' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID del vehículo',
  })
  @ApiBody({ type: CreateReporteIncidenteDto })
  @ApiResponse({
    status: 201,
    description: 'Incidente registrado correctamente',
    type: ReporteIncidenteResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Vehículo no encontrado',
  })
  @Post(':id/incidentes')
  @HttpCode(HttpStatus.CREATED)
  @Auth(ValidRoles.admin, ValidRoles.superadmin)
  agregarIncidente(
    @Param('id') dni: number,
    @Body() createReporteIncidenteDto: CreateReporteIncidenteDto,
  ): Promise<ReporteIncidenteResponseDto> {
    return this.vehiculosService.agregarIncidente(
      dni,
      createReporteIncidenteDto,
    );
  }

  @ApiOperation({ summary: 'Agregar una carga de combustible a un vehículo' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID del vehículo',
  })
  @ApiBody({ type: CreateCombustibleCargaDto })
  @ApiResponse({
    status: 201,
    description: 'Carga de combustible registrada correctamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Vehículo no encontrado',
  })
  @Post(':id/combustible-cargas')
  @HttpCode(HttpStatus.CREATED)
  @Auth(ValidRoles.admin, ValidRoles.superadmin)
  agregarCombustibleCarga(
    @Param('id', ParseIntPipe) id: number,
    @Body() createCombustibleCargaDto: CreateCombustibleCargaDto,
  ) {
    return this.vehiculosService.agregarCombustibleCarga(
      id,
      createCombustibleCargaDto,
    );
  }

  @Get(':vehiculoId/status-updates')
  @HttpCode(HttpStatus.OK)
  @Auth()
  async getStatusUpdatesPaginado(
    @Param('vehiculoId', ParseIntPipe) vehiculoId: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
  ): Promise<
    ObjectServiceResponse<{
      data: StatusUpdate[];
      total: number;
      page: number;
      pageSize: number;
    }>
  > {
    const result = await this.vehiculosService.getStatusUpdatesPaginado(
      vehiculoId,
      page,
      pageSize,
    );
    return {
      success: true,
      data: result,
      message: `${result.total} status updates encontrados`,
    };
  }

  @ApiOperation({ summary: 'Obtener incidentes paginados de un vehículo' })
  @ApiParam({
    name: 'vehiculoId',
    type: Number,
    description: 'ID del vehículo',
  })
  @ApiResponse({
    status: 200,
    description: 'Listado paginado de incidentes',
  })
  @Get(':vehiculoId/incidentes')
  @HttpCode(HttpStatus.OK)
  @Auth()
  async getIncidentesPaginado(
    @Param('vehiculoId', ParseIntPipe) vehiculoId: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
  ): Promise<
    ObjectServiceResponse<{
      data: ReporteIncidenteResponseDto[];
      total: number;
      page: number;
      pageSize: number;
    }>
  > {
    const result = await this.vehiculosService.getIncidentesPaginado(
      vehiculoId,
      page,
      pageSize,
    );
    return {
      success: true,
      data: result,
      message: `${result.total} incidentes encontrados`,
    };
  }

  @ApiOperation({
    summary: 'Obtener cargas de combustible paginadas de un vehículo',
  })
  @ApiParam({
    name: 'vehiculoId',
    type: Number,
    description: 'ID del vehículo',
  })
  @ApiResponse({
    status: 200,
    description: 'Listado paginado de cargas de combustible',
  })
  @Get(':vehiculoId/combustible-cargas')
  @HttpCode(HttpStatus.OK)
  @Auth()
  async getCombustibleCargasPaginado(
    @Param('vehiculoId', ParseIntPipe) vehiculoId: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
  ): Promise<
    ObjectServiceResponse<{
      data: CombustibleCarga[];
      total: number;
      page: number;
      pageSize: number;
    }>
  > {
    const result = await this.vehiculosService.getCombustibleCargasPaginado(
      vehiculoId,
      page,
      pageSize,
    );
    return {
      success: true,
      data: result,
      message: `${result.total} cargas de combustible encontradas`,
    };
  }

  @ApiOperation({ summary: 'Actualizar status del vehículo con histórico' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID del vehículo',
  })
  @ApiBody({
    schema: {
      properties: {
        nuevoStatus: {
          type: 'string',
          enum: ['disponible', 'en_taller', 'fuera_de_servicio', 'en_uso'],
          example: 'en_taller',
        },
      },
      required: ['nuevoStatus'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Status del vehículo actualizado correctamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Vehículo no encontrado',
  })
  @Put(':id/status')
  @HttpCode(HttpStatus.OK)
  @Auth(ValidRoles.admin)
  async updateVehiculoStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('nuevoStatus') nuevoStatus: VehiculoStatus,
  ): Promise<ObjectServiceResponse<Vehiculo>> {
    const vehiculoActualizado =
      await this.vehiculosService.updateVehiculoStatusConHistorico(
        id,
        nuevoStatus,
      );
    return {
      success: true,
      data: vehiculoActualizado,
      message: `Status del vehículo actualizado a ${nuevoStatus}`,
    };
  }

  @ApiOperation({ summary: 'Eliminar lógicamente un vehículo por ID' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID del vehículo',
  })
  @ApiBody({ type: DeleteLogicoVehiculoDto })
  @ApiResponse({
    status: 200,
    description: 'Vehículo eliminado lógicamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Vehículo no encontrado',
  })
  @Put(':id/eliminar')
  @HttpCode(HttpStatus.OK)
  @Auth(ValidRoles.superadmin)
  async softDelete(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: DeleteLogicoVehiculoDto,
  ): Promise<ObjectServiceResponse<Vehiculo>> {
    const vehiculoEliminado = await this.vehiculosService.softDelete(id, dto);
    return {
      success: true,
      data: vehiculoEliminado,
      message: `Vehículo con ID ${id} ${dto.eliminado ? 'eliminado' : 'restaurado'} correctamente`,
    };
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CsvReaderService } from './csv-reader.service';

// Entidades - Vehiculos
import { Sector } from '../vehiculos/entities/sector.entity';
import { Vehiculo } from '../vehiculos/entities/vehiculo.entity';
import { InfoAdicional } from '../vehiculos/entities/info-adicional.entity';
import { CombustibleCarga } from '../vehiculos/entities/combustible-carga.entity';
import { StatusUpdate } from '../vehiculos/entities/status-update.entity';
import { Recordatorio } from '../vehiculos/entities/recordatorio.entity';

// Entidades - Almacen
import { SectorGalpon } from '../almacen/entities/sector-galpon.entity';
import { UnidadMedidaCuant } from '../almacen/entities/unidad-medida-cuant.entity';
import { GrupoArticulo } from '../almacen/entities/grupo-articulo.entity';
import { Articulo } from '../almacen/entities/articulo.entity';
import { Movimiento } from '../almacen/entities/movimiento.entity';
import { Entrada } from '../almacen/entities/entrada.entity';
import { Salida } from '../almacen/entities/salida.entity';

// Entidades - Usuario
import { Rol } from '../usuario/entities/rol.entity';
import { Usuario } from '../usuario/entities/usuario.entity';
import { UsuarioRol } from '../usuario/entities/usuario-rol.entity';
import { UsuarioVehiculo } from '../usuario/entities/usuario-vehiculo.entity';
import { ReporteIncidente } from '../usuario/entities/reporte-incidente.entity';
import { Servicio } from '../usuario/entities/servicio.entity';
import { RefreshToken } from '../usuario/entities/refresh-token.entity';

import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private csvReaderService: CsvReaderService,
    @InjectRepository(Sector)
    private sectorRepository: Repository<Sector>,
    @InjectRepository(SectorGalpon)
    private sectorGalponRepository: Repository<SectorGalpon>,
    @InjectRepository(UnidadMedidaCuant)
    private unidadMedidaCuantRepository: Repository<UnidadMedidaCuant>,
    @InjectRepository(GrupoArticulo)
    private grupoArticuloRepository: Repository<GrupoArticulo>,
    @InjectRepository(Articulo)
    private articuloRepository: Repository<Articulo>,
    @InjectRepository(Vehiculo)
    private vehiculoRepository: Repository<Vehiculo>,
    @InjectRepository(InfoAdicional)
    private infoAdicionalRepository: Repository<InfoAdicional>,
    @InjectRepository(Movimiento)
    private movimientoRepository: Repository<Movimiento>,
    @InjectRepository(Entrada)
    private entradaRepository: Repository<Entrada>,
    @InjectRepository(Salida)
    private salidaRepository: Repository<Salida>,
    @InjectRepository(CombustibleCarga)
    private combustibleCargaRepository: Repository<CombustibleCarga>,
    @InjectRepository(StatusUpdate)
    private statusUpdateRepository: Repository<StatusUpdate>,
    @InjectRepository(Recordatorio)
    private recordatorioRepository: Repository<Recordatorio>,
    @InjectRepository(Rol)
    private rolRepository: Repository<Rol>,
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
    @InjectRepository(UsuarioRol)
    private usuarioRolRepository: Repository<UsuarioRol>,
    @InjectRepository(UsuarioVehiculo)
    private usuarioVehiculoRepository: Repository<UsuarioVehiculo>,
    @InjectRepository(ReporteIncidente)
    private reporteIncidenteRepository: Repository<ReporteIncidente>,
    @InjectRepository(Servicio)
    private servicioRepository: Repository<Servicio>,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  /**
   * Ejecuta el seed completo respetando jerarquía de relaciones
   */
  async seed(): Promise<{ message: string; results: Record<string, number> }> {
    this.logger.log('Iniciando seed de base de datos...');
    const results: Record<string, number> = {};

    try {
      // Orden de inserción respetando foreign keys
      results['sector'] = await this.seedSectores();
      results['sector_galpon'] = await this.seedSectoresGalpon();
      results['unidad_medida_cuant'] = await this.seedUnidadesMedida();
      results['grupo_articulo'] = await this.seedGruposArticulo();
      results['articulo'] = await this.seedArticulos();
      results['vehiculo'] = await this.seedVehiculos();
      results['info_adicional'] = await this.seedInfoAdicional();
      results['movimiento'] = await this.seedMovimientos();
      results['entrada'] = await this.seedEntradas();
      results['salida'] = await this.seedSalidas();
      results['combustible_carga'] = await this.seedCombustibleCarga();
      results['status_update'] = await this.seedStatusUpdate();

      // Orden de inserción para módulo usuario (respetando FK)
      results['rol'] = await this.seedRoles();
      //results['usuario'] = await this.seedUsuarios();
      //results['usuario_rol'] = await this.seedUsuariosRoles();
      results['recordatorio'] = await this.seedRecordatorios();

      results['refresh_token'] = await this.seedRefreshTokens();
      results['usuario_vehiculo'] = await this.seedUsuariosVehiculos();
      results['reporte_incidente'] = await this.seedReportesIncidentes();
      results['servicio'] = await this.seedServicios();

      this.logger.log('✓ Seed completado exitosamente');
      return {
        message: 'Base de datos poblada exitosamente',
        results,
      };
    } catch (error) {
      this.logger.error('Error durante seed:', error);
      throw error;
    }
  }

  public async seedRolesByUser(): Promise<{
    message: string;
    results: Record<string, number>;
  }> {
    this.logger.log('Iniciando seed de roles...');
    const results: Record<string, number> = {};

    try {
      results['rol'] = await this.seedRoles();

      this.logger.log('✓ Seed de roles completado exitosamente');
      return {
        message: 'Roles poblados exitosamente',
        results,
      };
    } catch (error) {
      this.logger.error('Error durante seed de roles:', error);
      throw error;
    }
  }

  public async seedUsers(): Promise<{
    message: string;
    results: Record<string, number>;
  }> {
    this.logger.log('Iniciando seed de usuarios...');
    const results: Record<string, number> = {};

    try {
      results['usuario'] = await this.seedUsuarios();

      this.logger.log('✓ Seed de usuarios completado exitosamente');
      return {
        message: 'Usuarios poblados exitosamente',
        results,
      };
    } catch (error) {
      this.logger.error('Error durante seed de usuarios:', error);
      throw error;
    }
  }

  private async seedSectores(): Promise<number> {
    this.logger.log('Cargando sectores...');
    const data = await this.csvReaderService.readCsv('sectores');
    await this.sectorRepository.save(data);
    this.logger.log(`✓ ${data.length} sectores cargados`);
    return data.length;
  }

  private async seedSectoresGalpon(): Promise<number> {
    this.logger.log('Cargando sectores de galpon...');
    const data = await this.csvReaderService.readCsv('sectores_galpon');
    await this.sectorGalponRepository.save(data);
    this.logger.log(`✓ ${data.length} sectores de galpon cargados`);
    return data.length;
  }

  private async seedUnidadesMedida(): Promise<number> {
    this.logger.log('Cargando unidades de medida...');
    const data = await this.csvReaderService.readCsv('unidades_medida');
    await this.unidadMedidaCuantRepository.save(data);
    this.logger.log(`✓ ${data.length} unidades de medida cargadas`);
    return data.length;
  }

  private async seedGruposArticulo(): Promise<number> {
    this.logger.log('Cargando grupos de artículos...');
    const data = await this.csvReaderService.readCsv('grupos_articulo');
    // Mapear ubicacion a id de sector
    const mappedData = data.map((item) => ({
      ...item,
      sector: { id: Number(item.ubicacion) },
    }));
    await this.grupoArticuloRepository.save(mappedData);
    this.logger.log(`✓ ${data.length} grupos de artículos cargados`);
    return data.length;
  }

  private async seedArticulos(): Promise<number> {
    this.logger.log('Cargando artículos...');
    const data = await this.csvReaderService.readCsv('articulos');
    const mappedData = data.map((item) => {
      const mapped: any = {
        ...item,
        grupo: { id: Number(item.grupo_id) },
      };
      if (item.unidad_medida_id) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        mapped.unidadMedida = { id: Number(item.unidad_medida_id) };
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return mapped;
    });
    await this.articuloRepository.save(mappedData);
    this.logger.log(`✓ ${data.length} artículos cargados`);
    return data.length;
  }

  private async seedVehiculos(): Promise<number> {
    this.logger.log('Cargando vehículos...');
    const data = await this.csvReaderService.readCsv('vehiculos');

    const mappedData = data.map((item) => ({
      ...item,
      nombre: (!item.nombre ||
      String(item.nombre).toLowerCase().trim() === 'sin info'
        ? `${item.marca} ${item.modelo} ${item.anio}`
        : item.nombre) as string,
    }));

    await this.vehiculoRepository.save(mappedData);
    this.logger.log(`✓ ${data.length} vehículos cargados`);
    return data.length;
  }

  private async seedInfoAdicional(): Promise<number> {
    this.logger.log('Cargando información adicional de vehículos...');
    const data = await this.csvReaderService.readCsv('info_adicional');
    const mappedData = data.map((item) => ({
      ...item,
      vehiculo: { id_vehiculo: Number(item.id_vehiculo) },
      sector: { id_sector: Number(item.id_sector_pertenencia) },
    }));
    await this.infoAdicionalRepository.save(mappedData);
    this.logger.log(
      `✓ ${data.length} registros de información adicional cargados`,
    );
    return data.length;
  }

  private async seedMovimientos(): Promise<number> {
    this.logger.log('Cargando movimientos...');
    const data = await this.csvReaderService.readCsv('movimientos');
    const mappedData = data.map((item) => ({
      ...item,
      articulo: { cod: Number(item.articulo_id) },
    }));
    await this.movimientoRepository.save(mappedData);
    this.logger.log(`✓ ${data.length} movimientos cargados`);
    return data.length;
  }

  private async seedEntradas(): Promise<number> {
    this.logger.log('Cargando entradas...');
    const data = await this.csvReaderService.readCsv('entradas');
    const mappedData = data.map((item) => ({
      ...item,
      movimiento: { id: Number(item.movimiento_id) },
    }));
    await this.entradaRepository.save(mappedData);
    this.logger.log(`✓ ${data.length} entradas cargadas`);
    return data.length;
  }

  private async seedSalidas(): Promise<number> {
    this.logger.log('Cargando salidas...');
    const data = await this.csvReaderService.readCsv('salidas');
    const mappedData = data.map((item) => ({
      ...item,
      movimiento: { id: Number(item.movimiento_id) },
    }));
    await this.salidaRepository.save(mappedData);
    this.logger.log(`✓ ${data.length} salidas cargadas`);
    return data.length;
  }

  private async seedCombustibleCarga(): Promise<number> {
    this.logger.log('Cargando combustible carga...');
    const data = await this.csvReaderService.readCsv('combustible_carga');
    const mappedData = data.map((item) => ({
      ...item,
      vehiculo: { id_vehiculo: Number(item.id_vehiculo) },
    }));
    await this.combustibleCargaRepository.save(mappedData);
    this.logger.log(`✓ ${data.length} registros de combustible cargados`);
    return data.length;
  }

  private async seedStatusUpdate(): Promise<number> {
    this.logger.log('Cargando actualizaciones de estado...');
    const data = await this.csvReaderService.readCsv('status_update');
    const mappedData = data.map((item) => ({
      ...item,
      vehiculo: { id_vehiculo: Number(item.id_vehiculo) },
    }));
    await this.statusUpdateRepository.save(mappedData);
    this.logger.log(`✓ ${data.length} actualizaciones de estado cargadas`);
    return data.length;
  }

  private async seedRecordatorios(): Promise<number> {
    this.logger.log('Cargando recordatorios...');
    const data = await this.csvReaderService.readCsv('recordatorios');
    const mappedData = data.map((item) => ({
      ...item,
      usuario: { dni: Number(item.dni_usuario) },
    }));
    await this.recordatorioRepository.save(mappedData);
    this.logger.log(`✓ ${data.length} recordatorios cargados`);
    return data.length;
  }

  // ===== Seeders del módulo Usuario =====

  private async seedRoles(): Promise<number> {
    this.logger.log('Cargando roles...');
    const data = await this.csvReaderService.readCsv('roles');

    // Agrupar todos los permisos de cada rol en una sola fila
    // (antes: una fila por cada permiso individual, generaba filas duplicadas por rol)
    const rolesMap = new Map<string, string[]>();
    for (const item of data) {
      const nombreRol = item.rol as string;
      if (!rolesMap.has(nombreRol)) {
        rolesMap.set(nombreRol, []);
      }
      rolesMap.get(nombreRol)!.push(item.permisos as string);
    }

    const mappedData = Array.from(rolesMap.entries()).map(
      ([rol, permisos]) => ({
        rol,
        permisos,
      }),
    ) as unknown as Partial<Rol>[];

    for (const item of mappedData) {
      const existente = await this.rolRepository.findOne({
        where: { rol: item.rol },
      });
      if (existente) {
        existente.permisos = item.permisos as Rol["permisos"];
        await this.rolRepository.save(existente);
      } else {
        await this.rolRepository.save(item);
      }
    }
    this.logger.log(`✓ ${mappedData.length} roles cargados`);
    return mappedData.length;
  }

  private async seedUsuarios(): Promise<number> {
    this.logger.log('Cargando usuarios...');
    const data = await this.csvReaderService.readCsv('usuarios');

    const salt = await bcrypt.genSalt();

    const mappedData = await Promise.all(
      data.map(async (item) => ({
        dni: Number(item.dni),
        nombre: String(item.nombre),
        apellido: String(item.apellido),
        email: String(item.email),
        password: await bcrypt.hash(item.password as string, salt),
        isActive: item.isActive === 'true',
        tokenVersion: Number(item.tokenVersion),
        fecha_alta: new Date(item.fecha_alta as string),
        fecha_baja: item.fecha_baja
          ? new Date(item.fecha_baja as string)
          : null,
        rol_id: Number(item.rol_id),
      })),
    );
    await this.usuarioRepository.save(mappedData);
    this.logger.log(`✓ ${data.length} usuarios cargados`);
    return data.length;
  }

  private async seedUsuariosRoles(): Promise<number> {
    this.logger.log('Cargando asignaciones usuario-rol...');
    const data = await this.csvReaderService.readCsv('usuario_rol');
    const mappedData = data.map((item) => ({
      dni: Number(item.dni),
      rol_id: Number(item.rol_id),
    })) as Partial<UsuarioRol>[];
    await this.usuarioRolRepository.save(mappedData);
    this.logger.log(`✓ ${data.length} asignaciones usuario-rol cargadas`);
    return data.length;
  }

  private async seedUsuariosVehiculos(): Promise<number> {
    this.logger.log('Cargando asignaciones usuario-vehículo...');
    const data = await this.csvReaderService.readCsv('usuarios_vehiculos');
    const mappedData = data.map((item) => ({
      id_usuario_vehiculo: Number(item.id_usuario_vehiculo),
      id_vehiculo: Number(item.id_vehiculo),
      id_usuario: Number(item.id_usuario),
      fecha_desde: new Date(item.fecha_desde as string),
      fecha_hasta: item.fecha_hasta
        ? new Date(item.fecha_hasta as string)
        : null,
    })) as Partial<UsuarioVehiculo>[];
    await this.usuarioVehiculoRepository.save(mappedData);
    this.logger.log(`✓ ${data.length} asignaciones usuario-vehículo cargadas`);
    return data.length;
  }

  private async seedReportesIncidentes(): Promise<number> {
    this.logger.log('Cargando reportes de incidentes...');
    const data = await this.csvReaderService.readCsv('reportes_incidentes');
    const mappedData = data.map((item) => ({
      id: Number(item.id),
      fecha: new Date(item.fecha as string),
      tipo: String(item.tipo),
      descripcion: String(item.descripcion),
      falla: item.falla as string,
      id_usuario: Number(item.id_usuario),
      id_vehiculo: Number(item.id_vehiculo),
    })) as Partial<ReporteIncidente>[];
    await this.reporteIncidenteRepository.save(mappedData);
    this.logger.log(`✓ ${data.length} reportes de incidentes cargados`);
    return data.length;
  }

  private async seedServicios(): Promise<number> {
    this.logger.log('Cargando servicios...');
    const data = await this.csvReaderService.readCsv('servicios');
    const mappedData = data.map((item) => ({
      id: Number(item.id),
      tipo: String(item.tipo),
      fecha_inicio: new Date(item.fecha_inicio as string),
      fecha_hasta: new Date(item.fecha_hasta as string),
      descripcion: String(item.descripcion),
      incidente_id: item.incidente_id ? Number(item.incidente_id) : null,
    })) as Partial<Servicio>[];
    await this.servicioRepository.save(mappedData);
    this.logger.log(`✓ ${data.length} servicios cargados`);
    return data.length;
  }

  private async seedRefreshTokens(): Promise<number> {
    this.logger.log('Cargando refresh tokens...');
    const data = await this.csvReaderService.readCsv('refresh_tokens');
    const mappedData = data.map((item) => ({
      id: Number(item.id),
      expiresAt: new Date(item.expiresAt as string),
      tokenHash: String(item.tokenHash),
      revoked: item.revoked === 'true',
      dni_usuario: Number(item.dni_usuario),
    })) as Partial<RefreshToken>[];
    await this.refreshTokenRepository.save(mappedData);
    this.logger.log(`✓ ${data.length} refresh tokens cargados`);
    return data.length;
  }
}

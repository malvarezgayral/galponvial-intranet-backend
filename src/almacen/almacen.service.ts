import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { BadRequestException } from '@nestjs/common';

import { Articulo } from './entities/articulo.entity';
import { GrupoArticulo } from './entities/grupo-articulo.entity';
import { Movimiento } from './entities/movimiento.entity';
import { Entrada } from './entities/entrada.entity';
import { Salida, SalidaTipo } from './entities/salida.entity';
import { SectorGalpon } from './entities/sector-galpon.entity';

import { CreateArticuloDto } from './dto/create-articulo.dto';
import { UpdateArticuloDto } from './dto/update-articulo.dto';

import { CreateGrupoArticuloDto } from './dto/create-grupo-articulo.dto';
import { UpdateGrupoArticuloDto } from './dto/update-grupo-articulo.dto';

import { GrupoArticuloDto } from './dto/grupo-articulo.dto';
import { MovimientoDTO } from './dto/movimiento.dto';
import { EntradaTipo, MovimientoTipo, SectorTipo } from './enums/almacen.enum';
import { CreateSalidaDto } from './dto/create-salida.dto';
import { CreateEntradaDto } from './dto/create-entrada.dto';
import { UnidadMedidaCuant } from './entities/unidad-medida-cuant.entity';
import { Permisos } from '../usuario/enums/usuario.enum';
import { SectorGalponDto } from './dto/sector-galpon.dto';

@Injectable()
export class AlmacenService {
  constructor(
    private dataSource: DataSource,

    @InjectRepository(Articulo)
    private readonly articuloRepo: Repository<Articulo>,

    @InjectRepository(GrupoArticulo)
    private readonly grupoRepo: Repository<GrupoArticulo>,

    @InjectRepository(Movimiento)
    private readonly movimientoRepo: Repository<Movimiento>,

    @InjectRepository(Entrada)
    private readonly entradaRepo: Repository<Entrada>,

    @InjectRepository(Salida)
    private readonly salidaRepo: Repository<Salida>,

    @InjectRepository(UnidadMedidaCuant)
    private readonly unidadRepo: Repository<UnidadMedidaCuant>,

    @InjectRepository(SectorGalpon)
    private readonly sectorGalponRepo: Repository<SectorGalpon>,
  ) {}

  // ---------------------- ARTÍCULOS ----------------------

  async getAllArticles(
    page: number = 1,
    pageSize: number = 10,
    userPermissions?: Permisos[],
  ): Promise<{
    data: Articulo[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    // Construir query base con relaciones
    const query = this.articuloRepo
      .createQueryBuilder('articulo')
      .leftJoinAndSelect('articulo.grupo', 'grupo')
      .leftJoinAndSelect('articulo.unidadMedida', 'unidad')
      .leftJoinAndSelect('grupo.sector', 'sector');

    // Aplicar filtros según permisos del usuario
    if (userPermissions && userPermissions.length > 0) {
      // Verificar si el usuario tiene permisos ALL_READ (acceso a todo)
      const hasAllReadPermissions = userPermissions.some((p) =>
        [Permisos.ALL_READ].includes(p),
      );

      if (!hasAllReadPermissions) {
        // Filtrar por tipo de sector según SOLO permisos de LECTURA
        const allowedSectorTypes: SectorTipo[] = [];

        if (userPermissions.includes(Permisos.ALMACEN_TALLER_READ)) {
          allowedSectorTypes.push(SectorTipo.ALMACEN_TALLER);
        }

        if (userPermissions.includes(Permisos.ALMACEN_COMUN_READ)) {
          allowedSectorTypes.push(SectorTipo.ALMACEN_COMUN);
        }

        // Si el usuario tiene al menos un permiso de lectura, aplicar filtro
        if (allowedSectorTypes.length > 0) {
          query.andWhere('sector.tipo IN (:...sectorTypes)', {
            sectorTypes: allowedSectorTypes,
          });
        }
      }
      // Si tiene ALL_READ, no aplicar filtro (ver todos)
    }

    // Aplicar paginación y orden
    query
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('articulo.cod', 'ASC');

    const [data, total] = await query.getManyAndCount();

    return { data, total, page, pageSize };
  }

  /**
   * Valida que el usuario tenga permiso WRITE para el sector especificado
   * @param sectorTipo Tipo de sector (ALMACEN_TALLER, ALMACEN_COMUN)
   * @param userPermissions Permisos WRITE del usuario
   * @throws ForbiddenException si el usuario no tiene permiso WRITE para ese sector
   */
  private validateWritePermissionBySectorTipo(
    sectorTipo: SectorTipo,
    userPermissions: Permisos[],
  ): void {
    // Verificar si tiene ALL_WRITE (acceso a todo)
    const hasAllWritePermissions = userPermissions.some((p) =>
      [Permisos.ALL_WRITE].includes(p),
    );

    if (hasAllWritePermissions) {
      return; // Tiene acceso total
    }

    // Validar permisos según el sector
    if (sectorTipo === SectorTipo.ALMACEN_TALLER) {
      if (!userPermissions.includes(Permisos.ALMACEN_TALLER_WRITE)) {
        throw new ForbiddenException(
          'No tiene permisos de escritura en el almacén de taller',
        );
      }
    } else if (sectorTipo === SectorTipo.ALMACEN_COMUN) {
      if (!userPermissions.includes(Permisos.ALMACEN_COMUN_WRITE)) {
        throw new ForbiddenException(
          'No tiene permisos de escritura en el almacén común',
        );
      }
    }
  }

  /**
   * Valida que el usuario tenga permiso WRITE para el sector del grupo especificado
   * @param grupoId ID del grupo del artículo
   * @param userPermissions Permisos WRITE del usuario
   * @throws ForbiddenException si el usuario no tiene permiso WRITE para ese sector
   */
  private async validateWritePermissionByGrupoId(
    grupoId: number,
    userPermissions: Permisos[],
  ): Promise<void> {
    // Obtener el grupo con su sector
    const grupo = await this.grupoRepo.findOne({
      where: { id: grupoId },
      relations: ['sector'],
    });

    if (!grupo) {
      throw new BadRequestException(`Grupo de artículo ${grupoId} no existe`);
    }

    // Validar permisos según el sector del grupo
    this.validateWritePermissionBySectorTipo(
      grupo.sector.tipo,
      userPermissions,
    );
  }

  /**
   * Valida que el usuario tenga permiso WRITE para el sector del artículo especificado
   * @param articuloCod Código del artículo
   * @param userPermissions Permisos WRITE del usuario
   * @throws ForbiddenException si el usuario no tiene permiso WRITE para ese sector
   */
  private async validateWritePermissionByArticuloCod(
    articuloCod: number,
    userPermissions: Permisos[],
  ): Promise<void> {
    // Obtener el artículo con su grupo y sector
    const articulo = await this.articuloRepo.findOne({
      where: { cod: articuloCod },
      relations: ['grupo', 'grupo.sector'],
    });

    if (!articulo) {
      throw new NotFoundException(`Artículo ${articuloCod} no encontrado`);
    }

    // Validar permisos según el sector del artículo
    this.validateWritePermissionBySectorTipo(
      articulo.grupo.sector.tipo,
      userPermissions,
    );
  }

  async createArticle(dto: CreateArticuloDto, userPermissions?: Permisos[]) {
    // Obtener el grupo (obligatorio)
    const grupo = await this.grupoRepo.findOne({
      where: { id: dto.grupo_id },
      relations: ['sector'],
    });

    if (!grupo) {
      throw new BadRequestException(
        `Grupo de artículo ${dto.grupo_id} no existe`,
      );
    }

    // Validar permisos WRITE para el sector del grupo
    if (userPermissions && userPermissions.length > 0) {
      this.validateWritePermissionBySectorTipo(
        grupo.sector.tipo,
        userPermissions,
      );
    }

    // Crear el artículo con el grupo asignado
    const art = this.articuloRepo.create(dto);
    art.grupo = grupo;
    return await this.articuloRepo.save(art);
  }

  async updateArticle(
    cod: number,
    dto: UpdateArticuloDto,
    userPermissions?: Permisos[],
  ) {
    const art = await this.articuloRepo.findOne({
      where: { cod },
      relations: ['grupo', 'grupo.sector', 'unidadMedida'],
    });

    if (!art) {
      throw new NotFoundException(`Artículo ${cod} no encontrado`);
    }

    // Validar permisos WRITE para el artículo actual
    if (userPermissions && userPermissions.length > 0) {
      await this.validateWritePermissionByArticuloCod(cod, userPermissions);
    }

    // Actualizar propiedades simples
    if (dto.nombre !== undefined) art.nombre = dto.nombre;
    if (dto.descripcion !== undefined) art.descripcion = dto.descripcion;
    if (dto.modelo !== undefined) art.modelo = dto.modelo;
    if (dto.img_url !== undefined) art.img_url = dto.img_url;
    if (dto.unidad_tipo !== undefined) art.unidad_tipo = dto.unidad_tipo;
    if (dto.stock !== undefined) art.stock = dto.stock;
    if (dto.cod_proveedor !== undefined) art.cod_proveedor = dto.cod_proveedor;

    // Actualizar relación: Grupo
    if (dto.grupo_id !== undefined) {
      // Validar que el nuevo grupo esté en un sector permitido
      if (userPermissions && userPermissions.length > 0) {
        await this.validateWritePermissionByGrupoId(
          dto.grupo_id,
          userPermissions,
        );
      }

      const grupo = await this.grupoRepo.findOne({
        where: { id: dto.grupo_id },
      });

      if (!grupo) {
        throw new BadRequestException(
          `Grupo de artículo ${dto.grupo_id} no existe`,
        );
      }

      art.grupo = grupo;
    }

    // Actualizar relación: Unidad de Medida
    if (dto.unidad_medida_id !== undefined) {
      const unidad = await this.unidadRepo.findOne({
        where: { id: dto.unidad_medida_id },
      });

      if (!unidad) {
        throw new BadRequestException(
          `Unidad de medida ${dto.unidad_medida_id} no existe`,
        );
      }

      art.unidadMedida = unidad;
    }

    return this.articuloRepo.save(art);
  }

  async deleteArticle(cod: number, userPermissions?: Permisos[]) {
    // Validar permisos WRITE para el artículo a eliminar
    if (userPermissions && userPermissions.length > 0) {
      await this.validateWritePermissionByArticuloCod(cod, userPermissions);
    }

    const r = await this.articuloRepo.delete({ cod });
    if (r.affected === 0)
      throw new NotFoundException(`Artículo ${cod} no encontrado`);

    return true;
  }

  // src/almacen/almacen.service.ts

  async getArticleById(id: number) {
    const articulo = await this.articuloRepo.findOne({
      where: { cod: id },
      // Cargamos relaciones por si en el futuro quieres mostrar el Grupo o la Unidad
      relations: ['grupo', 'unidadMedida'],
    });

    if (!articulo) {
      throw new NotFoundException(`Artículo con código ${id} no encontrado`);
    }

    // Mapeamos a un objeto plano para ajustar nombres de propiedades al Frontend
    // (Específicamente img_url -> img)
    return {
      cod: articulo.cod,
      cod_proveedor: articulo.cod_proveedor,
      nombre: articulo.nombre,
      modelo: articulo.modelo,
      descripcion: articulo.descripcion,
      img: articulo.img_url,
      stock: articulo.stock,
      unidad_tipo: articulo.unidad_tipo,
      grupo: articulo.grupo.nombre,
      unidad_medida: articulo.unidadMedida ? articulo.unidadMedida.tipo : null,
    };
  }

  //---------------------- SECTORES ----------------------

  async getAllSectores(): Promise<SectorGalponDto[]> {
    const sectores = await this.sectorGalponRepo.find({
      order: {
        nro_sector: 'ASC',
      },
    });

    if (!sectores || sectores.length === 0) {
      throw new NotFoundException('No existen sectores registrados');
    }

    return sectores.map((sector) => ({
      id: sector.id,
      nro_sector: sector.nro_sector,
      tipo: sector.tipo,
      descripcion: sector.descripcion,
    }));
  }

  // ---------------------- GRUPOS ----------------------

  async getAllGroups() {
    return await this.grupoRepo.find({
      relations: ['sector'],
    });
  }

  async getGroup(id: number): Promise<GrupoArticuloDto> {
    const grupo = await this.grupoRepo.findOne({
      where: { id },
      relations: ['sector'],
    });

    if (!grupo) {
      throw new NotFoundException('Grupo no encontrado');
    }

    const articulos = await this.articuloRepo.find({
      where: { grupo: { id } },
    });

    const articulosDto: UpdateArticuloDto[] = articulos.map((a) => ({
      cod: a.cod,
      cod_proveedor: a.cod_proveedor,
      nombre: a.nombre,
      modelo: a.modelo,
      descripcion: a.descripcion,
      img_url: a.img_url,
      unidad_tipo: a.unidad_tipo,
    }));

    const dto: GrupoArticuloDto = {
      id: grupo.id,
      nombre: grupo.nombre,
      descripcion: grupo.descripcion,
      sector_galpon: grupo.sector.nro_sector,
      articulos: articulosDto,
    };

    return dto;
  }

  async createGroup(dto: CreateGrupoArticuloDto, userPermissions?: Permisos[]) {
    // Obtener el sector para validar permisos
    const sector = await this.sectorGalponRepo.findOne({
      where: { id: dto.sector_id },
    });

    if (!sector) {
      throw new BadRequestException(`Sector ${dto.sector_id} no existe`);
    }

    // Validar permisos WRITE para el sector
    if (userPermissions && userPermissions.length > 0) {
      this.validateWritePermissionBySectorTipo(sector.tipo, userPermissions);
    }

    const g = this.grupoRepo.create(dto);
    g.sector = sector;
    return await this.grupoRepo.save(g);
  }

  async updateGroup(
    id: number,
    dto: UpdateGrupoArticuloDto,
    userPermissions?: Permisos[],
  ) {
    const g = await this.grupoRepo.findOne({
      where: { id },
      relations: ['sector'],
    });

    if (!g) throw new NotFoundException(`Grupo ${id} no encontrado`);

    // Validar permisos WRITE para el sector actual del grupo
    if (userPermissions && userPermissions.length > 0) {
      this.validateWritePermissionBySectorTipo(g.sector.tipo, userPermissions);
    }

    // Si se está cambiando el sector, validar permisos para el nuevo sector
    if (dto.sector_id !== undefined && dto.sector_id !== g.sector.id) {
      const newSector = await this.sectorGalponRepo.findOne({
        where: { id: dto.sector_id },
      });

      if (!newSector) {
        throw new BadRequestException(`Sector ${dto.sector_id} no existe`);
      }

      if (userPermissions && userPermissions.length > 0) {
        this.validateWritePermissionBySectorTipo(
          newSector.tipo,
          userPermissions,
        );
      }
    }

    Object.assign(g, dto);
    return this.grupoRepo.save(g);
  }

  // ---------------------- MOVIMIENTOS ----------------------

  async getMovimientosByArticulo(
    codArticulo: number,
  ): Promise<MovimientoDTO[]> {
    const articulo = await this.articuloRepo.findOne({
      where: { cod: codArticulo },
    });

    if (!articulo) {
      throw new NotFoundException('Artículo no encontrado');
    }

    const movimientos = await this.movimientoRepo.find({
      where: { articulo: { cod: codArticulo } },
      relations: ['articulo'],
    });

    const result: MovimientoDTO[] = [];

    for (const mov of movimientos) {
      const entrada = await this.entradaRepo.findOne({
        where: { movimiento: { id: mov.id } },
      });

      const salida = await this.salidaRepo.findOne({
        where: { movimiento: { id: mov.id } },
      });

      const dto = new MovimientoDTO();
      dto.tipoMovimiento = mov.tipo;
      dto.fecha = mov.fecha;
      dto.codArticulo = mov.articulo.cod;
      dto.dniUsuario = mov.usuario_id;

      if (mov.tipo === MovimientoTipo.ENTRADA && entrada) {
        dto.motivo = entrada.tipo;
        dto.detalle = entrada.detalle;
      } else if (mov.tipo === MovimientoTipo.SALIDA && salida) {
        dto.motivo = salida.tipo;

        dto.detalle =
          salida.detalle_motivo ?? salida.detalle ?? salida.motivo_salida;
      } else {
        dto.motivo = mov.tipo;
        dto.detalle = '';
      }

      result.push(dto);
    }

    return result;
  }

  async createMovimiento(
    dto: CreateEntradaDto | CreateSalidaDto,
    dniUsuario: number,
    userPermissions?: Permisos[],
  ) {
    return await this.dataSource.transaction(async (manager) => {
      // -------------------------
      // 1. Identificar tipo mov
      // -------------------------
      const esEntrada = Object.values(EntradaTipo).includes(
        dto.tipo as EntradaTipo,
      );
      const esSalida = Object.values(SalidaTipo).includes(
        dto.tipo as SalidaTipo,
      );

      if (!esEntrada && !esSalida) {
        throw new BadRequestException(
          'No se pudo determinar si el movimiento es ENTRADA o SALIDA.',
        );
      }

      // -------------------------
      // 2. Buscar Artículo
      // -------------------------
      const articulo = await manager.getRepository(Articulo).findOne({
        where: { cod: dto.cod_articulo },
        relations: ['grupo', 'grupo.sector'],
      });

      if (!articulo) {
        throw new NotFoundException(
          `No existe un artículo con cod '${dto.cod_articulo}'`,
        );
      }

      // Validar permisos WRITE para el sector del artículo
      if (userPermissions && userPermissions.length > 0) {
        this.validateWritePermissionBySectorTipo(
          articulo.grupo.sector.tipo,
          userPermissions,
        );
      }

      // -------------------------
      // 3. Crear Movimiento
      // -------------------------

      // usuario hardcodeado para pruebas hasta poder determinar realmente el id de un usuario logueado
      const movimiento = manager.getRepository(Movimiento).create({
        tipo: esEntrada ? MovimientoTipo.ENTRADA : MovimientoTipo.SALIDA,
        fecha: new Date(),
        articulo,
        usuario_id: dniUsuario,
      });

      const movimientoGuardado = await manager
        .getRepository(Movimiento)
        .save(movimiento);

      // -------------------------
      // 4. Crear ENTRADA
      // -------------------------
      if (esEntrada) {
        const dtoEntrada = dto as CreateEntradaDto;

        const entrada = manager.getRepository(Entrada).create({
          tipo: dtoEntrada.tipo,
          detalle: dtoEntrada.detalle,
          proveedor: dtoEntrada.proveedor,
          movimiento: movimientoGuardado,
        });

        const entradaGuardada = await manager
          .getRepository(Entrada)
          .save(entrada);

        return {
          message: 'Entrada registrada correctamente.',
          movimiento: movimientoGuardado,
          entrada: entradaGuardada,
        };
      }

      // -------------------------
      // 5. Crear SALIDA
      // -------------------------
      if (esSalida) {
        const dtoSalida = dto as CreateSalidaDto;

        const salida = manager.getRepository(Salida).create({
          tipo: dtoSalida.tipo,
          detalle: dtoSalida.detalle,
          motivo_salida: dtoSalida.motivo_salida,
          detalle_motivo: dtoSalida.detalle_motivo,
          movimiento: movimientoGuardado,
        });

        const salidaGuardada = await manager.getRepository(Salida).save(salida);

        return {
          message: 'Salida registrada correctamente.',
          movimiento: movimientoGuardado,
          salida: salidaGuardada,
        };
      }
    });
  }

  /**
   * Obtiene el tipo de sector de un artículo
   * articulo -> grupo -> sector -> tipo
   */
  async getSectorTipoByArticulo(codArticulo: number): Promise<SectorTipo> {
    const articulo = await this.articuloRepo.findOne({
      where: { cod: codArticulo },
      relations: ['grupo', 'grupo.sector'],
    });

    if (!articulo) {
      throw new NotFoundException(`Artículo ${codArticulo} no encontrado`);
    }

    if (!articulo.grupo || !articulo.grupo.sector) {
      throw new BadRequestException(
        `Artículo ${codArticulo} no tiene sector asociado`,
      );
    }

    return articulo.grupo.sector.tipo;
  }

  /**
   * Obtiene el tipo de sector de un grupo
   * grupo -> sector -> tipo
   */
  async getSectorTipoByGrupo(idGrupo: number): Promise<SectorTipo> {
    const grupo = await this.grupoRepo.findOne({
      where: { id: idGrupo },
      relations: ['sector'],
    });

    if (!grupo) {
      throw new NotFoundException(`Grupo ${idGrupo} no encontrado`);
    }

    if (!grupo.sector) {
      throw new BadRequestException(
        `Grupo ${idGrupo} no tiene sector asociado`,
      );
    }

    return grupo.sector.tipo;
  }
}

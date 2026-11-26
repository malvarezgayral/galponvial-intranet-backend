// src/lubricante-entrada/services/lubricante-entrada.service.ts
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';
import { LubricanteEntrada } from '../entities/lubricante-entrada.entity';
import { LubricanteStockHistorial } from '../entities/lubricante-stock-historial.entity';
import { LubricanteTipo } from '../entities/lubricante-tipo.entity';
import { Lubricante } from 'src/lubricentro/entities/lubricante.entity';
import { CreateLubricanteEntradaDto } from '../dto/create-lubricante-entrada.dto';
import { UpdateLubricanteEntradaDto } from '../dto/update-lubricante-entrada.dto';
import { UpdateLubricanteSalidaDto } from '../dto/update-lubricante-salida.dto';
import { LubricanteTipoDto } from '../dto/lubricante-tipo.dto';
import { NotificacionesService } from 'src/notificaciones/services/notificaciones.service';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { ValidRoles } from 'src/usuario/enums/usuario.enum';

const TITULO_MAX = 150;
/** Largo máximo de un tipo de lubricante (columna lubricante_tipo.nombre). */
const TIPO_MAX = 100;

@Injectable()
export class LubricanteEntradaService {
  constructor(
    @InjectRepository(LubricanteEntrada)
    private readonly repo: Repository<LubricanteEntrada>,
    @InjectRepository(LubricanteStockHistorial)
    private readonly historialRepo: Repository<LubricanteStockHistorial>,
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
    @InjectRepository(LubricanteTipo)
    private readonly tipoRepo: Repository<LubricanteTipo>,
    private readonly notificacionesService: NotificacionesService,
  ) {}

  private recortarTitulo(titulo: string): string {
    return titulo.length > TITULO_MAX
      ? titulo.slice(0, TITULO_MAX - 1) + '…'
      : titulo;
  }

  private esSuperadmin(user: Usuario): boolean {
    return (user.roles ?? []).some((r) => r.rol === ValidRoles.superadmin);
  }

  /** El super admin puede editar cualquier carga; los demás, solo las que cargaron ellos. */
  private puedeEditar(user: Usuario, entrada: LubricanteEntrada): boolean {
    if (this.esSuperadmin(user)) return true;
    return (
      entrada.creadoPorDni != null &&
      String(entrada.creadoPorDni) === String(user.dni)
    );
  }

  async crear(dto: CreateLubricanteEntradaDto, user: Usuario) {
    const { guardadas, tiposNuevos } = await this.repo.manager.transaction(async (manager) => {
      const { nombres, nuevos } = await this.resolverTipos(
        manager,
        dto.registros.map((r) => r.tipo),
      );
      const filas = dto.registros.map((r, i) =>
        manager.create(LubricanteEntrada, {
          fecha: r.fecha,
          tipo: nombres[i],
          nroRemito: r.nroRemito?.trim() || null,
          cantidad: r.cantidad,
          creadoPorDni: String(user.dni),
        }),
      );
      const nuevas = await manager.save(filas);
      await manager.save(
        nuevas.map((n) =>
          manager.create(LubricanteStockHistorial, {
            entradaId: n.id,
            fechaEstado: n.fecha,
            tipo: n.tipo,
            cantidadEntrada: n.cantidad,
            cantidadSalida: 0,
            estadoParcial: this.redondear(n.cantidad),
          }),
        ),
      );
      return { guardadas: nuevas, tiposNuevos: nuevos };
    });

    const titulo =
      guardadas.length === 1
        ? `Lubricante agregado · ${guardadas[0].tipo} · ${guardadas[0].cantidad} L`
        : `Lubricante agregado · ${guardadas.length} registros · ${[
            ...new Set(guardadas.map((g) => g.tipo)),
          ].join(', ')}`;
    await this.notificacionesService.crearNotificacionParaSuperadmin(
      'lubricentro',
      this.recortarTitulo(titulo),
      `Se cargaron ${guardadas.length} registro(s) en Agregar Lubricante.`,
    );
    for (const nombre of tiposNuevos) {
      await this.notificacionesService.crearNotificacionParaSuperadmin(
        'lubricentro',
        this.recortarTitulo(`Tipo de lubricante agregado · ${nombre}`),
        `Se agregó "${nombre}" a la lista de lubricantes desde Agregar Lubricante.`,
      );
    }
    return guardadas;
  }

  /**
   * Agregar Lubricante: el tipo se escribe a mano. Si ya está en la lista
   * (sin importar mayúsculas ni espacios de más) se usa el nombre de la lista;
   * si no está, se crea en lubricante_tipo dentro de la misma transacción.
   */
  private async resolverTipos(
    manager: EntityManager,
    escritos: string[],
  ): Promise<{ nombres: string[]; nuevos: string[] }> {
    const existentes = await manager.find(LubricanteTipo);
    const porClave = new Map(
      existentes.map((t) => [t.nombre.toLowerCase(), t.nombre]),
    );
    const nombres: string[] = [];
    const nuevos: string[] = [];
    for (const escrito of escritos) {
      const nombre = this.normalizarNombre(escrito);
      if (!nombre) {
        throw new BadRequestException('Completá el tipo de lubricante.');
      }
      if (nombre.length > TIPO_MAX) {
        throw new BadRequestException(
          `El tipo de lubricante puede tener hasta ${TIPO_MAX} caracteres.`,
        );
      }
      const clave = nombre.toLowerCase();
      let final = porClave.get(clave);
      if (final === undefined) {
        await manager.save(manager.create(LubricanteTipo, { nombre }));
        porClave.set(clave, nombre);
        nuevos.push(nombre);
        final = nombre;
      }
      nombres.push(final);
    }
    return { nombres, nuevos };
  }

  /** Nombre sin espacios de más: "  15  W 40 " pasa a "15 W 40". */
  private normalizarNombre(nombre: string): string {
    return (nombre ?? '').trim().replace(/\s+/g, ' ');
  }

  /** Orden alfabético, con los números primero y en orden numérico (5 antes que 10). */
  private compararNombres(a: string, b: string): number {
    return a.localeCompare(b, 'es', { numeric: true, sensitivity: 'base' });
  }

  /** Error 400 si algún tipo no está en la lista (tabla lubricante_tipo). */
  private async verificarTiposExisten(nombres: string[]): Promise<void> {
    const unicos = [...new Set(nombres)];
    if (unicos.length === 0) return;
    const encontrados = await this.tipoRepo.find({ where: { nombre: In(unicos) } });
    const existentes = new Set(encontrados.map((t) => t.nombre));
    const faltan = unicos.filter((n) => !existentes.has(n));
    if (faltan.length > 0) {
      throw new BadRequestException(
        `El tipo de lubricante no está en la lista: ${faltan.join(', ')}`,
      );
    }
  }

  /** Nombres de la lista, para los desplegables de Agregar, Editar y Registro. */
  async obtenerTipos(): Promise<string[]> {
    const tipos = await this.tipoRepo.find();
    return tipos.map((t) => t.nombre).sort((a, b) => this.compararNombres(a, b));
  }

  /** Cuántas cargas y cuántas salidas a vehículos usan cada nombre (o uno solo). */
  private async contarUsos(manager: EntityManager, nombre?: string) {
    const qCargas = manager
      .createQueryBuilder(LubricanteEntrada, 'e')
      .select('e.tipo', 'nombre')
      .addSelect('COUNT(*)', 'n')
      .groupBy('e.tipo');
    const qSalidas = manager
      .createQueryBuilder(Lubricante, 'l')
      .select('l.lubricante', 'nombre')
      .addSelect('COUNT(*)', 'n')
      .where('l.lubricante IS NOT NULL')
      .groupBy('l.lubricante');
    if (nombre !== undefined) {
      qCargas.where('e.tipo = :nombre', { nombre });
      qSalidas.andWhere('l.lubricante = :nombre', { nombre });
    }
    const cargas = await qCargas.getRawMany<{ nombre: string; n: string }>();
    const salidas = await qSalidas.getRawMany<{ nombre: string; n: string }>();
    return {
      cargas: new Map(cargas.map((c) => [c.nombre, Number(c.n)])),
      salidas: new Map(salidas.map((s) => [s.nombre, Number(s.n)])),
    };
  }

  /** Pestaña "Tipos de lubricante": cada tipo con su uso y lo que puede hacer el usuario. */
  async obtenerTiposDetalle(user: Usuario) {
    const tipos = await this.tipoRepo.find();
    const usos = await this.contarUsos(this.repo.manager);
    const esSuper = this.esSuperadmin(user);
    return tipos
      .sort((a, b) => this.compararNombres(a.nombre, b.nombre))
      .map((t) => {
        const usoCargas = usos.cargas.get(t.nombre) ?? 0;
        const usoSalidas = usos.salidas.get(t.nombre) ?? 0;
        return {
          id: t.id,
          nombre: t.nombre,
          usoCargas,
          usoSalidas,
          puedeEditar: true,
          puedeEliminar: esSuper && usoCargas === 0 && usoSalidas === 0,
        };
      });
  }

  /** Error 409 si ya hay otro tipo con el mismo nombre (sin importar mayúsculas). */
  private async verificarNombreLibre(
    manager: EntityManager,
    nombre: string,
    excluirId?: number,
  ): Promise<void> {
    const q = manager
      .createQueryBuilder(LubricanteTipo, 't')
      .where('LOWER(t.nombre) = LOWER(:nombre)', { nombre });
    if (excluirId !== undefined) q.andWhere('t.id <> :excluirId', { excluirId });
    const repetido = await q.getOne();
    if (repetido) {
      throw new ConflictException(`Ya existe el tipo "${repetido.nombre}".`);
    }
  }

  async crearTipo(dto: LubricanteTipoDto): Promise<LubricanteTipo> {
    const nombre = this.normalizarNombre(dto.nombre);
    if (!nombre) throw new BadRequestException('Completá el nombre del lubricante.');
    const tipo = await this.repo.manager.transaction(async (manager) => {
      await this.verificarNombreLibre(manager, nombre);
      return manager.save(manager.create(LubricanteTipo, { nombre }));
    });
    await this.notificacionesService.crearNotificacionParaSuperadmin(
      'lubricentro',
      this.recortarTitulo(`Tipo de lubricante agregado · ${tipo.nombre}`),
      `Se agregó "${tipo.nombre}" a la lista de lubricantes.`,
    );
    return tipo;
  }

  /** Cambia el nombre en la lista y en todas las cargas, el historial y las salidas que lo usan. */
  async actualizarTipo(id: number, dto: LubricanteTipoDto): Promise<LubricanteTipo> {
    const nombre = this.normalizarNombre(dto.nombre);
    if (!nombre) throw new BadRequestException('Completá el nombre del lubricante.');
    const r = await this.repo.manager.transaction(async (manager) => {
      const tipo = await manager.findOne(LubricanteTipo, { where: { id } });
      if (!tipo) throw new NotFoundException('Tipo de lubricante no encontrado');
      const anterior = tipo.nombre;
      if (anterior === nombre) return { tipo, anterior, cargas: 0, salidas: 0 };
      await this.verificarNombreLibre(manager, nombre, id);
      const cargas = await manager.update(
        LubricanteEntrada,
        { tipo: anterior },
        { tipo: nombre },
      );
      await manager.update(
        LubricanteStockHistorial,
        { tipo: anterior },
        { tipo: nombre },
      );
      const salidas = await manager.update(
        Lubricante,
        { lubricante: anterior },
        { lubricante: nombre },
      );
      tipo.nombre = nombre;
      await manager.save(tipo);
      return {
        tipo,
        anterior,
        cargas: cargas.affected ?? 0,
        salidas: salidas.affected ?? 0,
      };
    });
    if (r.anterior !== r.tipo.nombre) {
      await this.notificacionesService.crearNotificacionParaSuperadmin(
        'lubricentro',
        this.recortarTitulo(
          `Tipo de lubricante editado · ${r.anterior} → ${r.tipo.nombre}`,
        ),
        `Se actualizaron ${r.cargas} carga(s) y ${r.salidas} salida(s) a vehículos.`,
      );
    }
    return r.tipo;
  }

  /** Solo super admin (lo controla el controller) y solo si ninguna carga ni salida lo usa. */
  async eliminarTipo(id: number): Promise<{ id: number }> {
    const tipo = await this.repo.manager.transaction(async (manager) => {
      const tipo = await manager.findOne(LubricanteTipo, { where: { id } });
      if (!tipo) throw new NotFoundException('Tipo de lubricante no encontrado');
      const usos = await this.contarUsos(manager, tipo.nombre);
      const c = usos.cargas.get(tipo.nombre) ?? 0;
      const s = usos.salidas.get(tipo.nombre) ?? 0;
      if (c > 0 || s > 0) {
        throw new ConflictException(
          `No se puede eliminar "${tipo.nombre}": lo usan ${c} carga(s) y ${s} salida(s) a vehículos.`,
        );
      }
      await manager.delete(LubricanteTipo, { id });
      return tipo;
    });
    await this.notificacionesService.crearNotificacionParaSuperadmin(
      'lubricentro',
      this.recortarTitulo(`Tipo de lubricante eliminado · ${tipo.nombre}`),
      `Se eliminó "${tipo.nombre}" de la lista de lubricantes.`,
    );
    return { id };
  }

  private redondear(n: number): number {
    return Math.round(n * 1000) / 1000;
  }

  async obtenerStock() {
    const filas = await this.repo.find({
      order: { fecha: 'DESC', id: 'DESC' },
    });
    return filas.map((f) => ({
      id: f.id,
      fecha: f.fecha,
      tipo: f.tipo,
      cantidadEntrada: f.cantidad,
      cantidadSalida: f.cantidadSalida,
      fechaEstado: f.fechaEstado,
      estadoParcial: this.redondear(f.cantidad - f.cantidadSalida),
    }));
  }

  /** Listado de Eliminar/Editar Lubricante: quién cargó cada una y qué puede hacer el usuario. */
  async obtenerCargas(user: Usuario) {
    const filas = await this.repo.find({
      order: { fecha: 'DESC', id: 'DESC' },
    });
    const dnis = [
      ...new Set(
        filas
          .map((f) => f.creadoPorDni)
          .filter((d): d is string => d != null)
          .map((d) => Number(d)),
      ),
    ];
    const usuarios = dnis.length
      ? await this.usuarioRepo.find({ where: { dni: In(dnis) } })
      : [];
    const nombres = new Map(
      usuarios.map((u) => [
        String(u.dni),
        `${(u.apellido ?? '').trim()}, ${(u.nombre ?? '').trim()}`,
      ]),
    );
    const esSuper = this.esSuperadmin(user);
    return filas.map((f) => ({
      id: f.id,
      fecha: f.fecha,
      tipo: f.tipo,
      nroRemito: f.nroRemito,
      cantidad: f.cantidad,
      cantidadSalida: f.cantidadSalida,
      creadoPor:
        f.creadoPorDni != null
          ? (nombres.get(String(f.creadoPorDni)) ?? `DNI ${f.creadoPorDni}`)
          : null,
      puedeEditar: this.puedeEditar(user, f),
      puedeEliminar: esSuper,
    }));
  }

  async actualizar(id: number, dto: UpdateLubricanteEntradaDto, user: Usuario) {
    await this.verificarTiposExisten([dto.tipo.trim()]);
    const { entrada, cambios } = await this.repo.manager.transaction(
      async (manager) => {
        const entrada = await manager.findOne(LubricanteEntrada, {
          where: { id },
        });
        if (!entrada) {
          throw new NotFoundException('Lubricante no encontrado');
        }
        if (!this.puedeEditar(user, entrada)) {
          throw new ForbiddenException(
            'Solo podés editar los lubricantes que cargaste vos.',
          );
        }
        if (dto.cantidad < entrada.cantidadSalida) {
          throw new BadRequestException(
            `La cantidad no puede ser menor que lo que ya salió (${entrada.cantidadSalida} L).`,
          );
        }

        const nuevo = {
          fecha: dto.fecha,
          tipo: dto.tipo.trim(),
          nroRemito: dto.nroRemito?.trim() || null,
          cantidad: dto.cantidad,
        };
        const cambios: string[] = [];
        if (String(nuevo.fecha) !== String(entrada.fecha)) cambios.push('fecha');
        if (nuevo.tipo !== entrada.tipo) cambios.push('tipo');
        if ((nuevo.nroRemito ?? '') !== (entrada.nroRemito ?? '')) cambios.push('remito');
        if (nuevo.cantidad !== entrada.cantidad) cambios.push('cantidad');

        Object.assign(entrada, nuevo);
        await manager.save(entrada);

        const filasHistorial = await manager.find(LubricanteStockHistorial, {
          where: { entradaId: entrada.id },
        });
        for (const h of filasHistorial) {
          h.tipo = entrada.tipo;
          h.cantidadEntrada = entrada.cantidad;
          h.estadoParcial = this.redondear(h.cantidadEntrada - h.cantidadSalida);
          if (h.cantidadSalida === 0) h.fechaEstado = entrada.fecha;
        }
        if (filasHistorial.length) await manager.save(filasHistorial);

        return { entrada, cambios };
      },
    );

    if (cambios.length > 0) {
      await this.notificacionesService.crearNotificacionParaSuperadmin(
        'lubricentro',
        this.recortarTitulo(
          `Lubricante editado · ${entrada.tipo} · ${entrada.cantidad} L · cambió: ${cambios.join(', ')}`,
        ),
        `Se editó un registro de Agregar Lubricante.`,
      );
    }
    return entrada;
  }

  async eliminar(id: number): Promise<{ id: number }> {
    const entrada = await this.repo.manager.transaction(async (manager) => {
      const entrada = await manager.findOne(LubricanteEntrada, {
        where: { id },
      });
      if (!entrada) {
        throw new NotFoundException('Lubricante no encontrado');
      }
      if (entrada.cantidadSalida > 0) {
        throw new ConflictException(
          'No se puede eliminar porque ya tiene salidas registradas.',
        );
      }
      await manager.delete(LubricanteStockHistorial, { entradaId: entrada.id });
      await manager.delete(LubricanteEntrada, { id: entrada.id });
      return entrada;
    });

    await this.notificacionesService.crearNotificacionParaSuperadmin(
      'lubricentro',
      this.recortarTitulo(
        `Lubricante eliminado · ${entrada.tipo} · ${entrada.cantidad} L`,
      ),
      `Se eliminó un registro de Agregar Lubricante.`,
    );
    return { id };
  }

  async guardarSalida(id: number, dto: UpdateLubricanteSalidaDto) {
    const resultado = await this.repo.manager.transaction(async (manager) => {
      const entrada = await manager.findOne(LubricanteEntrada, {
        where: { id },
      });
      if (!entrada) {
        throw new NotFoundException('Registro de stock no encontrado');
      }
      if (dto.cantidadSalida > entrada.cantidad) {
        throw new BadRequestException(
          'La cantidad de salida no puede ser mayor que la cantidad de entrada',
        );
      }
      entrada.cantidadSalida = dto.cantidadSalida;
      entrada.fechaEstado = dto.fechaEstado;
      await manager.save(entrada);

      const estadoParcial = this.redondear(
        entrada.cantidad - entrada.cantidadSalida,
      );

      return {
        id: entrada.id,
        fecha: entrada.fecha,
        tipo: entrada.tipo,
        cantidadEntrada: entrada.cantidad,
        cantidadSalida: entrada.cantidadSalida,
        fechaEstado: entrada.fechaEstado,
        estadoParcial,
      };
    });

    await this.notificacionesService.crearNotificacionParaSuperadmin(
      'lubricentro',
      this.recortarTitulo(
        `Stock de lubricante actualizado · ${resultado.tipo} · salida ${resultado.cantidadSalida} L · Estado Parcial ${resultado.estadoParcial} L`,
      ),
      `Se actualizó el stock de ${resultado.tipo} al ${resultado.fechaEstado}.`,
    );
    return resultado;
  }

  async obtenerHistorial() {
    return this.historialRepo.find({
      order: { fechaEstado: 'DESC', id: 'DESC' },
    });
  }

  async eliminarHistorial(id: number): Promise<{ id: number }> {
    const fila = await this.historialRepo.findOne({ where: { id } });
    if (!fila) {
      throw new NotFoundException('Renglón del listado no encontrado');
    }
    await this.historialRepo.remove(fila);
    return { id };
  }
}

// src/lubricante-entrada/services/lubricante-entrada.service.ts
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { LubricanteEntrada } from '../entities/lubricante-entrada.entity';
import { LubricanteStockHistorial } from '../entities/lubricante-stock-historial.entity';
import { CreateLubricanteEntradaDto } from '../dto/create-lubricante-entrada.dto';
import { UpdateLubricanteEntradaDto } from '../dto/update-lubricante-entrada.dto';
import { UpdateLubricanteSalidaDto } from '../dto/update-lubricante-salida.dto';
import { NotificacionesService } from 'src/notificaciones/services/notificaciones.service';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { ValidRoles } from 'src/usuario/enums/usuario.enum';

const TITULO_MAX = 150;

@Injectable()
export class LubricanteEntradaService {
  constructor(
    @InjectRepository(LubricanteEntrada)
    private readonly repo: Repository<LubricanteEntrada>,
    @InjectRepository(LubricanteStockHistorial)
    private readonly historialRepo: Repository<LubricanteStockHistorial>,
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
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
    const guardadas = await this.repo.manager.transaction(async (manager) => {
      const filas = dto.registros.map((r) =>
        manager.create(LubricanteEntrada, {
          fecha: r.fecha,
          tipo: r.tipo.trim(),
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
      return nuevas;
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
    return guardadas;
  }

  async obtenerTipos(): Promise<string[]> {
    const filas = await this.repo
      .createQueryBuilder('e')
      .select('e.tipo', 'tipo')
      .groupBy('e.tipo')
      .orderBy('e.tipo', 'ASC')
      .getRawMany<{ tipo: string }>();
    return filas.map((f) => f.tipo);
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

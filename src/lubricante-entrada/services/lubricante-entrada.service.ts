// src/lubricante-entrada/services/lubricante-entrada.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LubricanteEntrada } from '../entities/lubricante-entrada.entity';
import { LubricanteStockHistorial } from '../entities/lubricante-stock-historial.entity';
import { CreateLubricanteEntradaDto } from '../dto/create-lubricante-entrada.dto';
import { UpdateLubricanteSalidaDto } from '../dto/update-lubricante-salida.dto';
import { NotificacionesService } from 'src/notificaciones/services/notificaciones.service';

const TITULO_MAX = 150;

@Injectable()
export class LubricanteEntradaService {
  constructor(
    @InjectRepository(LubricanteEntrada)
    private readonly repo: Repository<LubricanteEntrada>,
    @InjectRepository(LubricanteStockHistorial)
    private readonly historialRepo: Repository<LubricanteStockHistorial>,
    private readonly notificacionesService: NotificacionesService,
  ) {}

  private recortarTitulo(titulo: string): string {
    return titulo.length > TITULO_MAX
      ? titulo.slice(0, TITULO_MAX - 1) + '…'
      : titulo;
  }

  async crear(dto: CreateLubricanteEntradaDto) {
    const filas = dto.registros.map((r) =>
      this.repo.create({
        fecha: r.fecha,
        tipo: r.tipo.trim(),
        nroRemito: r.nroRemito?.trim() || null,
        cantidad: r.cantidad,
      }),
    );
    const guardadas = await this.repo.save(filas);

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
      await manager.save(
        manager.create(LubricanteStockHistorial, {
          entradaId: entrada.id,
          fechaEstado: dto.fechaEstado,
          tipo: entrada.tipo,
          cantidadEntrada: entrada.cantidad,
          cantidadSalida: entrada.cantidadSalida,
          estadoParcial,
        }),
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
}

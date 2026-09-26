// src/compras/services/orden-compra.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrdenCompra } from '../entities/orden-compra.entity';
import { CreateOrdenCompraDto } from '../dto/create-orden-compra.dto';
import { NotificacionesService } from 'src/notificaciones/services/notificaciones.service';

@Injectable()
export class OrdenCompraService {
  constructor(
    @InjectRepository(OrdenCompra)
    private readonly ordenCompraRepository: Repository<OrdenCompra>,
    private readonly notificacionesService: NotificacionesService,
  ) {}

  private tituloOrdenCompra(
    accion: string,
    orden: { numeroOrden: string; proveedor?: { nombre: string } | null },
    cambios: string[] = [],
  ): string {
    const TITULO_MAX_ORDEN_COMPRA = 150;
    const partes = [`Orden de compra ${accion}`, `N° ${orden.numeroOrden}`];
    if (orden.proveedor?.nombre) {
      partes.push(`Proveedor: ${orden.proveedor.nombre}`);
    }
    if (cambios.length > 0) {
      partes.push(`cambió: ${cambios.join(', ')}`);
    }
    const titulo = partes.join(' · ');
    return titulo.length > TITULO_MAX_ORDEN_COMPRA
      ? titulo.slice(0, TITULO_MAX_ORDEN_COMPRA - 1) + '…'
      : titulo;
  }

  async crear(dto: CreateOrdenCompraDto): Promise<OrdenCompra> {
    const { id_suministro, id_proveedor, ...resto } = dto;
    const nueva = this.ordenCompraRepository.create({
      ...resto,
      suministro: id_suministro ? ({ id: id_suministro } as any) : null,
      proveedor: id_proveedor ? ({ id: id_proveedor } as any) : null,
    });
    const guardada = await this.ordenCompraRepository.save(nueva);
    const guardadaConRelaciones = await this.obtenerUno(guardada.id);
    await this.notificacionesService.crearNotificacionParaSuperadmin(
      'compras',
      this.tituloOrdenCompra('cargada', guardadaConRelaciones),
      `Se cargó la orden de compra N° ${guardadaConRelaciones.numeroOrden}.`,
    );
    return guardadaConRelaciones;
  }

  async obtenerTodos(): Promise<OrdenCompra[]> {
    return this.ordenCompraRepository.find({
      relations: ['suministro', 'proveedor'],
    });
  }

  async obtenerUno(id: number): Promise<OrdenCompra> {
    const orden = await this.ordenCompraRepository.findOne({
      where: { id },
      relations: ['suministro', 'proveedor'],
    });
    if (!orden) {
      throw new NotFoundException(`Orden de compra con ID ${id} no encontrada`);
    }
    return orden;
  }

  async actualizar(
    id: number,
    dto: CreateOrdenCompraDto,
  ): Promise<OrdenCompra> {
    const existente = await this.ordenCompraRepository.findOneBy({ id });
    if (!existente) {
      throw new NotFoundException(`Orden de compra con ID ${id} no encontrada`);
    }
    const { id_suministro, id_proveedor, ...resto } = dto;

    const CAMPOS_COMPARABLES_ORDEN_COMPRA: { clave: string; etiqueta: string }[] = [
      { clave: 'numeroOrden', etiqueta: 'número de orden' },
      { clave: 'tipoFactura', etiqueta: 'tipo de factura' },
      { clave: 'numeroFactura', etiqueta: 'número de factura' },
      { clave: 'monto', etiqueta: 'monto' },
      { clave: 'fechaEntrega', etiqueta: 'fecha de entrega' },
      { clave: 'estado', etiqueta: 'estado' },
      { clave: 'unidad', etiqueta: 'unidad' },
    ];
    const cambiosOrdenCompra: string[] = [];
    for (const { clave, etiqueta } of CAMPOS_COMPARABLES_ORDEN_COMPRA) {
      const nuevo = (resto as any)[clave];
      if (nuevo !== undefined && String(nuevo ?? '') !== String((existente as any)[clave] ?? '')) {
        cambiosOrdenCompra.push(etiqueta);
      }
    }
    if (id_proveedor !== undefined) {
      cambiosOrdenCompra.push('proveedor');
    }
    if (id_suministro !== undefined) {
      cambiosOrdenCompra.push('suministro');
    }

    await this.ordenCompraRepository.update(id, {
      ...resto,
      suministro: id_suministro ? ({ id: id_suministro } as any) : null,
      proveedor: id_proveedor ? ({ id: id_proveedor } as any) : null,
    });
    const actualizada = await this.obtenerUno(id);
    await this.notificacionesService.crearNotificacionParaSuperadmin(
      'compras',
      this.tituloOrdenCompra('editada', actualizada, cambiosOrdenCompra),
      `Se editó la orden de compra N° ${actualizada.numeroOrden}.`,
    );
    return actualizada;
  }

  async eliminar(id: number): Promise<void> {
    const existente = await this.ordenCompraRepository.findOneBy({ id });
    if (!existente) {
      throw new NotFoundException(`Orden de compra con ID ${id} no encontrada`);
    }
    await this.ordenCompraRepository.delete(id);
  }
}

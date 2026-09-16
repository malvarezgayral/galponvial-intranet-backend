// src/compras/services/orden-compra.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrdenCompra } from '../entities/orden-compra.entity';
import { CreateOrdenCompraDto } from '../dto/create-orden-compra.dto';

@Injectable()
export class OrdenCompraService {
  constructor(
    @InjectRepository(OrdenCompra)
    private readonly ordenCompraRepository: Repository<OrdenCompra>,
  ) {}

  async crear(dto: CreateOrdenCompraDto): Promise<OrdenCompra> {
    const { id_suministro, id_proveedor, ...resto } = dto;
    const nueva = this.ordenCompraRepository.create({
      ...resto,
      suministro: id_suministro ? ({ id: id_suministro } as any) : null,
      proveedor: id_proveedor ? ({ id: id_proveedor } as any) : null,
    });
    return this.ordenCompraRepository.save(nueva);
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
    await this.ordenCompraRepository.update(id, {
      ...resto,
      suministro: id_suministro ? ({ id: id_suministro } as any) : null,
      proveedor: id_proveedor ? ({ id: id_proveedor } as any) : null,
    });
    return this.obtenerUno(id);
  }

  async eliminar(id: number): Promise<void> {
    const existente = await this.ordenCompraRepository.findOneBy({ id });
    if (!existente) {
      throw new NotFoundException(`Orden de compra con ID ${id} no encontrada`);
    }
    await this.ordenCompraRepository.delete(id);
  }
}

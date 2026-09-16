// src/compras/services/presupuesto.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Presupuesto } from '../entities/presupuesto.entity';
import { CreatePresupuestoDto } from '../dto/create-presupuesto.dto';

@Injectable()
export class PresupuestoService {
  constructor(
    @InjectRepository(Presupuesto)
    private readonly presupuestoRepository: Repository<Presupuesto>,
  ) {}

  async crear(dto: CreatePresupuestoDto): Promise<Presupuesto> {
    const nuevo = this.presupuestoRepository.create({
      ...dto,
      proveedor: dto.id_proveedor ? ({ id: dto.id_proveedor } as any) : null,
    });
    return this.presupuestoRepository.save(nuevo);
  }

  async obtenerTodos(): Promise<Presupuesto[]> {
    return this.presupuestoRepository.find({ relations: ['proveedor'] });
  }

  async obtenerUno(id: number): Promise<Presupuesto> {
    const presupuesto = await this.presupuestoRepository.findOne({
      where: { id },
      relations: ['proveedor'],
    });
    if (!presupuesto) {
      throw new NotFoundException(`Presupuesto con ID ${id} no encontrado`);
    }
    return presupuesto;
  }

  async actualizar(
    id: number,
    dto: CreatePresupuestoDto,
  ): Promise<Presupuesto> {
    const existente = await this.presupuestoRepository.findOneBy({ id });
    if (!existente) {
      throw new NotFoundException(`Presupuesto con ID ${id} no encontrado`);
    }
    await this.presupuestoRepository.update(id, {
      ...dto,
      proveedor: dto.id_proveedor ? ({ id: dto.id_proveedor } as any) : null,
    });
    return this.obtenerUno(id);
  }

  async eliminar(id: number): Promise<void> {
    const existente = await this.presupuestoRepository.findOneBy({ id });
    if (!existente) {
      throw new NotFoundException(`Presupuesto con ID ${id} no encontrado`);
    }
    await this.presupuestoRepository.delete(id);
  }
}

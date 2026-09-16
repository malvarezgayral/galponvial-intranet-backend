// src/compras/services/suministro.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Suministro } from '../entities/suministro.entity';
import { CreateSuministroDto } from '../dto/create-suministro.dto';

@Injectable()
export class SuministroService {
  constructor(
    @InjectRepository(Suministro)
    private readonly suministroRepository: Repository<Suministro>,
  ) {}

  async crear(dto: CreateSuministroDto): Promise<Suministro> {
    const { id_proveedor, id_presupuesto, items, ...resto } = dto;
    const nuevo = this.suministroRepository.create({
      ...resto,
      proveedor: id_proveedor ? ({ id: id_proveedor } as any) : null,
      presupuesto: id_presupuesto ? ({ id: id_presupuesto } as any) : null,
      items: items as any,
    });
    return this.suministroRepository.save(nuevo);
  }

  async obtenerTodos(): Promise<Suministro[]> {
    return this.suministroRepository.find({
      relations: ['proveedor', 'presupuesto', 'items'],
    });
  }

  async obtenerUno(id: number): Promise<Suministro> {
    const suministro = await this.suministroRepository.findOne({
      where: { id },
      relations: ['proveedor', 'presupuesto', 'items'],
    });
    if (!suministro) {
      throw new NotFoundException(`Suministro con ID ${id} no encontrado`);
    }
    return suministro;
  }

  async actualizar(id: number, dto: CreateSuministroDto): Promise<Suministro> {
    const existente = await this.suministroRepository.findOneBy({ id });
    if (!existente) {
      throw new NotFoundException(`Suministro con ID ${id} no encontrado`);
    }
    const { id_proveedor, id_presupuesto, items, ...resto } = dto;
    await this.suministroRepository.save({
      id,
      ...resto,
      proveedor: id_proveedor ? ({ id: id_proveedor } as any) : null,
      presupuesto: id_presupuesto ? ({ id: id_presupuesto } as any) : null,
      items: items as any,
    });
    return this.obtenerUno(id);
  }

  async eliminar(id: number): Promise<void> {
    const existente = await this.suministroRepository.findOneBy({ id });
    if (!existente) {
      throw new NotFoundException(`Suministro con ID ${id} no encontrado`);
    }
    await this.suministroRepository.delete(id);
  }
}

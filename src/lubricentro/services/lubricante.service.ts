// src/lubricentro/services/lubricante.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lubricante } from '../entities/lubricante.entity';
import { CreateLubricanteDto } from '../dto/create-lubricante.dto';

@Injectable()
export class LubricanteService {
  constructor(
    @InjectRepository(Lubricante)
    private readonly lubricanteRepository: Repository<Lubricante>,
  ) {}

  async crear(dto: CreateLubricanteDto): Promise<Lubricante> {
    const nuevo = this.lubricanteRepository.create({
      ...dto,
      vehiculo: { id_vehiculo: dto.id_vehiculo } as any,
    });
    return this.lubricanteRepository.save(nuevo);
  }

  async obtenerTodos(): Promise<Lubricante[]> {
    return this.lubricanteRepository.find({ relations: ['vehiculo'] });
  }

  async obtenerUno(id: number): Promise<Lubricante> {
    const lubricante = await this.lubricanteRepository.findOne({
      where: { id },
      relations: ['vehiculo'],
    });
    if (!lubricante) {
      throw new NotFoundException(`Lubricante con ID ${id} no encontrado`);
    }
    return lubricante;
  }

  async actualizar(
    id: number,
    dto: CreateLubricanteDto,
  ): Promise<Lubricante> {
    const existente = await this.lubricanteRepository.findOneBy({ id });
    if (!existente) {
      throw new NotFoundException(`Lubricante con ID ${id} no encontrado`);
    }
    await this.lubricanteRepository.update(id, {
      ...dto,
      vehiculo: { id_vehiculo: dto.id_vehiculo } as any,
    });
    return this.obtenerUno(id);
  }

  async eliminar(id: number): Promise<void> {
    const existente = await this.lubricanteRepository.findOneBy({ id });
    if (!existente) {
      throw new NotFoundException(`Lubricante con ID ${id} no encontrado`);
    }
    await this.lubricanteRepository.delete(id);
  }
}

// src/filtro-service/services/filtro-service.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FiltroService } from '../entities/filtro-service.entity';
import {
  CreateFiltroServiceDto,
  FiltroServiceItemDto,
} from '../dto/create-filtro-service.dto';

@Injectable()
export class FiltroServiceService {
  constructor(
    @InjectRepository(FiltroService)
    private readonly repo: Repository<FiltroService>,
  ) {}

  async crear(dto: CreateFiltroServiceDto) {
    const filas = dto.registros.map((r) =>
      this.repo.create({
        idVehiculo: r.idVehiculo ?? null,
        fecha: r.fecha ?? null,
        tipoFiltro: r.tipoFiltro.trim(),
        codigo: r.codigo?.trim() || null,
        cantidad: r.cantidad,
      }),
    );
    return this.repo.save(filas);
  }

  obtenerTodos() {
    return this.repo.find({
      relations: ['vehiculoRef'],
      order: { id: 'DESC' },
    });
  }

  async actualizar(id: number, dto: FiltroServiceItemDto) {
    const fila = await this.repo.findOne({ where: { id } });
    if (!fila) throw new NotFoundException(`Filtro ${id} no encontrado`);
    fila.idVehiculo = dto.idVehiculo ?? null;
    fila.fecha = dto.fecha ?? null;
    fila.tipoFiltro = dto.tipoFiltro.trim();
    fila.codigo = dto.codigo?.trim() || null;
    fila.cantidad = dto.cantidad;
    return this.repo.save(fila);
  }

  async eliminar(id: number) {
    const fila = await this.repo.findOne({ where: { id } });
    if (!fila) throw new NotFoundException(`Filtro ${id} no encontrado`);
    await this.repo.remove(fila);
    return { id };
  }
}

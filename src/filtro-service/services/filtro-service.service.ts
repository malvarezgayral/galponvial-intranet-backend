// src/filtro-service/services/filtro-service.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FiltroService } from '../entities/filtro-service.entity';
import { CreateFiltroServiceDto } from '../dto/create-filtro-service.dto';

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
}

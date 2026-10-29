// src/lubricante-entrada/services/lubricante-entrada.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LubricanteEntrada } from '../entities/lubricante-entrada.entity';
import { CreateLubricanteEntradaDto } from '../dto/create-lubricante-entrada.dto';

@Injectable()
export class LubricanteEntradaService {
  constructor(
    @InjectRepository(LubricanteEntrada)
    private readonly repo: Repository<LubricanteEntrada>,
  ) {}

  async crear(dto: CreateLubricanteEntradaDto) {
    const filas = dto.registros.map((r) =>
      this.repo.create({
        fecha: r.fecha,
        tipo: r.tipo.trim(),
        nroRemito: r.nroRemito?.trim() || null,
        cantidad: r.cantidad,
      }),
    );
    return this.repo.save(filas);
  }
}

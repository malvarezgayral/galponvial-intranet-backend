import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CombustibleCarro } from '../entities/combustible-carro.entity';
import { CreateCombustibleCarroDto } from '../dto/create-combustible-carro.dto';

@Injectable()
export class CombustibleCarroService {
  constructor(
    @InjectRepository(CombustibleCarro)
    private readonly carroRepository: Repository<CombustibleCarro>,
  ) {}

  async create(dto: CreateCombustibleCarroDto): Promise<CombustibleCarro> {
    // fecha_carga se guarda como texto 'YYYY-MM-DD' (evita corrimientos por zona horaria)
    const carga = this.carroRepository.create({
      ...dto,
      fecha_carga: dto.fecha_carga as unknown as Date,
    });
    return await this.carroRepository.save(carga);
  }

  async findAll(): Promise<CombustibleCarro[]> {
    return await this.carroRepository.find({ order: { id_carro: 'DESC' } });
  }
}

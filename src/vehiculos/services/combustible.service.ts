import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CombustibleCarga } from '../entities/combustible-carga.entity';

@Injectable()
export class CombustibleService {
  constructor(
    @InjectRepository(CombustibleCarga)
    private readonly combustibleRepository: Repository<CombustibleCarga>,
  ) {}

  async findAll(): Promise<CombustibleCarga[]> {
    return await this.combustibleRepository.find({
      relations: ['vehiculo'],
      order: { fecha_carga: 'DESC' },
    });
  }
}

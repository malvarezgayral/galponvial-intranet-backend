import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Jurisdiccion } from '../entities/jurisdiccion.entity';

export interface DependenciaItem {
  id_dependencia: number;
  nombre: string;
}

export interface JurisdiccionConDependencias {
  id_jurisdiccion: number;
  nombre: string;
  dependencias: DependenciaItem[];
}

@Injectable()
export class JurisdiccionesService {
  constructor(
    @InjectRepository(Jurisdiccion)
    private readonly jurisdiccionRepository: Repository<Jurisdiccion>,
  ) {}

  async listarConDependencias(): Promise<JurisdiccionConDependencias[]> {
    const lista = await this.jurisdiccionRepository.find({
      relations: ['dependencias'],
    });
    return lista
      .sort((a, b) => a.id_jurisdiccion - b.id_jurisdiccion)
      .map((j) => ({
        id_jurisdiccion: j.id_jurisdiccion,
        nombre: j.nombre,
        dependencias: (j.dependencias ?? [])
          .sort((a, b) => a.id_dependencia - b.id_dependencia)
          .map((d) => ({ id_dependencia: d.id_dependencia, nombre: d.nombre })),
      }));
  }
}

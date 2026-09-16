// src/proveedores/services/proveedor.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Proveedor } from '../entities/proveedor.entity';
import { CreateProveedorDto } from '../dto/create-proveedor.dto';

@Injectable()
export class ProveedorService {
  constructor(
    @InjectRepository(Proveedor)
    private readonly proveedorRepository: Repository<Proveedor>,
  ) {}

  async crear(dto: CreateProveedorDto): Promise<Proveedor> {
    const nuevo = this.proveedorRepository.create(dto);
    return this.proveedorRepository.save(nuevo);
  }

  async obtenerTodos(): Promise<Proveedor[]> {
    return this.proveedorRepository.find();
  }

  async obtenerUno(id: number): Promise<Proveedor> {
    const proveedor = await this.proveedorRepository.findOneBy({ id });
    if (!proveedor) {
      throw new NotFoundException(`Proveedor con ID ${id} no encontrado`);
    }
    return proveedor;
  }

  async actualizar(id: number, dto: CreateProveedorDto): Promise<Proveedor> {
    const existente = await this.proveedorRepository.findOneBy({ id });
    if (!existente) {
      throw new NotFoundException(`Proveedor con ID ${id} no encontrado`);
    }
    await this.proveedorRepository.update(id, dto);
    return this.obtenerUno(id);
  }

  async eliminar(id: number): Promise<void> {
    const existente = await this.proveedorRepository.findOneBy({ id });
    if (!existente) {
      throw new NotFoundException(`Proveedor con ID ${id} no encontrado`);
    }
    await this.proveedorRepository.delete(id);
  }
}

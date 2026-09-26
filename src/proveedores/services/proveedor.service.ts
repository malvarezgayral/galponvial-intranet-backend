// src/proveedores/services/proveedor.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Proveedor } from '../entities/proveedor.entity';
import { CreateProveedorDto } from '../dto/create-proveedor.dto';
import { NotificacionesService } from 'src/notificaciones/services/notificaciones.service';

@Injectable()
export class ProveedorService {
  constructor(
    @InjectRepository(Proveedor)
    private readonly proveedorRepository: Repository<Proveedor>,
    private readonly notificacionesService: NotificacionesService,
  ) {}

  private tituloProveedor(
    accion: string,
    proveedor: { nombre: string; rubro?: string | null },
    cambios: string[] = [],
  ): string {
    const TITULO_MAX_PROVEEDOR = 150;
    const partes = [`Proveedor ${accion}`, proveedor.nombre];
    if (proveedor.rubro) {
      partes.push(`Rubro: ${proveedor.rubro}`);
    }
    if (cambios.length > 0) {
      partes.push(`cambió: ${cambios.join(', ')}`);
    }
    const titulo = partes.join(' · ');
    return titulo.length > TITULO_MAX_PROVEEDOR
      ? titulo.slice(0, TITULO_MAX_PROVEEDOR - 1) + '…'
      : titulo;
  }

  async crear(dto: CreateProveedorDto): Promise<Proveedor> {
    const nuevo = this.proveedorRepository.create(dto);
    const guardado = await this.proveedorRepository.save(nuevo);
    await this.notificacionesService.crearNotificacionParaSuperadmin(
      'proveedores',
      this.tituloProveedor('cargado', guardado),
      `Se cargó el proveedor ${guardado.nombre}.`,
    );
    return guardado;
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

    const CAMPOS_COMPARABLES_PROVEEDOR: { clave: string; etiqueta: string }[] = [
      { clave: 'nombre', etiqueta: 'nombre' },
      { clave: 'telefono', etiqueta: 'teléfono' },
      { clave: 'direccion', etiqueta: 'dirección' },
      { clave: 'horarios', etiqueta: 'horarios' },
      { clave: 'ciudad', etiqueta: 'ciudad' },
      { clave: 'rubro', etiqueta: 'rubro' },
    ];
    const cambiosProveedor: string[] = [];
    for (const { clave, etiqueta } of CAMPOS_COMPARABLES_PROVEEDOR) {
      const nuevo = (dto as any)[clave];
      if (nuevo !== undefined && String(nuevo ?? '') !== String((existente as any)[clave] ?? '')) {
        cambiosProveedor.push(etiqueta);
      }
    }

    await this.proveedorRepository.update(id, dto);
    const actualizado = await this.obtenerUno(id);
    await this.notificacionesService.crearNotificacionParaSuperadmin(
      'proveedores',
      this.tituloProveedor('editado', actualizado, cambiosProveedor),
      `Se editó el proveedor ${actualizado.nombre}.`,
    );
    return actualizado;
  }

  async eliminar(id: number): Promise<void> {
    const existente = await this.proveedorRepository.findOneBy({ id });
    if (!existente) {
      throw new NotFoundException(`Proveedor con ID ${id} no encontrado`);
    }
    await this.proveedorRepository.delete(id);
  }
}

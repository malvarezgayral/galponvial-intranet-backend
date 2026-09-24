// src/service/services/service.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from '../entities/service.entity';
import { CreateServiceDto } from '../dto/create-service.dto';
import { NotificacionesService } from 'src/notificaciones/services/notificaciones.service';

const TITULO_MAX = 150;

const CAMPOS_COMPARABLES: { clave: Exclude<keyof Service, 'id'>; etiqueta: string }[] = [
  { clave: 'vehiculo', etiqueta: 'vehículo' },
  { clave: 'fecha', etiqueta: 'fecha' },
  { clave: 'aceiteMotor', etiqueta: 'aceite motor' },
  { clave: 'aceiteCaja', etiqueta: 'aceite caja' },
  { clave: 'aceiteDiferencial', etiqueta: 'aceite diferencial' },
  { clave: 'aceiteTransmision', etiqueta: 'aceite transmisión' },
  { clave: 'filtroTransmision', etiqueta: 'filtro transmisión' },
  { clave: 'filtroMotorAceite', etiqueta: 'filtro motor aceite' },
  { clave: 'filtroAire', etiqueta: 'filtro aire' },
  { clave: 'filtroGasoil', etiqueta: 'filtro gasoil' },
  { clave: 'aceiteHidraulico', etiqueta: 'aceite hidráulico' },
  { clave: 'filtroHidraulico', etiqueta: 'filtro hidráulico' },
  { clave: 'correasAuxiliares', etiqueta: 'correas auxiliares' },
  { clave: 'aceiteTande', etiqueta: 'aceite tande' },
  { clave: 'regulacionValvulas', etiqueta: 'regulación válvulas' },
  { clave: 'cambioDamper', etiqueta: 'cambio damper' },
  { clave: 'proximoService', etiqueta: 'próximo service' },
  { clave: 'cuentaHora', etiqueta: 'cuenta hora' },
  { clave: 'stock', etiqueta: 'stock' },
  { clave: 'observaciones', etiqueta: 'observaciones' },
];

@Injectable()
export class ServiceService {
  constructor(
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    private readonly notificacionesService: NotificacionesService,
  ) {}

  private armarTitulo(
    accion: 'cargado' | 'editado',
    s: Service,
    cambios: string[] = [],
  ): string {
    const partes = [`Service ${accion}`, s.vehiculo];
    if (s.fecha) partes.push(String(s.fecha));
    if (accion === 'cargado' && s.proximoService) {
      partes.push(`próximo: ${s.proximoService}`);
    }
    if (cambios.length > 0) {
      partes.push(`cambió: ${cambios.join(', ')}`);
    }
    const titulo = partes.join(' · ');
    return titulo.length > TITULO_MAX
      ? titulo.slice(0, TITULO_MAX - 1) + '…'
      : titulo;
  }

  private armarMensaje(s: Service): string {
    return [
      `Vehículo: ${s.vehiculo}`,
      s.fecha ? `Fecha: ${s.fecha}` : null,
      s.aceiteMotor ? `Aceite Motor: ${s.aceiteMotor}` : null,
      s.aceiteCaja ? `Aceite Caja: ${s.aceiteCaja}` : null,
      s.aceiteDiferencial ? `Aceite Diferencial: ${s.aceiteDiferencial}` : null,
      s.aceiteTransmision ? `Aceite Transmisión: ${s.aceiteTransmision}` : null,
      s.filtroTransmision ? `Filtro Transmisión: ${s.filtroTransmision}` : null,
      s.filtroMotorAceite ? `Filtro Motor Aceite: ${s.filtroMotorAceite}` : null,
      s.filtroAire ? `Filtro Aire: ${s.filtroAire}` : null,
      s.filtroGasoil ? `Filtro Gasoil: ${s.filtroGasoil}` : null,
      s.aceiteHidraulico ? `Aceite Hidráulico: ${s.aceiteHidraulico}` : null,
      s.filtroHidraulico ? `Filtro Hidráulico: ${s.filtroHidraulico}` : null,
      s.correasAuxiliares ? `Correas Auxiliares: ${s.correasAuxiliares}` : null,
      s.aceiteTande ? `Aceite Tande: ${s.aceiteTande}` : null,
      s.regulacionValvulas ? `Regulación Válvulas: ${s.regulacionValvulas}` : null,
      s.cambioDamper ? `Cambio Damper: ${s.cambioDamper}` : null,
      s.proximoService ? `Próximo Service: ${s.proximoService}` : null,
      s.cuentaHora ? `Cuenta Hora: ${s.cuentaHora}` : null,
      s.stock ? `Stock: ${s.stock}` : null,
      s.observaciones ? `Observaciones: ${s.observaciones}` : null,
    ]
      .filter(Boolean)
      .join(' | ');
  }

  async crear(dto: CreateServiceDto): Promise<Service> {
    const nuevo = this.serviceRepository.create(dto);
    const guardado = await this.serviceRepository.save(nuevo);

    await this.notificacionesService.crearNotificacionParaSuperadmin(
      'service',
      this.armarTitulo('cargado', guardado),
      this.armarMensaje(guardado),
    );

    return guardado;
  }

  async obtenerTodos(): Promise<Service[]> {
    return this.serviceRepository.find();
  }

  async actualizar(id: number, dto: CreateServiceDto): Promise<Service> {
    const existente = await this.serviceRepository.findOneBy({ id });
    if (!existente) {
      throw new NotFoundException(`Service con ID ${id} no encontrado`);
    }

    const nuevos = dto as unknown as Partial<Service>;
    const cambios: string[] = [];
    for (const { clave, etiqueta } of CAMPOS_COMPARABLES) {
      const nuevo = nuevos[clave];
      if (nuevo === undefined) continue;
      if (String(nuevo ?? '') !== String(existente[clave] ?? '')) {
        cambios.push(etiqueta);
      }
    }

    await this.serviceRepository.update(id, dto);
    const actualizado = (await this.serviceRepository.findOneBy({ id })) as Service;

    await this.notificacionesService.crearNotificacionParaSuperadmin(
      'service',
      this.armarTitulo('editado', actualizado, cambios),
      this.armarMensaje(actualizado),
    );

    return actualizado;
  }

  async eliminar(id: number): Promise<void> {
    const existente = await this.serviceRepository.findOneBy({ id });
    if (!existente) {
      throw new NotFoundException(`Service con ID ${id} no encontrado`);
    }
    await this.serviceRepository.delete(id);
  }
}

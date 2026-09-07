// src/service/services/service.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from '../entities/service.entity';
import { CreateServiceDto } from '../dto/create-service.dto';
import { NotificacionesService } from 'src/notificaciones/services/notificaciones.service';

@Injectable()
export class ServiceService {
  constructor(
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    private readonly notificacionesService: NotificacionesService,
  ) {}

  async crear(dto: CreateServiceDto): Promise<Service> {
    const nuevo = this.serviceRepository.create(dto);
    const guardado = await this.serviceRepository.save(nuevo);

    const mensaje = [
      `Vehículo: ${guardado.vehiculo}`,
      guardado.fecha ? `Fecha: ${guardado.fecha}` : null,
      guardado.aceiteMotor ? `Aceite Motor: ${guardado.aceiteMotor}` : null,
      guardado.aceiteCaja ? `Aceite Caja: ${guardado.aceiteCaja}` : null,
      guardado.aceiteDiferencial ? `Aceite Diferencial: ${guardado.aceiteDiferencial}` : null,
      guardado.aceiteTransmision ? `Aceite Transmisión: ${guardado.aceiteTransmision}` : null,
      guardado.filtroTransmision ? `Filtro Transmisión: ${guardado.filtroTransmision}` : null,
      guardado.filtroMotorAceite ? `Filtro Motor Aceite: ${guardado.filtroMotorAceite}` : null,
      guardado.filtroAire ? `Filtro Aire: ${guardado.filtroAire}` : null,
      guardado.filtroGasoil ? `Filtro Gasoil: ${guardado.filtroGasoil}` : null,
      guardado.aceiteHidraulico ? `Aceite Hidráulico: ${guardado.aceiteHidraulico}` : null,
      guardado.filtroHidraulico ? `Filtro Hidráulico: ${guardado.filtroHidraulico}` : null,
      guardado.correasAuxiliares ? `Correas Auxiliares: ${guardado.correasAuxiliares}` : null,
      guardado.aceiteTande ? `Aceite Tande: ${guardado.aceiteTande}` : null,
      guardado.regulacionValvulas ? `Regulación Válvulas: ${guardado.regulacionValvulas}` : null,
      guardado.cambioDamper ? `Cambio Damper: ${guardado.cambioDamper}` : null,
      guardado.proximoService ? `Próximo Service: ${guardado.proximoService}` : null,
      guardado.cuentaHora ? `Cuenta Hora: ${guardado.cuentaHora}` : null,
      guardado.stock ? `Stock: ${guardado.stock}` : null,
      guardado.observaciones ? `Observaciones: ${guardado.observaciones}` : null,
    ]
      .filter(Boolean)
      .join(' | ');

    await this.notificacionesService.crearNotificacionParaSuperadmin(
      'service',
      'Nuevo registro de Service cargado',
      mensaje,
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
    await this.serviceRepository.update(id, dto);
    return this.serviceRepository.findOneBy({ id }) as Promise<Service>;
  }

  async eliminar(id: number): Promise<void> {
    const existente = await this.serviceRepository.findOneBy({ id });
    if (!existente) {
      throw new NotFoundException(`Service con ID ${id} no encontrado`);
    }
    await this.serviceRepository.delete(id);
  }
}
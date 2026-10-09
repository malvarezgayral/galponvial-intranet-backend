// src/service/services/service.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from '../entities/service.entity';
import { Vehiculo } from '../../vehiculos/entities/vehiculo.entity';
import { CreateServiceDto } from '../dto/create-service.dto';
import { NotificacionesService } from 'src/notificaciones/services/notificaciones.service';
import { UsuarioService } from 'src/usuario/services/usuario.service';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { ValidRoles } from 'src/usuario/enums/usuario.enum';

const TITULO_MAX = 150;

const CAMPOS_COMPARABLES: {
  clave:
    | 'fecha'
    | 'aceiteMotor'
    | 'aceiteCaja'
    | 'aceiteDiferencial'
    | 'aceiteTransmision'
    | 'filtroTransmision'
    | 'filtroMotorAceite'
    | 'filtroAire'
    | 'filtroGasoil'
    | 'filtroNafta'
    | 'aceiteHidraulico'
    | 'filtroHidraulico'
    | 'correasAuxiliares'
    | 'aceiteTande'
    | 'regulacionValvulas'
    | 'cambioDamper'
    | 'proximoService'
    | 'cuentaHora'
    | 'cuentaKm'
    | 'stock'
    | 'observaciones';
  etiqueta: string;
}[] = [
  { clave: 'fecha', etiqueta: 'fecha' },
  { clave: 'aceiteMotor', etiqueta: 'aceite motor' },
  { clave: 'aceiteCaja', etiqueta: 'aceite caja' },
  { clave: 'aceiteDiferencial', etiqueta: 'aceite diferencial' },
  { clave: 'aceiteTransmision', etiqueta: 'aceite transmisión' },
  { clave: 'filtroTransmision', etiqueta: 'filtro transmisión' },
  { clave: 'filtroMotorAceite', etiqueta: 'filtro motor aceite' },
  { clave: 'filtroAire', etiqueta: 'filtro aire' },
  { clave: 'filtroGasoil', etiqueta: 'filtro gasoil' },
  { clave: 'filtroNafta', etiqueta: 'filtro nafta' },
  { clave: 'aceiteHidraulico', etiqueta: 'aceite hidráulico' },
  { clave: 'filtroHidraulico', etiqueta: 'filtro hidráulico' },
  { clave: 'correasAuxiliares', etiqueta: 'correas auxiliares' },
  { clave: 'aceiteTande', etiqueta: 'aceite tande' },
  { clave: 'regulacionValvulas', etiqueta: 'regulación válvulas' },
  { clave: 'cambioDamper', etiqueta: 'cambio damper' },
  { clave: 'proximoService', etiqueta: 'próximo service' },
  { clave: 'cuentaHora', etiqueta: 'cuenta hora' },
  { clave: 'cuentaKm', etiqueta: 'cuenta km' },
  { clave: 'stock', etiqueta: 'stock' },
  { clave: 'observaciones', etiqueta: 'observaciones' },
];

@Injectable()
export class ServiceService {
  constructor(
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @InjectRepository(Vehiculo)
    private readonly vehiculoRepository: Repository<Vehiculo>,
    private readonly notificacionesService: NotificacionesService,
    private readonly usuarioService: UsuarioService,
  ) {}

  private identificarVehiculo(s: Service): string {
    if (s.vehiculoRef) {
      return `${s.vehiculoRef.nombre} (cód. ${s.vehiculoRef.codigo})`;
    }
    return s.vehiculo ?? 'vehículo sin identificar';
  }

  private armarTitulo(
    accion: 'cargado' | 'editado',
    s: Service,
    cambios: string[] = [],
  ): string {
    const partes = [`Service ${accion}`, this.identificarVehiculo(s)];
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
      `Vehículo: ${this.identificarVehiculo(s)}`,
      s.fecha ? `Fecha: ${s.fecha}` : null,
      s.aceiteMotor ? `Aceite Motor: ${s.aceiteMotor}` : null,
      s.aceiteCaja ? `Aceite Caja: ${s.aceiteCaja}` : null,
      s.aceiteDiferencial ? `Aceite Diferencial: ${s.aceiteDiferencial}` : null,
      s.aceiteTransmision ? `Aceite Transmisión: ${s.aceiteTransmision}` : null,
      s.filtroTransmision ? `Filtro Transmisión: ${s.filtroTransmision}` : null,
      s.filtroMotorAceite
        ? `Filtro Motor Aceite: ${s.filtroMotorAceite}`
        : null,
      s.filtroAire ? `Filtro Aire: ${s.filtroAire}` : null,
      s.filtroGasoil ? `Filtro Gasoil: ${s.filtroGasoil}` : null,
      s.filtroNafta ? `Filtro Nafta: ${s.filtroNafta}` : null,
      s.aceiteHidraulico ? `Aceite Hidráulico: ${s.aceiteHidraulico}` : null,
      s.filtroHidraulico ? `Filtro Hidráulico: ${s.filtroHidraulico}` : null,
      s.correasAuxiliares ? `Correas Auxiliares: ${s.correasAuxiliares}` : null,
      s.aceiteTande ? `Aceite Tande: ${s.aceiteTande}` : null,
      s.regulacionValvulas
        ? `Regulación Válvulas: ${s.regulacionValvulas}`
        : null,
      s.cambioDamper ? `Cambio Damper: ${s.cambioDamper}` : null,
      s.proximoService ? `Próximo Service: ${s.proximoService}` : null,
      s.cuentaHora ? `Cuenta Hora: ${s.cuentaHora}` : null,
      s.cuentaKm ? `Cuenta KM: ${s.cuentaKm}` : null,
      s.stock ? `Stock: ${s.stock}` : null,
      s.observaciones ? `Observaciones: ${s.observaciones}` : null,
    ]
      .filter(Boolean)
      .join(' | ');
  }

  private async crearRecordatoriosProximoService(
    s: Service,
    user?: Usuario,
  ): Promise<void> {
    if (!user || !s.proximoService) return;
    try {
      const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(s.proximoService));
      if (!m) return;
      const anio = Number(m[1]);
      const mes = Number(m[2]);
      const dia = Number(m[3]);
      const fechaTxt = `${m[3]}/${m[2]}/${m[1]}`;
      const esSuperadmin = (user.roles ?? []).some(
        (r) => r?.rol === ValidRoles.superadmin,
      );
      const destinoDni = esSuperadmin ? null : Number(user.dni);
      const vehiculo = this.identificarVehiculo(s);
      const avisos = [
        {
          fecha: new Date(anio, mes - 1, dia - 7, 9, 0, 0),
          descripcion: `Service en 7 días (${fechaTxt}): ${vehiculo}`,
        },
        {
          fecha: new Date(anio, mes - 1, dia, 9, 0, 0),
          descripcion: `Service hoy (${fechaTxt}): ${vehiculo}`,
        },
      ];
      const ahora = Date.now();
      for (const aviso of avisos) {
        if (aviso.fecha.getTime() <= ahora) continue;
        await this.usuarioService.agregarRecordatorio(Number(user.dni), {
          fecha: aviso.fecha,
          descripcion: aviso.descripcion,
          destinoDni,
        });
      }
    } catch (error) {
      console.error('No se pudieron crear los recordatorios del service:', error);
    }
  }

  async crear(dto: CreateServiceDto, user?: Usuario): Promise<Service> {
    if (!dto.id_vehiculo) {
      throw new BadRequestException(
        'Debe seleccionar un vehículo (id_vehiculo).',
      );
    }
    const vehiculo = await this.vehiculoRepository.findOneBy({
      id_vehiculo: dto.id_vehiculo,
    });
    if (!vehiculo) {
      throw new NotFoundException(
        `Vehículo con ID ${dto.id_vehiculo} no encontrado`,
      );
    }

    const { id_vehiculo, ...resto } = dto;
    const nuevo = this.serviceRepository.create({
      ...resto,
      vehiculoRef: vehiculo,
    });
    const guardado = await this.serviceRepository.save(nuevo);
    guardado.vehiculoRef = vehiculo;

    await this.notificacionesService.crearNotificacionParaSuperadmin(
      'service',
      this.armarTitulo('cargado', guardado),
      this.armarMensaje(guardado),
    );

    await this.crearRecordatoriosProximoService(guardado, user);

    return guardado;
  }

  async obtenerTodos(): Promise<Service[]> {
    return this.serviceRepository.find({
      relations: ['vehiculoRef'],
      order: { id: 'DESC' },
    });
  }

  async actualizar(
    id: number,
    dto: CreateServiceDto,
    user?: Usuario,
  ): Promise<Service> {
    const existente = await this.serviceRepository.findOne({
      where: { id },
      relations: ['vehiculoRef'],
    });
    if (!existente) {
      throw new NotFoundException(`Service con ID ${id} no encontrado`);
    }

    const cambios: string[] = [];
    for (const { clave, etiqueta } of CAMPOS_COMPARABLES) {
      const nuevo = (dto as Record<string, unknown>)[clave];
      if (nuevo === undefined) continue;
      if (
        String(nuevo ?? '') !==
        String((existente as unknown as Record<string, unknown>)[clave] ?? '')
      ) {
        cambios.push(etiqueta);
      }
    }

    let vehiculoNuevo: Vehiculo | undefined;
    if (dto.id_vehiculo !== undefined) {
      const encontrado = await this.vehiculoRepository.findOneBy({
        id_vehiculo: dto.id_vehiculo,
      });
      if (!encontrado) {
        throw new NotFoundException(
          `Vehículo con ID ${dto.id_vehiculo} no encontrado`,
        );
      }
      vehiculoNuevo = encontrado;
      if (existente.vehiculoRef?.id_vehiculo !== encontrado.id_vehiculo) {
        cambios.push('vehículo');
      }
    }

    const proximoAnterior = existente.proximoService
      ? String(existente.proximoService).slice(0, 10)
      : null;
    const { id_vehiculo, ...resto } = dto;
    await this.serviceRepository.update(id, {
      ...resto,
      ...(vehiculoNuevo ? { vehiculoRef: vehiculoNuevo } : {}),
    });
    const actualizado = await this.serviceRepository.findOne({
      where: { id },
      relations: ['vehiculoRef'],
    });

    await this.notificacionesService.crearNotificacionParaSuperadmin(
      'service',
      this.armarTitulo('editado', actualizado as Service, cambios),
      this.armarMensaje(actualizado as Service),
    );

    if (
      dto.proximoService &&
      String(dto.proximoService).slice(0, 10) !== proximoAnterior
    ) {
      await this.crearRecordatoriosProximoService(
        actualizado as Service,
        user,
      );
    }

    return actualizado as Service;
  }

  async eliminar(id: number): Promise<void> {
    const existente = await this.serviceRepository.findOneBy({ id });
    if (!existente) {
      throw new NotFoundException(`Service con ID ${id} no encontrado`);
    }
    await this.serviceRepository.delete(id);
  }
}

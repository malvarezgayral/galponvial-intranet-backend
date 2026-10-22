import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CombustibleCarro } from '../entities/combustible-carro.entity';
import { CreateCombustibleCarroDto } from '../dto/create-combustible-carro.dto';
import { NotificacionesService } from 'src/notificaciones/services/notificaciones.service';
import { Usuario } from 'src/usuario/entities/usuario.entity';

const TITULO_MAX = 150;

@Injectable()
export class CombustibleCarroService {
  constructor(
    @InjectRepository(CombustibleCarro)
    private readonly carroRepository: Repository<CombustibleCarro>,
    private readonly notificacionesService: NotificacionesService,
  ) {}

  private armarTitulo(c: CombustibleCarro): string {
    const titulo = [
      'Carga de combustible (Carro)',
      `Fecha: ${c.fecha_carga}`,
      `Chofer: ${c.chofer}`,
      `${c.tipo_combustible}`,
      `Salida: ${c.litros_salida} L`,
    ].join(' · ');
    return titulo.length > TITULO_MAX
      ? titulo.slice(0, TITULO_MAX - 1) + '…'
      : titulo;
  }

  private armarMensaje(c: CombustibleCarro, user: Usuario): string {
    return [
      `Registro Nº: ${c.id_carro}`,
      `Fecha de carga: ${c.fecha_carga}`,
      `Chofer: ${c.chofer}`,
      `Estación de servicio: ${c.estacion_servicio}`,
      `Despachante: ${c.despachante}`,
      `Tipo de combustible: ${c.tipo_combustible}`,
      c.galpon_vial ? `Galpón Vial: ${c.galpon_vial}` : null,
      `Litros de entrada: ${c.litros_entrada}`,
      `Litros de salida: ${c.litros_salida}`,
      `Estado parcial: ${c.estado_parcial}`,
      `Registrada por: ${user.nombre} ${user.apellido} (DNI ${user.dni})`,
    ]
      .filter(Boolean)
      .join(' | ');
  }

  async create(
    dto: CreateCombustibleCarroDto,
    user: Usuario,
  ): Promise<CombustibleCarro> {
    // fecha_carga se guarda como texto 'YYYY-MM-DD' (evita corrimientos por zona horaria)
    const carga = this.carroRepository.create({
      ...dto,
      fecha_carga: dto.fecha_carga as unknown as Date,
    });
    const guardada = await this.carroRepository.save(carga);

    await this.notificacionesService.crearNotificacionParaSuperadmin(
      'combustible-carro',
      this.armarTitulo(guardada),
      this.armarMensaje(guardada, user),
    );

    return guardada;
  }

  async findAll(): Promise<CombustibleCarro[]> {
    return await this.carroRepository.find({ order: { id_carro: 'DESC' } });
  }
}

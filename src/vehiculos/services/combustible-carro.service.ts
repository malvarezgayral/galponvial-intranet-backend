import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CombustibleCarro } from '../entities/combustible-carro.entity';
import { CreateCombustibleCarroDto } from '../dto/create-combustible-carro.dto';
import { NotificacionesService } from 'src/notificaciones/services/notificaciones.service';
import { Usuario } from 'src/usuario/entities/usuario.entity';

const TITULO_MAX = 150;

const redondear = (n: number): number => Math.round(n * 100) / 100;

@Injectable()
export class CombustibleCarroService {
  constructor(
    @InjectRepository(CombustibleCarro)
    private readonly carroRepository: Repository<CombustibleCarro>,
    private readonly notificacionesService: NotificacionesService,
  ) {}

  private armarTitulo(c: CombustibleCarro): string {
    const movimiento =
      c.litros_entrada > 0
        ? `Entrada: ${c.litros_entrada} L`
        : `Salida: ${c.litros_salida} L`;
    const titulo = [
      'Carga de combustible (Carro)',
      `Máquina: ${c.maquina}`,
      `Fecha: ${c.fecha_carga}`,
      `Chofer: ${c.chofer}`,
      movimiento,
      `Total: ${c.total_combustible} L`,
    ].join(' · ');
    return titulo.length > TITULO_MAX
      ? titulo.slice(0, TITULO_MAX - 1) + '…'
      : titulo;
  }

  private armarMensaje(c: CombustibleCarro): string {
    return [
      `Registro Nº: ${c.id_carro}`,
      `Máquina: ${c.maquina}`,
      `Fecha de carga: ${c.fecha_carga}`,
      `Chofer: ${c.chofer}`,
      `Estación de servicio: ${c.estacion_servicio}`,
      `Despachante: ${c.despachante}`,
      `Tipo de combustible: ${c.tipo_combustible}`,
      c.galpon_vial ? `Galpón Vial: ${c.galpon_vial}` : null,
      `Litros de entrada: ${c.litros_entrada}`,
      `Litros de salida: ${c.litros_salida}`,
      `Total combustible: ${c.total_combustible}`,
      `Estado parcial: ${c.estado_parcial}`,
      `Registrada por: ${c.registrada_por_nombre} ${c.registrada_por_apellido} (DNI ${c.registrada_por_dni})`,
    ]
      .filter(Boolean)
      .join(' | ');
  }

  async create(
    dto: CreateCombustibleCarroDto,
    user: Usuario,
  ): Promise<CombustibleCarro> {
    const entrada = dto.litros_entrada ?? 0;
    const salida = dto.litros_salida ?? 0;

    if (entrada > 0 === salida > 0) {
      throw new BadRequestException(
        'Cargá litros de entrada o litros de salida (uno solo, mayor a 0). No se pueden cargar los dos juntos ni ninguno.',
      );
    }

    const guardada = await this.carroRepository.manager.transaction(
      async (manager) => {
        const repo = manager.getRepository(CombustibleCarro);

        const [anterior] = await repo.find({
          order: { id_carro: 'DESC' },
          take: 1,
          lock: { mode: 'pessimistic_write' },
        });

        let totalBase: number;
        let parcialBase: number;

        if (anterior) {
          totalBase = anterior.total_combustible;
          parcialBase = anterior.estado_parcial;
        } else {
          if (
            dto.total_inicial === undefined ||
            dto.estado_parcial_inicial === undefined
          ) {
            throw new BadRequestException(
              'Es la primera carga: completá el total de combustible inicial y el estado parcial inicial.',
            );
          }
          totalBase = dto.total_inicial;
          parcialBase = dto.estado_parcial_inicial;
        }

        const carga = repo.create({
          maquina: dto.maquina,
          // fecha_carga se guarda como texto 'YYYY-MM-DD' (evita corrimientos por zona horaria)
          fecha_carga: dto.fecha_carga as unknown as Date,
          chofer: dto.chofer,
          estacion_servicio: dto.estacion_servicio,
          despachante: dto.despachante,
          tipo_combustible: dto.tipo_combustible,
          galpon_vial: dto.galpon_vial,
          litros_entrada: entrada,
          litros_salida: salida,
          total_combustible: redondear(totalBase + entrada - salida),
          estado_parcial: redondear(parcialBase + salida),
          registrada_por_nombre: user.nombre,
          registrada_por_apellido: user.apellido,
          registrada_por_dni: String(user.dni),
        });

        return await repo.save(carga);
      },
    );

    await this.notificacionesService.crearNotificacionParaSuperadmin(
      'combustible-carro',
      this.armarTitulo(guardada),
      this.armarMensaje(guardada),
    );

    return guardada;
  }

  async findAll(): Promise<CombustibleCarro[]> {
    return await this.carroRepository.find({ order: { id_carro: 'DESC' } });
  }
}

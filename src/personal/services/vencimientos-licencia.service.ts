// src/personal/services/vencimientos-licencia.service.ts
// Revisa los vencimientos de la Licencia de conducir del Registro Administrativo
// y avisa al superadmin:
//  - Notificaciones > Personal: "por vencer" (faltan 30 días o menos) y "vencida"
//    (desde el día del vencimiento). Un aviso de cada uno por fecha de vencimiento.
//  - Mis Recordatorios: un recordatorio con la fecha del vencimiento, creado junto
//    con el primer aviso de esa fecha.
// Sin librerías de cron: primera revisión 1 minuto después de arrancar y luego cada hora.
// Eliminar una notificación solo la oculta, así que la fila existente evita repetir
// avisos; el recordatorio depende del aviso, así que si se borra no se vuelve a crear.
import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Like, Not, Repository } from 'typeorm';
import { RegistroAdministrativo } from '../entities/registro-administrativo.entity';
import { Notificacion } from 'src/notificaciones/entities/notificacion.entity';
import { NotificacionesService } from 'src/notificaciones/services/notificaciones.service';
import { Recordatorio } from 'src/vehiculos/entities/recordatorio.entity';
import { Usuario } from 'src/usuario/entities/usuario.entity';

const DIAS_AVISO_PREVIO = 30;
const PRIMERA_REVISION_MS = 60 * 1000;
const INTERVALO_MS = 60 * 60 * 1000;
const UN_DIA_MS = 24 * 60 * 60 * 1000;
const TITULO_MAX = 150;
const HORA_RECORDATORIO = 9;
const ZONA = 'America/Argentina/Buenos_Aires';

@Injectable()
export class VencimientosLicenciaService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(VencimientosLicenciaService.name);
  private primera: NodeJS.Timeout | null = null;
  private intervalo: NodeJS.Timeout | null = null;
  private corriendo = false;

  constructor(
    @InjectRepository(RegistroAdministrativo)
    private readonly regRepo: Repository<RegistroAdministrativo>,
    @InjectRepository(Notificacion)
    private readonly notifRepo: Repository<Notificacion>,
    @InjectRepository(Recordatorio)
    private readonly recRepo: Repository<Recordatorio>,
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
    private readonly notificacionesService: NotificacionesService,
  ) {}

  onModuleInit(): void {
    this.primera = setTimeout(() => void this.revisar(), PRIMERA_REVISION_MS);
    this.intervalo = setInterval(() => void this.revisar(), INTERVALO_MS);
  }

  onModuleDestroy(): void {
    if (this.primera) clearTimeout(this.primera);
    if (this.intervalo) clearInterval(this.intervalo);
  }

  async revisar(): Promise<number> {
    if (this.corriendo) return 0;
    this.corriendo = true;
    let creados = 0;
    try {
      const hoy = this.hoyArgentina();
      const registros = await this.regRepo.find({
        where: { licConducirHasta: Not(IsNull()) },
      });
      for (const r of registros) {
        const hasta = this.aIso(r.licConducirHasta);
        if (hasta === null) continue;
        const dias = this.diasEntre(hoy, hasta);
        if (dias > DIAS_AVISO_PREVIO) continue;
        if (await this.avisar(r, hasta, dias)) creados++;
      }
      if (creados > 0) {
        this.logger.log(`Avisos de licencia de conducir creados: ${creados}`);
      }
    } catch (e) {
      this.logger.error(
        'Falló la revisión de vencimientos de licencia de conducir: ' + String(e),
      );
    } finally {
      this.corriendo = false;
    }
    return creados;
  }

  private async avisar(
    r: RegistroAdministrativo,
    hasta: string,
    dias: number,
  ): Promise<boolean> {
    const vencida = dias <= 0;
    const fecha = this.fechaAR(hasta);
    const encabezado = vencida
      ? `Licencia de conducir vencida (${fecha})`
      : `Licencia de conducir por vencer (${fecha})`;
    const prefijo = `Personal · ${encabezado}`;
    const base = {
      tipo: 'personal',
      referenciaTipo: 'registro',
      referenciaId: r.id,
    };

    const yaAvisado = await this.notifRepo.count({
      where: { ...base, titulo: Like(`${prefijo}%`) },
    });
    if (yaAvisado > 0) return false;

    // ¿Hubo algún aviso (por vencer o vencida) para esta misma fecha?
    const avisosDeEstaFecha = await this.notifRepo.count({
      where: {
        ...base,
        titulo: Like(`Personal · Licencia de conducir %(${fecha})%`),
      },
    });
    const primerAviso = avisosDeEstaFecha === 0;

    let titulo = `${prefijo} · ${this.persona(r)}`;
    if (titulo.length > TITULO_MAX) {
      titulo = titulo.slice(0, TITULO_MAX - 1) + '…';
    }

    const partes: string[] = [];
    if (dias === 0) partes.push(`Vence hoy, ${fecha}.`);
    else if (vencida) partes.push(`Venció el ${fecha}.`);
    else if (dias === 1) partes.push(`Vence el ${fecha} (falta 1 día).`);
    else partes.push(`Vence el ${fecha} (faltan ${dias} días).`);
    if (r.numeroDni) partes.push(`DNI ${r.numeroDni}.`);
    if (r.licConducirCategoria) {
      partes.push(`Categoría: ${r.licConducirCategoria}.`);
    }
    partes.push('Aviso automático del sistema.');

    const creadas =
      await this.notificacionesService.crearNotificacionParaSuperadmin(
        'personal',
        titulo,
        partes.join(' '),
        'registro',
        r.id,
      );

    if (primerAviso && creadas.length > 0) {
      await this.crearRecordatorio(r, hasta, Number(creadas[0].dniUsuario));
    }
    return true;
  }

  // Un recordatorio en "Mis Recordatorios" del superadmin, con la fecha del vencimiento.
  // Se guarda directo (sin agregarRecordatorio) para no generar otro aviso en Recordatorios.
  private async crearRecordatorio(
    r: RegistroAdministrativo,
    hasta: string,
    dniSuperadmin: number,
  ): Promise<void> {
    try {
      const usuario = await this.usuarioRepo.findOne({
        where: { dni: dniSuperadmin },
      });
      if (usuario === null) return;
      const [a, m, d] = hasta.split('-').map(Number);
      const partes = [`Vence la licencia de conducir de ${this.persona(r)}`];
      if (r.numeroDni) partes.push(`DNI ${r.numeroDni}`);
      if (r.licConducirCategoria) {
        partes.push(`categoría ${r.licConducirCategoria}`);
      }
      const recordatorio = this.recRepo.create({
        fecha: new Date(a, m - 1, d, HORA_RECORDATORIO, 0, 0),
        descripcion: partes.join(' · ') + '. Aviso automático del sistema.',
        usuario,
        destinoDni: dniSuperadmin,
        paraTodos: false,
      });
      await this.recRepo.save(recordatorio);
    } catch (e) {
      this.logger.error(
        'No se pudo crear el recordatorio de licencia de conducir: ' + String(e),
      );
    }
  }

  private persona(r: RegistroAdministrativo): string {
    return r.legajo
      ? `${r.apellido}, ${r.nombre} (legajo ${r.legajo})`
      : `${r.apellido}, ${r.nombre}`;
  }

  // Fecha de hoy en Argentina, formato AAAA-MM-DD
  private hoyArgentina(): string {
    return new Date().toLocaleDateString('sv-SE', { timeZone: ZONA });
  }

  private aIso(valor: unknown): string | null {
    if (valor === null || valor === undefined) return null;
    const texto = valor instanceof Date ? valor.toISOString() : String(valor);
    const iso = texto.slice(0, 10);
    return /^\d{4}-\d{2}-\d{2}$/.test(iso) ? iso : null;
  }

  private diasEntre(desde: string, hasta: string): number {
    const a = Date.parse(`${desde}T00:00:00Z`);
    const b = Date.parse(`${hasta}T00:00:00Z`);
    return Math.round((b - a) / UN_DIA_MS);
  }

  private fechaAR(iso: string): string {
    const [a, m, d] = iso.split('-');
    return `${d}/${m}/${a}`;
  }
}

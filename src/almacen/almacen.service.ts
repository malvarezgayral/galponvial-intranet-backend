import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { BadRequestException } from '@nestjs/common';


import { Articulo } from './entities/articulo.entity';
import { GrupoArticulo } from './entities/grupo-articulo.entity';
import { Movimiento } from './entities/movimiento.entity';
import { Entrada } from './entities/entrada.entity';
import { Salida, SalidaTipo } from './entities/salida.entity';

import { CreateArticuloDto } from './dto/create-articulo.dto';
import { UpdateArticuloDto } from './dto/update-articulo.dto';

import { CreateGrupoArticuloDto } from './dto/create-grupo-articulo.dto';
import { UpdateGrupoArticuloDto } from './dto/update-grupo-articulo.dto';

import { GrupoArticuloDto } from './dto/grupo-articulo.dto';
import { MovimientoDTO } from './dto/movimiento.dto';
import { EntradaTipo, MovimientoTipo } from './enums/almacen.enum';
import { CreateSalidaDto } from './dto/create-salida.dto';
import { CreateEntradaDto } from './dto/create-entrada.dto';

@Injectable()
export class AlmacenService {

    constructor(
        private dataSource: DataSource,

        @InjectRepository(Articulo)
        private readonly articuloRepo: Repository<Articulo>,

        @InjectRepository(GrupoArticulo)
        private readonly grupoRepo: Repository<GrupoArticulo>,

        @InjectRepository(Movimiento)
        private readonly movimientoRepo: Repository<Movimiento>,

        @InjectRepository(Entrada)
        private readonly entradaRepo: Repository<Entrada>,

        @InjectRepository(Salida)
        private readonly salidaRepo: Repository<Salida>,
    ) { }

    // ---------------------- ARTÍCULOS ----------------------

    getAllArticles() {
        return this.articuloRepo.find({
            relations: ['grupo', 'unidadMedida'],
        });
    }

    createArticle(dto: CreateArticuloDto) {
        const art = this.articuloRepo.create(dto);
        return this.articuloRepo.save(art);
    }

    async updateArticle(cod: string, dto: UpdateArticuloDto) {
        const art = await this.articuloRepo.findOne({ where: { cod } });

        if (!art) throw new NotFoundException(`Artículo ${cod} no encontrado`);

        Object.assign(art, dto);
        return this.articuloRepo.save(art);
    }

    async deleteArticle(cod: string) {
        const r = await this.articuloRepo.delete({ cod });
        if (r.affected === 0)
            throw new NotFoundException(`Artículo ${cod} no encontrado`);

        return true;
    }

    // ---------------------- GRUPOS ----------------------

    getAllGroups() {
        return this.grupoRepo.find({
            relations: ['sector'],
        });
    }

    async getGroup(id: number): Promise<GrupoArticuloDto> {
        const grupo = await this.grupoRepo.findOne({
            where: { id },
        });

        if (!grupo) {
            throw new NotFoundException('Grupo no encontrado');
        }

        const articulos = await this.articuloRepo.find({
            where: { grupo: { id } },
        });

        const articulosDto: CreateArticuloDto[] = articulos.map((a) => ({
            nombre: a.nombre,
            modelo: a.modelo,
            descripcion: a.descripcion,
            img_url: a.img_url,
            unidad_tipo: a.unidad_tipo,
        }));

        const dto: GrupoArticuloDto = {
            id: grupo.id,
            nombre: grupo.nombre,
            descripcion: grupo.descripcion,
            sector_galpon: grupo.sector.nro_sector,
            articulos: articulosDto,
        };

        return dto;
    }



    createGroup(dto: CreateGrupoArticuloDto) {
        const g = this.grupoRepo.create(dto);
        return this.grupoRepo.save(g);
    }

    async updateGroup(id: number, dto: UpdateGrupoArticuloDto) {
        const g = await this.grupoRepo.findOne({ where: { id } });

        if (!g) throw new NotFoundException(`Grupo ${id} no encontrado`);

        Object.assign(g, dto);
        return this.grupoRepo.save(g);
    }

    // ---------------------- MOVIMIENTOS ----------------------

    async getMovimientosByArticulo(codArticulo: string): Promise<MovimientoDTO[]> {
        const articulo = await this.articuloRepo.findOne({
            where: { cod: codArticulo },
        });

        if (!articulo) {
            throw new NotFoundException('Artículo no encontrado');
        }

        const movimientos = await this.movimientoRepo.find({
            where: { articulo: { cod: codArticulo } },
            relations: ['articulo'],
        });

        const result: MovimientoDTO[] = [];

        for (const mov of movimientos) {
            const entrada = await this.entradaRepo.findOne({
                where: { movimiento: { id: mov.id } },
            });

            const salida = await this.salidaRepo.findOne({
                where: { movimiento: { id: mov.id } },
            });

            const dto = new MovimientoDTO();
            dto.tipoMovimiento = mov.tipo;
            dto.fecha = mov.fecha;
            dto.codArticulo = mov.articulo.cod;
            dto.dniUsuario = mov.usuario_id;

            if (mov.tipo === MovimientoTipo.ENTRADA && entrada) {
                dto.motivo = entrada.tipo;
                dto.detalle = entrada.detalle;
            }
            else if (mov.tipo === MovimientoTipo.SALIDA && salida) {
                dto.motivo = salida.tipo;

                dto.detalle =
                    salida.detalle_motivo ??
                    salida.detalle ??
                    salida.motivo_salida;
            }
            else {
                dto.motivo = mov.tipo;
                dto.detalle = '';
            }

            result.push(dto);
        }

        return result;
    }


    async createMovimiento(dto: CreateEntradaDto | CreateSalidaDto) {
        return await this.dataSource.transaction(async (manager) => {

            // -------------------------
            // 1. Identificar tipo mov
            // -------------------------
            const esEntrada = Object.values(EntradaTipo).includes(dto.tipo as EntradaTipo);
            const esSalida = Object.values(SalidaTipo).includes(dto.tipo as SalidaTipo);

            if (!esEntrada && !esSalida) {
                throw new BadRequestException(
                    'No se pudo determinar si el movimiento es ENTRADA o SALIDA.'
                );
            }

            // -------------------------
            // 2. Buscar Artículo
            // -------------------------
            const articulo = await manager.getRepository(Articulo).findOne({
                where: { cod: dto.cod_articulo },
            });

            if (!articulo) {
                throw new NotFoundException(
                    `No existe un artículo con cod '${dto.cod_articulo}'`
                );
            }

            // -------------------------
            // 3. Crear Movimiento
            // -------------------------
            const movimiento = manager.getRepository(Movimiento).create({
                tipo: esEntrada ? MovimientoTipo.ENTRADA : MovimientoTipo.SALIDA,
                fecha: new Date(),
                articulo,
                // usuario_id: dto.usuario_id (desactivado por ahora)
            });

            const movimientoGuardado = await manager.getRepository(Movimiento).save(movimiento);

            // -------------------------
            // 4. Crear ENTRADA
            // -------------------------
            if (esEntrada) {
                const dtoEntrada = dto as CreateEntradaDto;

                const entrada = manager.getRepository(Entrada).create({
                    tipo: dtoEntrada.tipo,
                    detalle: dtoEntrada.detalle,
                    proveedor: dtoEntrada.proveedor,
                    movimiento: movimientoGuardado
                });

                const entradaGuardada = await manager.getRepository(Entrada).save(entrada);

                return {
                    message: 'Entrada registrada correctamente.',
                    movimiento: movimientoGuardado,
                    entrada: entradaGuardada,
                };
            }

            // -------------------------
            // 5. Crear SALIDA
            // -------------------------
            if (esSalida) {
                const dtoSalida = dto as CreateSalidaDto;

                const salida = manager.getRepository(Salida).create({
                    tipo: dtoSalida.tipo,
                    detalle: dtoSalida.detalle,
                    motivo_salida: dtoSalida.motivo_salida,
                    detalle_motivo: dtoSalida.detalle_motivo,
                    movimiento: movimientoGuardado
                });

                const salidaGuardada = await manager.getRepository(Salida).save(salida);

                return {
                    message: 'Salida registrada correctamente.',
                    movimiento: movimientoGuardado,
                    salida: salidaGuardada,
                };
            }
        });
    }



}

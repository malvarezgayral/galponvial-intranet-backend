import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Servicio } from './entities/servicio.entity';
import { Vehiculo } from './entities/vehiculo.entity';
import { ReporteIncidente } from './entities/reporte-incidente.entity';
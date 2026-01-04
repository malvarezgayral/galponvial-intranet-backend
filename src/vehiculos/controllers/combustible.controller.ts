import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CombustibleService } from '../services/combustible.service';
import { CreateCombustibleCargaDto } from '../dto/create-combustible-carga.dto';

@Controller('combustible-cargas')
export class CombustibleController {
  constructor(private readonly combustibleService: CombustibleService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDto: CreateCombustibleCargaDto) {
    return this.combustibleService.create(createDto);
  }

  @Get()
  findAll() {
    return this.combustibleService.findAll();
  }
}

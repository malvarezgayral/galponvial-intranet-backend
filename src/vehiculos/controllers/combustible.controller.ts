import {
  Controller,
  Get,
  Post,
  // Param,
  // ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';

@Controller('combustible')
export class CombustibleController {
  constructor() {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create() {}

  @Get()
  findAll() {}

  // @Get('vehiculo/:id')
  // findByVehiculo(@Param('id', ParseIntPipe) id: number) {}

  // @Get('rendimiento/:id')
  // calcularRendimiento(@Param('id', ParseIntPipe) id: number) {}
}

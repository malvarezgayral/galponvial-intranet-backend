import { Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { SeedService } from './seed.service';

@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  /**
   * Endpoint para ejecutar el seed de la base de datos
   * POST /seed/run
   * Respuesta: { message, results }
   */
  @Post('run')
  @HttpCode(HttpStatus.OK)
  async runSeed(): Promise<{ message: string; results: Record<string, number> }> {
    return this.seedService.seed();
  }
}

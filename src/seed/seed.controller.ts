import { Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { SeedService } from './seed.service';
import { Auth } from 'src/usuario/decorators/auth.decorator';

@Controller('seed')
@Auth()
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Post('run')
  @HttpCode(HttpStatus.OK)
  async runSeed(): Promise<{
    message: string;
    results: Record<string, number>;
  }> {
    return this.seedService.seed();
  }
}

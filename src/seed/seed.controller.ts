import { Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { SeedService } from './seed.service';
import { Auth } from 'src/usuario/decorators/auth.decorator';
import { ValidRoles } from 'src/usuario/enums/usuario.enum';

@Controller('seed')
@Auth(ValidRoles.admin, ValidRoles.superUser)
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Post('run')
  @Auth(ValidRoles.admin, ValidRoles.superUser)
  @HttpCode(HttpStatus.OK)
  async runSeed(): Promise<{
    message: string;
    results: Record<string, number>;
  }> {
    return this.seedService.seed();
  }

  @Post('run/roles')
  @Auth()
  @HttpCode(HttpStatus.OK)
  runSeedRoles(): Promise<{
    message: string;
    results: Record<string, number>;
  }> {
    return this.seedService.seedRolesByUser();
  }
}

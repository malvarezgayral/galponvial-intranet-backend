import { Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SeedService } from './seed.service';
import { Auth } from 'src/usuario/decorators/auth.decorator';
import { ValidRoles } from 'src/usuario/enums/usuario.enum';

@ApiTags('Seed')
@Controller('seed')
@Auth(ValidRoles.admin, ValidRoles.superUser)
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @ApiOperation({
    summary: 'Ejecutar seed general del sistema',
    description:
      'Inicializa y popula la base de datos del sistema (entidades principales, configuraciones y relaciones necesarias).',
  })
  @ApiResponse({
    status: 200,
    description: 'Seed ejecutado correctamente',
  })
  @Post('run')
  @Auth(ValidRoles.admin, ValidRoles.superUser)
  @HttpCode(HttpStatus.OK)
  async runSeed(): Promise<{
    message: string;
    results: Record<string, number>;
  }> {
    return this.seedService.seed();
  }

  @ApiOperation({
    summary: 'Ejecutar seed de roles por usuario',
    description:
      'Asigna o inicializa los roles correspondientes a los usuarios existentes en el sistema.',
  })
  @ApiResponse({
    status: 200,
    description: 'Seed de roles ejecutado correctamente',
  })
  @Post('run/roles')
  @Auth()
  @HttpCode(HttpStatus.OK)
  runSeedRoles(): Promise<{
    message: string;
    results: Record<string, number>;
  }> {
    return this.seedService.seedRolesByUser();
  }

  @Post('run/usuarios')
  @Auth()
  @HttpCode(HttpStatus.OK)
  runSeedUsuarios(): Promise<{
    message: string;
    results: Record<string, number>;
  }> {
    return this.seedService.seedUsers();
  }
}

import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rol } from '../entities/rol.entity';
import { ValidRoles } from '../enums/usuario.enum';

@Injectable()
export class RolService {
  constructor(
    @InjectRepository(Rol)
    private rolRepository: Repository<Rol>,
  ) {}

  async getRolById(id: number) {
    try {
      const rol = await this.rolRepository.findOne({ where: { id } });
      if (!rol) {
        throw new Error(`Rol with id ${id} not found`);
      }
      return rol;
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async getEstructuraRolesConPermisos(): Promise<
    Record<string, { permisos: string[] }>
  > {
    try {
      const roles = await this.rolRepository.find();
      const estructura: Record<string, { permisos: string[] }> = {};

      // Agrupar todos los permisos por rol
      for (const role of roles) {
        if (!estructura[role.rol]) {
          estructura[role.rol] = { permisos: [] };
        }

        if (role.permisos && Array.isArray(role.permisos)) {
          estructura[role.rol].permisos.push(...role.permisos);
        }
      }

      // Eliminar duplicados en cada rol
      for (const rolName in estructura) {
        estructura[rolName].permisos = [
          ...new Set(estructura[rolName].permisos),
        ];
      }

      return estructura;
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  private handleDBErrors(error: any): never {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (error.code === '23505') throw new BadRequestException(error.detail);

    throw new InternalServerErrorException('Please check server logs');
  }
}

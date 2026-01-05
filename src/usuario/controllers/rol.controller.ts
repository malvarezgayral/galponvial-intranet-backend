import { Controller } from '@nestjs/common';
import { RolService } from '../services/rol.service';

@Controller('rol')
export class RolController {
  constructor(private readonly rolService: RolService) {}
}

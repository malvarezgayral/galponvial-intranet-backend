import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Le damos un nombre explícito a la clase
@Injectable()
export class JwtAuthGuard extends AuthGuard() {}

import { JwtService } from '@nestjs/jwt';

export function generateTestToken(
  jwtService: JwtService,
  payload?: Partial<any>,
) {
  return jwtService.sign({
    sub: 1,
    email: 'test@test.com',
    roles: ['admin', 'superUser'],
    ...payload,
  });
}

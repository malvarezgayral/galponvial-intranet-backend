export interface ObjectServiceResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface JwtLoginResponse {
  dni: number;
  email: string;
  nombre: string;
  apellido: string;
  rol: string;
  permisos: string[];
  accessToken: string;
  refreshToken: string;
  tokenVersion: number;
}

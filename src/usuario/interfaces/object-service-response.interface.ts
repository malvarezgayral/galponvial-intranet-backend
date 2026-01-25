export interface ObjectServiceResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface JwtLoginResponse {
  dni: number;
  email: string;
  rol: string;
  accessToken: string;
  refreshToken: string;
}

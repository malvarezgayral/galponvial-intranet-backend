export interface ObjectServiceResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface JwtLoginResponse {
  email: string;
  rol: string;
  accessToken: string;
  refreshToken: string;
}

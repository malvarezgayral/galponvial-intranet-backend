export interface ObjectServiceResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface JwtLoginResponse {
  dni: number;
  accessToken: string;
  refreshToken: string;
}

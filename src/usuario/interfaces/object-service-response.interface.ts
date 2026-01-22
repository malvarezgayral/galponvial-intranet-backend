export interface ObjectServiceResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface JwtLoginResponse {
  email: string;
  accessToken: string;
  refreshToken: string;
}

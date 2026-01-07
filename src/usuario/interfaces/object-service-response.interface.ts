export interface ObjectServiceResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface Result<T = unknown> {
  success: boolean;
  message: string;
  statusCode?: number;
  data?: T;
}

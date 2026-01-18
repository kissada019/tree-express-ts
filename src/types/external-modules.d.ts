declare module 'helmet';
declare module 'cors';
declare module 'express-rate-limit';
declare module 'dotenv';

declare module 'axios' {
  export interface AxiosRequestConfig {
    timeout?: number;
    httpAgent?: unknown;
    httpsAgent?: unknown;
    headers?: Record<string, string>;
    maxRedirects?: number;
  }

  export interface AxiosResponse<T = unknown> {
    data: T;
  }

  export interface AxiosInstance {
    interceptors: {
      response: {
        use: (
          onFulfilled: (response: AxiosResponse) => AxiosResponse | Promise<AxiosResponse>,
          onRejected?: (error: unknown) => unknown
        ) => unknown;
      };
    };
  }

  interface AxiosStatic {
    create: (config?: AxiosRequestConfig) => AxiosInstance;
  }

  const axios: AxiosStatic;
  export default axios;
}

declare module 'class-transformer' {
  export type ClassConstructor<T> = new (...args: any[]) => T;
  export function plainToInstance<T, V>(
    cls: ClassConstructor<T>,
    plain: V
  ): T;
}

declare module 'class-validator' {
  export interface ValidationError {
    constraints?: Record<string, string>;
    children?: ValidationError[];
  }

  export function validateOrReject(
    object: object,
    options?: Record<string, unknown>
  ): Promise<void>;
}

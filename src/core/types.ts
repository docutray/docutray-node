export interface ClientOptions {
  apiKey: string;
  baseURL?: string;
  timeout?: number;
  maxRetries?: number;
  fetch?: typeof globalThis.fetch;
}

export interface RequestOptions {
  headers?: Record<string, string>;
  signal?: AbortSignal;
  timeout?: number;
  maxRetries?: number;
  raw?: boolean;
  query?: Record<string, string | number | boolean | undefined>;
}

export interface RetryConfig {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  exponentialBase: number;
  jitterMin: number;
  jitterMax: number;
}

export type FileInput =
  | Blob
  | Buffer
  | ArrayBuffer
  | ReadableStream
  | FileWithMetadata;

export interface FileWithMetadata {
  content: Buffer | Blob;
  filename: string;
  contentType?: string;
}

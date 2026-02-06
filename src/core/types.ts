/**
 * Configuration options for the {@link DocuTray} client.
 *
 * @example
 * ```ts
 * import DocuTray from 'docutray';
 *
 * const client = new DocuTray({
 *   apiKey: 'dt_my-api-key',
 *   timeout: 30_000,
 *   maxRetries: 3,
 * });
 * ```
 */
export interface ClientOptions {
  /** API key for authenticating with the DocuTray API. */
  apiKey: string;
  /** Base URL for API requests. Defaults to `https://api.docutray.com/v1`. */
  baseURL?: string;
  /** Request timeout in milliseconds. Defaults to `60000`. */
  timeout?: number;
  /** Maximum number of retries on transient errors. Defaults to `2`. */
  maxRetries?: number;
  /** Custom `fetch` implementation. Defaults to `globalThis.fetch`. */
  fetch?: typeof globalThis.fetch;
}

/**
 * Per-request options that override client-level defaults.
 */
export interface RequestOptions {
  /** Additional HTTP headers to include in the request. */
  headers?: Record<string, string>;
  /** An `AbortSignal` to cancel the request. */
  signal?: AbortSignal;
  /** Request timeout in milliseconds, overriding the client default. */
  timeout?: number;
  /** Maximum retries for this specific request. */
  maxRetries?: number;
  /**
   * When `true`, returns a {@link RawResponse} instead of the parsed body.
   * @internal
   */
  raw?: boolean;
  /** Query string parameters appended to the request URL. */
  query?: Record<string, string | number | boolean | undefined>;
}

/**
 * Configuration for the exponential backoff retry strategy.
 */
export interface RetryConfig {
  /** Maximum number of retry attempts. */
  maxRetries: number;
  /** Initial delay in milliseconds before the first retry. */
  initialDelay: number;
  /** Maximum delay cap in milliseconds. */
  maxDelay: number;
  /** Base for exponential backoff calculation. */
  exponentialBase: number;
  /** Minimum jitter factor (0–1) added to the delay. */
  jitterMin: number;
  /** Maximum jitter factor (0–1) added to the delay. */
  jitterMax: number;
}

/**
 * Accepted file input types for document uploads.
 *
 * You can pass a `Blob`, `Buffer`, `ArrayBuffer`, or a {@link FileWithMetadata} object
 * that bundles the file content with a filename and optional content type.
 */
export type FileInput =
  | Blob
  | Buffer
  | ArrayBuffer
  | FileWithMetadata;

/**
 * A file with explicit filename and optional content type.
 *
 * @example
 * ```ts
 * const file: FileWithMetadata = {
 *   content: fs.readFileSync('invoice.pdf'),
 *   filename: 'invoice.pdf',
 *   contentType: 'application/pdf',
 * };
 * ```
 */
export interface FileWithMetadata {
  /** The file content as a `Buffer` or `Blob`. */
  content: Buffer | Blob;
  /** The filename, used for content type detection and the multipart upload. */
  filename: string;
  /** MIME type override. Auto-detected from `filename` when omitted. */
  contentType?: string;
}

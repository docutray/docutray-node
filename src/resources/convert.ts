import { APIResource } from '../resource.js';
import type { APIClient } from '../core/api-client.js';
import { DocuTrayError } from '../core/error.js';
import { waitForCompletion } from '../core/polling.js';
import { prepareFileUpload, prepareUrlUpload, prepareBase64Upload } from '../lib/files.js';
import {
  isConversionComplete,
} from '../types/convert.js';
import type { ConversionEnqueued, ConversionResult, ConversionStatus, ConvertParams } from '../types/convert.js';
import type { RequestOptions } from '../core/types.js';
import type { RawResponse } from '../core/raw-response.js';
import type { WaitOptions } from '../core/polling.js';

/** @internal */
type ConversionEnqueuedWithWait = ConversionEnqueued & {
  wait: (pollOptions?: WaitOptions<ConversionStatus>) => Promise<ConversionStatus>;
};

/**
 * Resource for converting documents to structured data using document type schemas.
 *
 * Access via {@link DocuTray.convert}.
 *
 * @example
 * ```ts
 * // Synchronous conversion
 * const result = await client.convert.run({
 *   documentTypeCode: 'invoice',
 *   url: 'https://example.com/invoice.pdf',
 * });
 * console.log(result.data);
 *
 * // Asynchronous conversion with polling
 * const status = await client.convert.runAsync({
 *   documentTypeCode: 'invoice',
 *   file: fs.readFileSync('invoice.pdf'),
 * });
 * const completed = await status.wait();
 * ```
 */
export class Convert extends APIResource {
  /**
   * Converts a document synchronously and returns the result.
   *
   * @param params - Conversion parameters including document type and file source.
   * @param options - Per-request options.
   * @returns The extracted data, its `validation` and, when enabled, `field_locations`.
   * @throws {@link DocuTrayError} if no file source is provided.
   */
  async run(params: ConvertParams, options?: Omit<RequestOptions, 'raw'>): Promise<ConversionResult> {
    return this._run<ConversionResult>(params, '/api/convert', options) as Promise<ConversionResult>;
  }

  /**
   * Starts an asynchronous conversion and returns a status object with a `wait()` method.
   *
   * @param params - Conversion parameters including document type and file source.
   * @param options - Per-request options.
   * @returns The initial status with a `wait()` method that polls until the operation
   *   reaches `SUCCESS` or `ERROR` and resolves with that final status. `wait()` does
   *   not throw on `ERROR`: check `status` (and `error`) on the result. It rejects
   *   only on timeout (`APITimeoutError`) or when a status request fails.
   * @throws {@link DocuTrayError} if no file source is provided.
   *
   * @example
   * ```ts
   * const status = await client.convert.runAsync({
   *   documentTypeCode: 'invoice',
   *   url: 'https://example.com/invoice.pdf',
   * });
   * const result = await status.wait({
   *   onStatus: (s) => console.log(s.status),
   * });
   * ```
   */
  async runAsync(params: ConvertParams, options?: Omit<RequestOptions, 'raw'>): Promise<ConversionEnqueuedWithWait> {
    const status = await this._run<ConversionEnqueued>(params, '/api/convert-async', options) as ConversionEnqueued;
    return Object.assign(status, {
      wait: (pollOptions?: WaitOptions<ConversionStatus>) =>
        waitForCompletion<ConversionStatus>({
          ...pollOptions,
          getStatus: () => this.getStatus(status.conversion_id, options),
          isComplete: isConversionComplete,
        }),
    });
  }

  /**
   * Retrieves the current status of an asynchronous conversion.
   *
   * @param conversionId - The conversion identifier returned by {@link runAsync}.
   * @param options - Per-request options.
   * @returns The current conversion status.
   */
  async getStatus(conversionId: string, options?: Omit<RequestOptions, 'raw'>): Promise<ConversionStatus> {
    return this._client.get<ConversionStatus>(
      `/api/convert-async/status/${encodeURIComponent(conversionId)}`,
      options,
    ) as Promise<ConversionStatus>;
  }

  /**
   * Returns a wrapper that provides raw HTTP responses for all methods.
   *
   * @example
   * ```ts
   * const raw = await client.convert.withRawResponse.run({
   *   documentTypeCode: 'invoice',
   *   url: 'https://example.com/invoice.pdf',
   * });
   * console.log(raw.statusCode, raw.headers);
   * const data = await raw.parse();
   * ```
   */
  get withRawResponse(): ConvertWithRawResponse {
    return new ConvertWithRawResponse(this._run.bind(this), this._client);
  }

  /** @internal */
  protected async _run<T>(
    params: ConvertParams,
    path: string,
    options?: RequestOptions,
  ): Promise<T | RawResponse<T>> {
    const { file, url, base64, contentType, filename, documentTypeCode, documentMetadata } = params;

    if (file) {
      const { formData } = prepareFileUpload(file, { filename, contentType });
      formData.append('document_type_code', documentTypeCode);
      if (documentMetadata) formData.append('document_metadata', JSON.stringify(documentMetadata));
      return this._client.post<T>(path, formData, options);
    }

    if (url) {
      const body: Record<string, unknown> = {
        ...prepareUrlUpload(url, contentType),
        document_type_code: documentTypeCode,
      };
      if (documentMetadata) body.document_metadata = documentMetadata;
      return this._client.post<T>(path, body, options);
    }

    if (base64) {
      const body: Record<string, unknown> = {
        ...prepareBase64Upload(base64, contentType),
        document_type_code: documentTypeCode,
      };
      if (documentMetadata) body.document_metadata = documentMetadata;
      return this._client.post<T>(path, body, options);
    }

    throw new DocuTrayError('Must provide file, url, or base64');
  }
}

/** @internal */
type ConvertRunFn = <T>(
  params: ConvertParams,
  path: string,
  options?: RequestOptions,
) => Promise<T | RawResponse<T>>;

/** @internal */
class ConvertWithRawResponse {
  private _run: ConvertRunFn;
  private _client: APIClient;

  constructor(run: ConvertRunFn, client: APIClient) {
    this._run = run;
    this._client = client;
  }

  async run(params: ConvertParams, options?: Omit<RequestOptions, 'raw'>): Promise<RawResponse<ConversionResult>> {
    return this._run<ConversionResult>(params, '/api/convert', { ...options, raw: true }) as Promise<RawResponse<ConversionResult>>;
  }

  async runAsync(params: ConvertParams, options?: Omit<RequestOptions, 'raw'>): Promise<RawResponse<ConversionEnqueued>> {
    return this._run<ConversionEnqueued>(params, '/api/convert-async', { ...options, raw: true }) as Promise<RawResponse<ConversionEnqueued>>;
  }

  async getStatus(conversionId: string, options?: Omit<RequestOptions, 'raw'>): Promise<RawResponse<ConversionStatus>> {
    return this._client.get<ConversionStatus>(
      `/api/convert-async/status/${encodeURIComponent(conversionId)}`,
      { ...options, raw: true },
    ) as Promise<RawResponse<ConversionStatus>>;
  }
}

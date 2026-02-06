import { APIResource } from '../resource.js';
import type { APIClient } from '../core/api-client.js';
import { DocuTrayError } from '../core/error.js';
import { waitForCompletion } from '../core/polling.js';
import { prepareFileUpload, prepareUrlUpload, prepareBase64Upload } from '../lib/files.js';
import {
  isConversionComplete,
  isConversionError,
} from '../types/convert.js';
import type { ConversionStatus, ConvertParams } from '../types/convert.js';
import type { RequestOptions } from '../core/types.js';
import type { RawResponse } from '../core/raw-response.js';
import type { PollOptions } from '../core/polling.js';

/** @internal */
type ConversionStatusWithWait = ConversionStatus & {
  wait: (pollOptions?: Partial<PollOptions<ConversionStatus>>) => Promise<ConversionStatus>;
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
   * @returns The conversion status with extracted data.
   * @throws {@link DocuTrayError} if no file source is provided.
   */
  async run(params: ConvertParams, options?: Omit<RequestOptions, 'raw'>): Promise<ConversionStatus> {
    return this._run(params, '/api/convert', options) as Promise<ConversionStatus>;
  }

  /**
   * Starts an asynchronous conversion and returns a status object with a `wait()` method.
   *
   * @param params - Conversion parameters including document type and file source.
   * @param options - Per-request options.
   * @returns The initial status with a `wait()` method that polls until completion.
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
  async runAsync(params: ConvertParams, options?: Omit<RequestOptions, 'raw'>): Promise<ConversionStatusWithWait> {
    const status = await this._run(params, '/api/convert-async', options) as ConversionStatus;
    return Object.assign(status, {
      wait: (pollOptions?: Partial<PollOptions<ConversionStatus>>) =>
        waitForCompletion<ConversionStatus>({
          getStatus: () => this.getStatus(status.conversionId, options),
          isComplete: isConversionComplete,
          isFailed: isConversionError,
          getError: (s) => s.error ?? 'Conversion failed',
          ...pollOptions,
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
      `/api/convert-async/status/${conversionId}`,
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
  protected async _run(
    params: ConvertParams,
    path: string,
    options?: RequestOptions,
  ): Promise<ConversionStatus | RawResponse<ConversionStatus>> {
    const { file, url, base64, contentType, filename, documentTypeCode, ...rest } = params;

    if (file) {
      const { formData } = prepareFileUpload(file, { filename, contentType });
      formData.append('documentTypeCode', documentTypeCode);
      if (rest.webhookUrl) formData.append('webhookUrl', rest.webhookUrl);
      if (rest.wait !== undefined) formData.append('wait', String(rest.wait));
      return this._client.post<ConversionStatus>(path, formData, options);
    }

    if (url) {
      const body = {
        ...prepareUrlUpload(url, contentType),
        documentTypeCode,
        ...rest,
      };
      return this._client.post<ConversionStatus>(path, body, options);
    }

    if (base64) {
      const body = {
        ...prepareBase64Upload(base64, contentType),
        documentTypeCode,
        ...rest,
      };
      return this._client.post<ConversionStatus>(path, body, options);
    }

    throw new DocuTrayError('Must provide file, url, or base64');
  }
}

/** @internal */
type ConvertRunFn = (
  params: ConvertParams,
  path: string,
  options?: RequestOptions,
) => Promise<ConversionStatus | RawResponse<ConversionStatus>>;

/** @internal */
class ConvertWithRawResponse {
  private _run: ConvertRunFn;
  private _client: APIClient;

  constructor(run: ConvertRunFn, client: APIClient) {
    this._run = run;
    this._client = client;
  }

  async run(params: ConvertParams, options?: Omit<RequestOptions, 'raw'>): Promise<RawResponse<ConversionStatus>> {
    return this._run(params, '/api/convert', { ...options, raw: true }) as Promise<RawResponse<ConversionStatus>>;
  }

  async runAsync(params: ConvertParams, options?: Omit<RequestOptions, 'raw'>): Promise<RawResponse<ConversionStatus>> {
    return this._run(params, '/api/convert-async', { ...options, raw: true }) as Promise<RawResponse<ConversionStatus>>;
  }

  async getStatus(conversionId: string, options?: Omit<RequestOptions, 'raw'>): Promise<RawResponse<ConversionStatus>> {
    return this._client.get<ConversionStatus>(
      `/api/convert-async/status/${conversionId}`,
      { ...options, raw: true },
    ) as Promise<RawResponse<ConversionStatus>>;
  }
}

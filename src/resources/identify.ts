import { APIResource } from '../resource.js';
import type { APIClient } from '../core/api-client.js';
import { DocuTrayError } from '../core/error.js';
import { waitForCompletion } from '../core/polling.js';
import { prepareFileUpload, prepareUrlUpload, prepareBase64Upload } from '../lib/files.js';
import {
  isIdentificationComplete,
  isIdentificationError,
} from '../types/identify.js';
import type { IdentificationStatus, IdentifyParams } from '../types/identify.js';
import type { RequestOptions } from '../core/types.js';
import type { RawResponse } from '../core/raw-response.js';
import type { PollOptions } from '../core/polling.js';

/** @internal */
type IdentificationStatusWithWait = IdentificationStatus & {
  wait: (pollOptions?: Partial<PollOptions<IdentificationStatus>>) => Promise<IdentificationStatus>;
};

/**
 * Resource for identifying document types from images or PDFs.
 *
 * Access via {@link DocuTray.identify}.
 *
 * @example
 * ```ts
 * // Synchronous identification
 * const result = await client.identify.run({
 *   url: 'https://example.com/document.pdf',
 * });
 * console.log(result.documentType); // best match
 * console.log(result.alternatives); // other candidates
 *
 * // Asynchronous identification with polling
 * const status = await client.identify.runAsync({
 *   file: fs.readFileSync('document.pdf'),
 * });
 * const completed = await status.wait();
 * ```
 */
export class Identify extends APIResource {
  /**
   * Identifies the document type synchronously and returns the result.
   *
   * @param params - Identification parameters including file source.
   * @param options - Per-request options.
   * @returns The identification status with matched document types.
   * @throws {@link DocuTrayError} if no file source is provided.
   */
  async run(params: IdentifyParams, options?: Omit<RequestOptions, 'raw'>): Promise<IdentificationStatus> {
    return this._run(params, '/api/identify', options) as Promise<IdentificationStatus>;
  }

  /**
   * Starts an asynchronous identification and returns a status object with a `wait()` method.
   *
   * @param params - Identification parameters including file source.
   * @param options - Per-request options.
   * @returns The initial status with a `wait()` method that polls until completion.
   * @throws {@link DocuTrayError} if no file source is provided.
   */
  async runAsync(params: IdentifyParams, options?: Omit<RequestOptions, 'raw'>): Promise<IdentificationStatusWithWait> {
    const status = await this._run(params, '/api/identify-async', options) as IdentificationStatus;
    return Object.assign(status, {
      wait: (pollOptions?: Partial<PollOptions<IdentificationStatus>>) =>
        waitForCompletion<IdentificationStatus>({
          getStatus: () => this.getStatus(status.id, options),
          isComplete: isIdentificationComplete,
          isFailed: isIdentificationError,
          getError: (s) => s.error ?? 'Identification failed',
          ...pollOptions,
        }),
    });
  }

  /**
   * Retrieves the current status of an asynchronous identification.
   *
   * @param identificationId - The identification identifier returned by {@link runAsync}.
   * @param options - Per-request options.
   * @returns The current identification status.
   */
  async getStatus(identificationId: string, options?: Omit<RequestOptions, 'raw'>): Promise<IdentificationStatus> {
    return this._client.get<IdentificationStatus>(
      `/api/identify-async/status/${identificationId}`,
      options,
    ) as Promise<IdentificationStatus>;
  }

  /**
   * Returns a wrapper that provides raw HTTP responses for all methods.
   */
  get withRawResponse(): IdentifyWithRawResponse {
    return new IdentifyWithRawResponse(this._run.bind(this), this._client);
  }

  /** @internal */
  protected async _run(
    params: IdentifyParams,
    path: string,
    options?: RequestOptions,
  ): Promise<IdentificationStatus | RawResponse<IdentificationStatus>> {
    const { file, url, base64, contentType, filename, documentTypeCodeOptions, ...rest } = params;

    if (file) {
      const { formData } = prepareFileUpload(file, { filename, contentType });
      if (documentTypeCodeOptions) {
        formData.append('document_type_code_options', JSON.stringify(documentTypeCodeOptions));
      }
      if (rest.webhookUrl) formData.append('webhook_url', rest.webhookUrl);
      if (rest.wait !== undefined) formData.append('wait', String(rest.wait));
      return this._client.post<IdentificationStatus>(path, formData, options);
    }

    if (url) {
      const body: Record<string, unknown> = {
        ...prepareUrlUpload(url, contentType),
      };
      if (documentTypeCodeOptions) body.document_type_code_options = documentTypeCodeOptions;
      if (rest.webhookUrl) body.webhook_url = rest.webhookUrl;
      if (rest.wait !== undefined) body.wait = rest.wait;
      return this._client.post<IdentificationStatus>(path, body, options);
    }

    if (base64) {
      const body: Record<string, unknown> = {
        ...prepareBase64Upload(base64, contentType),
      };
      if (documentTypeCodeOptions) body.document_type_code_options = documentTypeCodeOptions;
      if (rest.webhookUrl) body.webhook_url = rest.webhookUrl;
      if (rest.wait !== undefined) body.wait = rest.wait;
      return this._client.post<IdentificationStatus>(path, body, options);
    }

    throw new DocuTrayError('Must provide file, url, or base64');
  }
}

/** @internal */
type IdentifyRunFn = (
  params: IdentifyParams,
  path: string,
  options?: RequestOptions,
) => Promise<IdentificationStatus | RawResponse<IdentificationStatus>>;

/** @internal */
class IdentifyWithRawResponse {
  private _run: IdentifyRunFn;
  private _client: APIClient;

  constructor(run: IdentifyRunFn, client: APIClient) {
    this._run = run;
    this._client = client;
  }

  async run(params: IdentifyParams, options?: Omit<RequestOptions, 'raw'>): Promise<RawResponse<IdentificationStatus>> {
    return this._run(params, '/api/identify', { ...options, raw: true }) as Promise<RawResponse<IdentificationStatus>>;
  }

  async runAsync(params: IdentifyParams, options?: Omit<RequestOptions, 'raw'>): Promise<RawResponse<IdentificationStatus>> {
    return this._run(params, '/api/identify-async', { ...options, raw: true }) as Promise<RawResponse<IdentificationStatus>>;
  }

  async getStatus(identificationId: string, options?: Omit<RequestOptions, 'raw'>): Promise<RawResponse<IdentificationStatus>> {
    return this._client.get<IdentificationStatus>(
      `/api/identify-async/status/${identificationId}`,
      { ...options, raw: true },
    ) as Promise<RawResponse<IdentificationStatus>>;
  }
}

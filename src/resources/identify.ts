import { APIResource } from '../resource.js';
import type { APIClient } from '../core/api-client.js';
import { DocuTrayError } from '../core/error.js';
import { waitForCompletion } from '../core/polling.js';
import { prepareFileUpload, prepareUrlUpload, prepareBase64Upload } from '../lib/files.js';
import {
  isIdentificationComplete,
} from '../types/identify.js';
import type { IdentificationEnqueued, IdentificationResult, IdentificationStatus, IdentifyParams } from '../types/identify.js';
import type { RequestOptions } from '../core/types.js';
import type { RawResponse } from '../core/raw-response.js';
import type { WaitOptions } from '../core/polling.js';

/** @internal */
type IdentificationEnqueuedWithWait = IdentificationEnqueued & {
  wait: (pollOptions?: WaitOptions<IdentificationStatus>) => Promise<IdentificationStatus>;
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
 *   documentTypeCodeOptions: ['invoice', 'receipt'],
 * });
 * console.log(result.document_type); // best match
 * console.log(result.alternatives); // other candidates
 *
 * // Asynchronous identification with polling
 * const status = await client.identify.runAsync({
 *   file: fs.readFileSync('document.pdf'),
 *   documentTypeCodeOptions: ['invoice', 'receipt'],
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
   * @returns The best match (`document_type`) and, when there are any, `alternatives`.
   * @throws {@link DocuTrayError} if no file source is provided.
   */
  async run(params: IdentifyParams, options?: Omit<RequestOptions, 'raw'>): Promise<IdentificationResult> {
    return this._run<IdentificationResult>(params, '/api/identify', options) as Promise<IdentificationResult>;
  }

  /**
   * Starts an asynchronous identification and returns a status object with a `wait()` method.
   *
   * @param params - Identification parameters including file source.
   * @param options - Per-request options.
   * @returns The initial status with a `wait()` method that polls until the operation
   *   reaches `SUCCESS` or `ERROR` and resolves with that final status. `wait()` does
   *   not throw on `ERROR`: check `status` (and `error`) on the result. It rejects
   *   only on timeout (`APITimeoutError`) or when a status request fails.
   * @throws {@link DocuTrayError} if no file source is provided.
   */
  async runAsync(params: IdentifyParams, options?: Omit<RequestOptions, 'raw'>): Promise<IdentificationEnqueuedWithWait> {
    const status = await this._run<IdentificationEnqueued>(params, '/api/identify-async', options) as IdentificationEnqueued;
    return Object.assign(status, {
      wait: (pollOptions?: WaitOptions<IdentificationStatus>) =>
        waitForCompletion<IdentificationStatus>({
          getStatus: () => this.getStatus(status.id, options),
          isComplete: isIdentificationComplete,
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
      `/api/identify-async/status/${encodeURIComponent(identificationId)}`,
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
  protected async _run<T>(
    params: IdentifyParams,
    path: string,
    options?: RequestOptions,
  ): Promise<T | RawResponse<T>> {
    const { file, url, base64, contentType, filename, documentTypeCodeOptions, documentMetadata } = params;

    if (file) {
      const { formData } = prepareFileUpload(file, { filename, contentType });
      formData.append('document_type_code_options', JSON.stringify(documentTypeCodeOptions));
      if (documentMetadata) formData.append('document_metadata', JSON.stringify(documentMetadata));
      return this._client.post<T>(path, formData, options);
    }

    if (url) {
      const body: Record<string, unknown> = {
        ...prepareUrlUpload(url, contentType),
      };
      body.document_type_code_options = documentTypeCodeOptions;
      if (documentMetadata) body.document_metadata = documentMetadata;
      return this._client.post<T>(path, body, options);
    }

    if (base64) {
      const body: Record<string, unknown> = {
        ...prepareBase64Upload(base64, contentType),
      };
      body.document_type_code_options = documentTypeCodeOptions;
      if (documentMetadata) body.document_metadata = documentMetadata;
      return this._client.post<T>(path, body, options);
    }

    throw new DocuTrayError('Must provide file, url, or base64');
  }
}

/** @internal */
type IdentifyRunFn = <T>(
  params: IdentifyParams,
  path: string,
  options?: RequestOptions,
) => Promise<T | RawResponse<T>>;

/** @internal */
class IdentifyWithRawResponse {
  private _run: IdentifyRunFn;
  private _client: APIClient;

  constructor(run: IdentifyRunFn, client: APIClient) {
    this._run = run;
    this._client = client;
  }

  async run(params: IdentifyParams, options?: Omit<RequestOptions, 'raw'>): Promise<RawResponse<IdentificationResult>> {
    return this._run<IdentificationResult>(params, '/api/identify', { ...options, raw: true }) as Promise<RawResponse<IdentificationResult>>;
  }

  async runAsync(params: IdentifyParams, options?: Omit<RequestOptions, 'raw'>): Promise<RawResponse<IdentificationEnqueued>> {
    return this._run<IdentificationEnqueued>(params, '/api/identify-async', { ...options, raw: true }) as Promise<RawResponse<IdentificationEnqueued>>;
  }

  async getStatus(identificationId: string, options?: Omit<RequestOptions, 'raw'>): Promise<RawResponse<IdentificationStatus>> {
    return this._client.get<IdentificationStatus>(
      `/api/identify-async/status/${encodeURIComponent(identificationId)}`,
      { ...options, raw: true },
    ) as Promise<RawResponse<IdentificationStatus>>;
  }
}

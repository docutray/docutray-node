import { APIResource } from '../resource.js';
import type { APIClient } from '../core/api-client.js';
import { DocuTrayError } from '../core/error.js';
import { waitForCompletion } from '../core/polling.js';
import { prepareFileUpload, prepareUrlUpload, prepareBase64Upload } from '../lib/files.js';
import {
  isStepExecutionComplete,
} from '../types/step.js';
import type { StepExecutionEnqueued, StepExecutionStatus, StepsRunParams } from '../types/step.js';
import type { RequestOptions } from '../core/types.js';
import type { RawResponse } from '../core/raw-response.js';
import type { WaitOptions } from '../core/polling.js';

/** @internal */
type StepExecutionEnqueuedWithWait = StepExecutionEnqueued & {
  wait: (pollOptions?: WaitOptions<StepExecutionStatus>) => Promise<StepExecutionStatus>;
};

/**
 * Resource for running predefined processing steps on documents.
 *
 * Access via {@link DocuTray.steps}.
 *
 * @example
 * ```ts
 * const status = await client.steps.runAsync({
 *   stepId: 'ocr-extract',
 *   url: 'https://example.com/document.pdf',
 * });
 * const result = await status.wait();
 * console.log(result.data);
 * ```
 */
export class Steps extends APIResource {
  /**
   * Runs a processing step asynchronously and returns a status object with a `wait()` method.
   *
   * @param params - Step execution parameters including step ID and file source.
   * @param options - Per-request options.
   * @returns The initial status with a `wait()` method that polls until the operation
   *   reaches `SUCCESS` or `ERROR` and resolves with that final status. `wait()` does
   *   not throw on `ERROR`: check `status` (and `error`) on the result. It rejects
   *   only on timeout (`APITimeoutError`) or when a status request fails.
   * @throws {@link DocuTrayError} if no file source is provided.
   */
  async runAsync(params: StepsRunParams, options?: Omit<RequestOptions, 'raw'>): Promise<StepExecutionEnqueuedWithWait> {
    const status = await this._run<StepExecutionEnqueued>(params, options) as StepExecutionEnqueued;
    return Object.assign(status, {
      wait: (pollOptions?: WaitOptions<StepExecutionStatus>) =>
        waitForCompletion<StepExecutionStatus>({
          ...pollOptions,
          getStatus: () => this.getStatus(status.id, options),
          isComplete: isStepExecutionComplete,
        }),
    });
  }

  /**
   * Retrieves the current status of an asynchronous step execution.
   *
   * @param executionId - The execution identifier returned by {@link runAsync}.
   * @param options - Per-request options.
   * @returns The current step execution status.
   */
  async getStatus(executionId: string, options?: Omit<RequestOptions, 'raw'>): Promise<StepExecutionStatus> {
    return this._client.get<StepExecutionStatus>(
      `/api/steps-async/status/${encodeURIComponent(executionId)}`,
      options,
    ) as Promise<StepExecutionStatus>;
  }

  /**
   * Returns a wrapper that provides raw HTTP responses for all methods.
   */
  get withRawResponse(): StepsWithRawResponse {
    return new StepsWithRawResponse(this._run.bind(this), this._client);
  }

  /** @internal */
  protected async _run<T>(
    params: StepsRunParams,
    options?: RequestOptions,
  ): Promise<T | RawResponse<T>> {
    const { stepId, file, url, base64, contentType, filename, documentMetadata } = params;
    const path = `/api/steps-async/${encodeURIComponent(stepId)}`;

    if (file) {
      const { formData } = prepareFileUpload(file, { filename, contentType });
      if (documentMetadata) formData.append('document_metadata', JSON.stringify(documentMetadata));
      return this._client.post<T>(path, formData, options);
    }

    if (url) {
      const body: Record<string, unknown> = {
        ...prepareUrlUpload(url, contentType),
      };
      if (documentMetadata) body.document_metadata = documentMetadata;
      return this._client.post<T>(path, body, options);
    }

    if (base64) {
      const body: Record<string, unknown> = {
        ...prepareBase64Upload(base64, contentType),
      };
      if (documentMetadata) body.document_metadata = documentMetadata;
      return this._client.post<T>(path, body, options);
    }

    throw new DocuTrayError('Must provide file, url, or base64');
  }
}

/** @internal */
type StepsRunFn = <T>(
  params: StepsRunParams,
  options?: RequestOptions,
) => Promise<T | RawResponse<T>>;

/** @internal */
class StepsWithRawResponse {
  private _run: StepsRunFn;
  private _client: APIClient;

  constructor(run: StepsRunFn, client: APIClient) {
    this._run = run;
    this._client = client;
  }

  async runAsync(params: StepsRunParams, options?: Omit<RequestOptions, 'raw'>): Promise<RawResponse<StepExecutionEnqueued>> {
    return this._run<StepExecutionEnqueued>(params, { ...options, raw: true }) as Promise<RawResponse<StepExecutionEnqueued>>;
  }

  async getStatus(executionId: string, options?: Omit<RequestOptions, 'raw'>): Promise<RawResponse<StepExecutionStatus>> {
    return this._client.get<StepExecutionStatus>(
      `/api/steps-async/status/${encodeURIComponent(executionId)}`,
      { ...options, raw: true },
    ) as Promise<RawResponse<StepExecutionStatus>>;
  }
}

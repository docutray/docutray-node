import { APIResource } from '../resource.js';
import type { APIClient } from '../core/api-client.js';
import { DocuTrayError } from '../core/error.js';
import { waitForCompletion } from '../core/polling.js';
import { prepareFileUpload, prepareUrlUpload, prepareBase64Upload } from '../lib/files.js';
import {
  isStepExecutionComplete,
  isStepExecutionError,
} from '../types/step.js';
import type { StepExecutionStatus, StepsRunParams } from '../types/step.js';
import type { RequestOptions } from '../core/types.js';
import type { RawResponse } from '../core/raw-response.js';
import type { PollOptions } from '../core/polling.js';

/** @internal */
type StepExecutionStatusWithWait = StepExecutionStatus & {
  wait: (pollOptions?: Partial<PollOptions<StepExecutionStatus>>) => Promise<StepExecutionStatus>;
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
   * @returns The initial status with a `wait()` method that polls until completion.
   * @throws {@link DocuTrayError} if no file source is provided.
   */
  async runAsync(params: StepsRunParams, options?: Omit<RequestOptions, 'raw'>): Promise<StepExecutionStatusWithWait> {
    const status = await this._run(params, options) as StepExecutionStatus;
    return Object.assign(status, {
      wait: (pollOptions?: Partial<PollOptions<StepExecutionStatus>>) =>
        waitForCompletion<StepExecutionStatus>({
          getStatus: () => this.getStatus(status.id, options),
          isComplete: isStepExecutionComplete,
          isFailed: isStepExecutionError,
          getError: (s) => {
            if (typeof s.error === 'string') return s.error;
            if (s.error) return JSON.stringify(s.error);
            return 'Step execution failed';
          },
          ...pollOptions,
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
      `/api/steps-async/status/${executionId}`,
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
  protected async _run(
    params: StepsRunParams,
    options?: RequestOptions,
  ): Promise<StepExecutionStatus | RawResponse<StepExecutionStatus>> {
    const { stepId, file, url, base64, contentType, filename, documentMetadata, ...rest } = params;
    const path = `/api/steps-async/${stepId}`;

    if (file) {
      const { formData } = prepareFileUpload(file, { filename, contentType });
      if (documentMetadata) formData.append('document_metadata', JSON.stringify(documentMetadata));
      if (rest.webhookUrl) formData.append('webhook_url', rest.webhookUrl);
      if (rest.wait !== undefined) formData.append('wait', String(rest.wait));
      return this._client.post<StepExecutionStatus>(path, formData, options);
    }

    if (url) {
      const body: Record<string, unknown> = {
        ...prepareUrlUpload(url, contentType),
      };
      if (documentMetadata) body.document_metadata = documentMetadata;
      if (rest.webhookUrl) body.webhook_url = rest.webhookUrl;
      if (rest.wait !== undefined) body.wait = rest.wait;
      return this._client.post<StepExecutionStatus>(path, body, options);
    }

    if (base64) {
      const body: Record<string, unknown> = {
        ...prepareBase64Upload(base64, contentType),
      };
      if (documentMetadata) body.document_metadata = documentMetadata;
      if (rest.webhookUrl) body.webhook_url = rest.webhookUrl;
      if (rest.wait !== undefined) body.wait = rest.wait;
      return this._client.post<StepExecutionStatus>(path, body, options);
    }

    throw new DocuTrayError('Must provide file, url, or base64');
  }
}

/** @internal */
type StepsRunFn = (
  params: StepsRunParams,
  options?: RequestOptions,
) => Promise<StepExecutionStatus | RawResponse<StepExecutionStatus>>;

/** @internal */
class StepsWithRawResponse {
  private _run: StepsRunFn;
  private _client: APIClient;

  constructor(run: StepsRunFn, client: APIClient) {
    this._run = run;
    this._client = client;
  }

  async runAsync(params: StepsRunParams, options?: Omit<RequestOptions, 'raw'>): Promise<RawResponse<StepExecutionStatus>> {
    return this._run(params, { ...options, raw: true }) as Promise<RawResponse<StepExecutionStatus>>;
  }

  async getStatus(executionId: string, options?: Omit<RequestOptions, 'raw'>): Promise<RawResponse<StepExecutionStatus>> {
    return this._client.get<StepExecutionStatus>(
      `/api/steps-async/status/${executionId}`,
      { ...options, raw: true },
    ) as Promise<RawResponse<StepExecutionStatus>>;
  }
}

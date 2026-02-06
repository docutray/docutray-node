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

type StepExecutionStatusWithWait = StepExecutionStatus & {
  wait: (pollOptions?: Partial<PollOptions<StepExecutionStatus>>) => Promise<StepExecutionStatus>;
};

export class Steps extends APIResource {
  async runAsync(params: StepsRunParams, options?: Omit<RequestOptions, 'raw'>): Promise<StepExecutionStatusWithWait> {
    const status = await this._run(params, options) as StepExecutionStatus;
    return Object.assign(status, {
      wait: (pollOptions?: Partial<PollOptions<StepExecutionStatus>>) =>
        waitForCompletion<StepExecutionStatus>({
          getStatus: () => this.getStatus(status.executionId, options),
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

  async getStatus(executionId: string, options?: Omit<RequestOptions, 'raw'>): Promise<StepExecutionStatus> {
    return this._client.get<StepExecutionStatus>(
      `/api/steps-async/status/${executionId}`,
      options,
    ) as Promise<StepExecutionStatus>;
  }

  get withRawResponse(): StepsWithRawResponse {
    return new StepsWithRawResponse(this._run.bind(this), this._client);
  }

  protected async _run(
    params: StepsRunParams,
    options?: RequestOptions,
  ): Promise<StepExecutionStatus | RawResponse<StepExecutionStatus>> {
    const { stepId, file, url, base64, contentType, filename, ...rest } = params;
    const path = `/api/steps-async/${stepId}`;

    if (file) {
      const { formData } = prepareFileUpload(file, { filename, contentType });
      if (rest.webhookUrl) formData.append('webhookUrl', rest.webhookUrl);
      if (rest.wait !== undefined) formData.append('wait', String(rest.wait));
      return this._client.post<StepExecutionStatus>(path, formData, options);
    }

    if (url) {
      const body = {
        ...prepareUrlUpload(url, contentType),
        ...rest,
      };
      return this._client.post<StepExecutionStatus>(path, body, options);
    }

    if (base64) {
      const body = {
        ...prepareBase64Upload(base64, contentType),
        ...rest,
      };
      return this._client.post<StepExecutionStatus>(path, body, options);
    }

    throw new DocuTrayError('Must provide file, url, or base64');
  }
}

type StepsRunFn = (
  params: StepsRunParams,
  options?: RequestOptions,
) => Promise<StepExecutionStatus | RawResponse<StepExecutionStatus>>;

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

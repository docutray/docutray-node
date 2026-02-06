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

type IdentificationStatusWithWait = IdentificationStatus & {
  wait: (pollOptions?: Partial<PollOptions<IdentificationStatus>>) => Promise<IdentificationStatus>;
};

export class Identify extends APIResource {
  async run(params: IdentifyParams, options?: RequestOptions): Promise<IdentificationStatus> {
    return this._run(params, '/api/identify', options) as Promise<IdentificationStatus>;
  }

  async runAsync(params: IdentifyParams, options?: RequestOptions): Promise<IdentificationStatusWithWait> {
    const status = await this._run(params, '/api/identify-async', options) as IdentificationStatus;
    return Object.assign(status, {
      wait: (pollOptions?: Partial<PollOptions<IdentificationStatus>>) =>
        waitForCompletion<IdentificationStatus>({
          getStatus: () => this.getStatus(status.identificationId, options),
          isComplete: isIdentificationComplete,
          isFailed: isIdentificationError,
          getError: (s) => s.error ?? 'Identification failed',
          ...pollOptions,
        }),
    });
  }

  async getStatus(identificationId: string, options?: RequestOptions): Promise<IdentificationStatus> {
    return this._client.get<IdentificationStatus>(
      `/api/identify-async/status/${identificationId}`,
      options,
    ) as Promise<IdentificationStatus>;
  }

  get withRawResponse(): IdentifyWithRawResponse {
    return new IdentifyWithRawResponse(this, this._client);
  }

  private async _run(
    params: IdentifyParams,
    path: string,
    options?: RequestOptions,
  ): Promise<IdentificationStatus | RawResponse<IdentificationStatus>> {
    const { file, url, base64, contentType, filename, ...rest } = params;

    if (file) {
      const { formData } = prepareFileUpload(file, { filename, contentType });
      if (rest.webhookUrl) formData.append('webhookUrl', rest.webhookUrl);
      if (rest.wait !== undefined) formData.append('wait', String(rest.wait));
      return this._client.post<IdentificationStatus>(path, formData, options);
    }

    if (url) {
      const body = {
        ...prepareUrlUpload(url, contentType),
        ...rest,
      };
      return this._client.post<IdentificationStatus>(path, body, options);
    }

    if (base64) {
      const body = {
        ...prepareBase64Upload(base64, contentType),
        ...rest,
      };
      return this._client.post<IdentificationStatus>(path, body, options);
    }

    throw new DocuTrayError('Must provide file, url, or base64');
  }
}

class IdentifyWithRawResponse {
  private _resource: Identify;
  private _client: APIClient;

  constructor(resource: Identify, client: APIClient) {
    this._resource = resource;
    this._client = client;
  }

  async run(params: IdentifyParams, options?: RequestOptions): Promise<RawResponse<IdentificationStatus>> {
    return this._resource['_run'](params, '/api/identify', { ...options, raw: true }) as Promise<RawResponse<IdentificationStatus>>;
  }

  async runAsync(params: IdentifyParams, options?: RequestOptions): Promise<RawResponse<IdentificationStatus>> {
    return this._resource['_run'](params, '/api/identify-async', { ...options, raw: true }) as Promise<RawResponse<IdentificationStatus>>;
  }

  async getStatus(identificationId: string, options?: RequestOptions): Promise<RawResponse<IdentificationStatus>> {
    return this._client.get<IdentificationStatus>(
      `/api/identify-async/status/${identificationId}`,
      { ...options, raw: true },
    ) as Promise<RawResponse<IdentificationStatus>>;
  }
}

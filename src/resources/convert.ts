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

type ConversionStatusWithWait = ConversionStatus & {
  wait: (pollOptions?: Partial<PollOptions<ConversionStatus>>) => Promise<ConversionStatus>;
};

export class Convert extends APIResource {
  async run(params: ConvertParams, options?: Omit<RequestOptions, 'raw'>): Promise<ConversionStatus> {
    return this._run(params, '/api/convert', options) as Promise<ConversionStatus>;
  }

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

  async getStatus(conversionId: string, options?: Omit<RequestOptions, 'raw'>): Promise<ConversionStatus> {
    return this._client.get<ConversionStatus>(
      `/api/convert-async/status/${conversionId}`,
      options,
    ) as Promise<ConversionStatus>;
  }

  get withRawResponse(): ConvertWithRawResponse {
    return new ConvertWithRawResponse(this._run.bind(this), this._client);
  }

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

type ConvertRunFn = (
  params: ConvertParams,
  path: string,
  options?: RequestOptions,
) => Promise<ConversionStatus | RawResponse<ConversionStatus>>;

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

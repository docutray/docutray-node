import { APIResource } from '../resource.js';
import type { APIClient } from '../core/api-client.js';
import { Page } from '../core/pagination.js';
import type { PageResponse } from '../core/pagination.js';
import type { DocumentType, DocumentTypesListParams, ValidationResult } from '../types/document-type.js';
import type { RequestOptions } from '../core/types.js';
import type { RawResponse } from '../core/raw-response.js';

export class DocumentTypes extends APIResource {
  async list(params?: DocumentTypesListParams, options?: RequestOptions): Promise<Page<DocumentType>> {
    const query = params ? { ...params } : undefined;
    const response = await this._client.get<PageResponse<DocumentType>>(
      '/api/document-types',
      { ...options, query },
    ) as PageResponse<DocumentType>;
    return new Page<DocumentType>(response, {
      client: this._client,
      path: '/api/document-types',
      query,
      options,
    });
  }

  async get(id: string, options?: RequestOptions): Promise<DocumentType> {
    return this._client.get<DocumentType>(
      `/api/document-types/${id}`,
      options,
    ) as Promise<DocumentType>;
  }

  async validate(id: string, options?: RequestOptions): Promise<ValidationResult> {
    return this._client.post<ValidationResult>(
      `/api/document-types/${id}/validate`,
      undefined,
      options,
    ) as Promise<ValidationResult>;
  }

  get withRawResponse(): DocumentTypesWithRawResponse {
    return new DocumentTypesWithRawResponse(this._client);
  }
}

class DocumentTypesWithRawResponse {
  private _client: APIClient;

  constructor(client: APIClient) {
    this._client = client;
  }

  async list(params?: DocumentTypesListParams, options?: RequestOptions): Promise<RawResponse<PageResponse<DocumentType>>> {
    const query = params ? { ...params } : undefined;
    return this._client.get<PageResponse<DocumentType>>(
      '/api/document-types',
      { ...options, query, raw: true },
    ) as Promise<RawResponse<PageResponse<DocumentType>>>;
  }

  async get(id: string, options?: RequestOptions): Promise<RawResponse<DocumentType>> {
    return this._client.get<DocumentType>(
      `/api/document-types/${id}`,
      { ...options, raw: true },
    ) as Promise<RawResponse<DocumentType>>;
  }

  async validate(id: string, options?: RequestOptions): Promise<RawResponse<ValidationResult>> {
    return this._client.post<ValidationResult>(
      `/api/document-types/${id}/validate`,
      undefined,
      { ...options, raw: true },
    ) as Promise<RawResponse<ValidationResult>>;
  }
}

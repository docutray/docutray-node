import { APIResource } from '../resource.js';
import { Page } from '../core/pagination.js';
import type { PageResponse } from '../core/pagination.js';
import type { APIClient } from '../core/api-client.js';
import type { RequestOptions } from '../core/types.js';
import type { RawResponse } from '../core/raw-response.js';
import type {
  KnowledgeBase,
  KnowledgeBaseDocument,
  SearchResult,
  SyncResult,
} from '../types/knowledge-base.js';

export interface KnowledgeBaseCreateParams {
  name: string;
  description?: string;
  schema?: Record<string, unknown>;
}

export interface KnowledgeBaseUpdateParams {
  name?: string;
  description?: string;
  schema?: Record<string, unknown>;
  isActive?: boolean;
}

export interface KnowledgeBaseSearchParams {
  query: string;
  limit?: number;
}

export interface KnowledgeBaseListParams {
  page?: number;
  limit?: number;
}

export interface KBDocumentCreateParams {
  content: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface KBDocumentUpdateParams {
  content?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface KBDocumentListParams {
  page?: number;
  limit?: number;
}

export class KnowledgeBases extends APIResource {
  async list(params?: KnowledgeBaseListParams, options?: RequestOptions): Promise<Page<KnowledgeBase>> {
    const query = params ? { ...params } : undefined;
    const response = await this._client.get<PageResponse<KnowledgeBase>>(
      '/api/knowledge-bases',
      { ...options, query },
    ) as PageResponse<KnowledgeBase>;
    return new Page<KnowledgeBase>(response, {
      client: this._client,
      path: '/api/knowledge-bases',
      query,
      options,
    });
  }

  async get(id: string, options?: RequestOptions): Promise<KnowledgeBase> {
    return this._client.get<KnowledgeBase>(
      `/api/knowledge-bases/${id}`,
      options,
    ) as Promise<KnowledgeBase>;
  }

  async create(params: KnowledgeBaseCreateParams, options?: RequestOptions): Promise<KnowledgeBase> {
    return this._client.post<KnowledgeBase>(
      '/api/knowledge-bases',
      params,
      options,
    ) as Promise<KnowledgeBase>;
  }

  async update(id: string, params: KnowledgeBaseUpdateParams, options?: RequestOptions): Promise<KnowledgeBase> {
    return this._client.put<KnowledgeBase>(
      `/api/knowledge-bases/${id}`,
      params,
      options,
    ) as Promise<KnowledgeBase>;
  }

  async delete(id: string, options?: RequestOptions): Promise<void> {
    await this._client.delete<void>(
      `/api/knowledge-bases/${id}`,
      options,
    );
  }

  async search(id: string, params: KnowledgeBaseSearchParams, options?: RequestOptions): Promise<SearchResult> {
    return this._client.post<SearchResult>(
      `/api/knowledge-bases/${id}/search`,
      params,
      options,
    ) as Promise<SearchResult>;
  }

  async sync(id: string, options?: RequestOptions): Promise<SyncResult> {
    return this._client.post<SyncResult>(
      `/api/knowledge-bases/${id}/sync`,
      undefined,
      options,
    ) as Promise<SyncResult>;
  }

  documents(knowledgeBaseId: string): KnowledgeBaseDocuments {
    return new KnowledgeBaseDocuments(this._client, knowledgeBaseId);
  }

  get withRawResponse(): KnowledgeBasesWithRawResponse {
    return new KnowledgeBasesWithRawResponse(this._client);
  }
}

export class KnowledgeBaseDocuments {
  private _client: APIClient;
  private _basePath: string;

  constructor(client: APIClient, knowledgeBaseId: string) {
    this._client = client;
    this._basePath = `/api/knowledge-bases/${knowledgeBaseId}/documents`;
  }

  async list(params?: KBDocumentListParams, options?: RequestOptions): Promise<Page<KnowledgeBaseDocument>> {
    const query = params ? { ...params } : undefined;
    const response = await this._client.get<PageResponse<KnowledgeBaseDocument>>(
      this._basePath,
      { ...options, query },
    ) as PageResponse<KnowledgeBaseDocument>;
    return new Page<KnowledgeBaseDocument>(response, {
      client: this._client,
      path: this._basePath,
      query,
      options,
    });
  }

  async get(id: string, options?: RequestOptions): Promise<KnowledgeBaseDocument> {
    return this._client.get<KnowledgeBaseDocument>(
      `${this._basePath}/${id}`,
      options,
    ) as Promise<KnowledgeBaseDocument>;
  }

  async create(params: KBDocumentCreateParams, options?: RequestOptions): Promise<KnowledgeBaseDocument> {
    return this._client.post<KnowledgeBaseDocument>(
      this._basePath,
      params,
      options,
    ) as Promise<KnowledgeBaseDocument>;
  }

  async update(id: string, params: KBDocumentUpdateParams, options?: RequestOptions): Promise<KnowledgeBaseDocument> {
    return this._client.put<KnowledgeBaseDocument>(
      `${this._basePath}/${id}`,
      params,
      options,
    ) as Promise<KnowledgeBaseDocument>;
  }

  async delete(id: string, options?: RequestOptions): Promise<void> {
    await this._client.delete<void>(
      `${this._basePath}/${id}`,
      options,
    );
  }

  get withRawResponse(): KnowledgeBaseDocumentsWithRawResponse {
    return new KnowledgeBaseDocumentsWithRawResponse(this);
  }
}

class KnowledgeBasesWithRawResponse {
  private _client: APIClient;

  constructor(client: APIClient) {
    this._client = client;
  }

  async list(params?: KnowledgeBaseListParams, options?: RequestOptions): Promise<RawResponse<PageResponse<KnowledgeBase>>> {
    const query = params ? { ...params } : undefined;
    return this._client.get<PageResponse<KnowledgeBase>>(
      '/api/knowledge-bases',
      { ...options, query, raw: true },
    ) as Promise<RawResponse<PageResponse<KnowledgeBase>>>;
  }

  async get(id: string, options?: RequestOptions): Promise<RawResponse<KnowledgeBase>> {
    return this._client.get<KnowledgeBase>(
      `/api/knowledge-bases/${id}`,
      { ...options, raw: true },
    ) as Promise<RawResponse<KnowledgeBase>>;
  }

  async create(params: KnowledgeBaseCreateParams, options?: RequestOptions): Promise<RawResponse<KnowledgeBase>> {
    return this._client.post<KnowledgeBase>(
      '/api/knowledge-bases',
      params,
      { ...options, raw: true },
    ) as Promise<RawResponse<KnowledgeBase>>;
  }

  async update(id: string, params: KnowledgeBaseUpdateParams, options?: RequestOptions): Promise<RawResponse<KnowledgeBase>> {
    return this._client.put<KnowledgeBase>(
      `/api/knowledge-bases/${id}`,
      params,
      { ...options, raw: true },
    ) as Promise<RawResponse<KnowledgeBase>>;
  }

  async delete(id: string, options?: RequestOptions): Promise<RawResponse<void>> {
    return this._client.delete<void>(
      `/api/knowledge-bases/${id}`,
      { ...options, raw: true },
    ) as Promise<RawResponse<void>>;
  }

  async search(id: string, params: KnowledgeBaseSearchParams, options?: RequestOptions): Promise<RawResponse<SearchResult>> {
    return this._client.post<SearchResult>(
      `/api/knowledge-bases/${id}/search`,
      params,
      { ...options, raw: true },
    ) as Promise<RawResponse<SearchResult>>;
  }

  async sync(id: string, options?: RequestOptions): Promise<RawResponse<SyncResult>> {
    return this._client.post<SyncResult>(
      `/api/knowledge-bases/${id}/sync`,
      undefined,
      { ...options, raw: true },
    ) as Promise<RawResponse<SyncResult>>;
  }
}

class KnowledgeBaseDocumentsWithRawResponse {
  private _resource: KnowledgeBaseDocuments;

  constructor(resource: KnowledgeBaseDocuments) {
    this._resource = resource;
  }

  async list(params?: KBDocumentListParams, options?: RequestOptions): Promise<RawResponse<PageResponse<KnowledgeBaseDocument>>> {
    const query = params ? { ...params } : undefined;
    return this._resource['_client'].get<PageResponse<KnowledgeBaseDocument>>(
      this._resource['_basePath'],
      { ...options, query, raw: true },
    ) as Promise<RawResponse<PageResponse<KnowledgeBaseDocument>>>;
  }

  async get(id: string, options?: RequestOptions): Promise<RawResponse<KnowledgeBaseDocument>> {
    return this._resource['_client'].get<KnowledgeBaseDocument>(
      `${this._resource['_basePath']}/${id}`,
      { ...options, raw: true },
    ) as Promise<RawResponse<KnowledgeBaseDocument>>;
  }

  async create(params: KBDocumentCreateParams, options?: RequestOptions): Promise<RawResponse<KnowledgeBaseDocument>> {
    return this._resource['_client'].post<KnowledgeBaseDocument>(
      this._resource['_basePath'],
      params,
      { ...options, raw: true },
    ) as Promise<RawResponse<KnowledgeBaseDocument>>;
  }

  async update(id: string, params: KBDocumentUpdateParams, options?: RequestOptions): Promise<RawResponse<KnowledgeBaseDocument>> {
    return this._resource['_client'].put<KnowledgeBaseDocument>(
      `${this._resource['_basePath']}/${id}`,
      params,
      { ...options, raw: true },
    ) as Promise<RawResponse<KnowledgeBaseDocument>>;
  }

  async delete(id: string, options?: RequestOptions): Promise<RawResponse<void>> {
    return this._resource['_client'].delete<void>(
      `${this._resource['_basePath']}/${id}`,
      { ...options, raw: true },
    ) as Promise<RawResponse<void>>;
  }
}

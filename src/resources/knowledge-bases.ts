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

/**
 * Parameters for creating a new knowledge base.
 */
export interface KnowledgeBaseCreateParams {
  /** The name of the knowledge base. */
  name: string;
  /** Optional description. */
  description?: string;
  /** Optional schema definition for document structure. */
  schema?: Record<string, unknown>;
}

/**
 * Parameters for updating an existing knowledge base.
 */
export interface KnowledgeBaseUpdateParams {
  /** Updated name. */
  name?: string;
  /** Updated description. */
  description?: string;
  /** Updated schema. */
  schema?: Record<string, unknown>;
  /** Whether the knowledge base is active. */
  isActive?: boolean;
}

/**
 * Parameters for searching a knowledge base.
 */
export interface KnowledgeBaseSearchParams {
  /** The search query text. */
  query: string;
  /** Maximum number of results to return. */
  limit?: number;
}

/**
 * Parameters for listing knowledge bases.
 */
export interface KnowledgeBaseListParams {
  /** Page number (1-based). */
  page?: number;
  /** Maximum items per page. */
  limit?: number;
}

/**
 * Parameters for creating a document in a knowledge base.
 */
export interface KBDocumentCreateParams {
  /** The document content. */
  content: Record<string, unknown>;
  /** Optional metadata to associate with the document. */
  metadata?: Record<string, unknown>;
}

/**
 * Parameters for updating a document in a knowledge base.
 */
export interface KBDocumentUpdateParams {
  /** Updated document content. */
  content?: Record<string, unknown>;
  /** Updated metadata. */
  metadata?: Record<string, unknown>;
}

/**
 * Parameters for listing documents in a knowledge base.
 */
export interface KBDocumentListParams {
  /** Page number (1-based). */
  page?: number;
  /** Maximum items per page. */
  limit?: number;
}

/**
 * Resource for managing knowledge bases and performing semantic search.
 *
 * Access via {@link DocuTray.knowledgeBases}.
 *
 * @example
 * ```ts
 * // List knowledge bases
 * const page = await client.knowledgeBases.list();
 *
 * // Search a knowledge base
 * const results = await client.knowledgeBases.search('kb_abc123', {
 *   query: 'invoice total amount',
 * });
 *
 * // Manage documents
 * const docs = client.knowledgeBases.documents('kb_abc123');
 * const doc = await docs.create({ content: { title: 'Test' } });
 * ```
 */
export class KnowledgeBases extends APIResource {
  /**
   * Lists knowledge bases with optional pagination.
   *
   * @param params - Optional pagination parameters.
   * @param options - Per-request options.
   * @returns A paginated list of knowledge bases.
   */
  async list(params?: KnowledgeBaseListParams, options?: Omit<RequestOptions, 'raw'>): Promise<Page<KnowledgeBase>> {
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

  /**
   * Retrieves a single knowledge base by ID.
   *
   * @param id - The knowledge base identifier.
   * @param options - Per-request options.
   */
  async get(id: string, options?: Omit<RequestOptions, 'raw'>): Promise<KnowledgeBase> {
    return this._client.get<KnowledgeBase>(
      `/api/knowledge-bases/${id}`,
      options,
    ) as Promise<KnowledgeBase>;
  }

  /**
   * Creates a new knowledge base.
   *
   * @param params - Creation parameters.
   * @param options - Per-request options.
   * @returns The created knowledge base.
   */
  async create(params: KnowledgeBaseCreateParams, options?: Omit<RequestOptions, 'raw'>): Promise<KnowledgeBase> {
    return this._client.post<KnowledgeBase>(
      '/api/knowledge-bases',
      params,
      options,
    ) as Promise<KnowledgeBase>;
  }

  /**
   * Updates an existing knowledge base.
   *
   * @param id - The knowledge base identifier.
   * @param params - Fields to update.
   * @param options - Per-request options.
   * @returns The updated knowledge base.
   */
  async update(id: string, params: KnowledgeBaseUpdateParams, options?: Omit<RequestOptions, 'raw'>): Promise<KnowledgeBase> {
    return this._client.put<KnowledgeBase>(
      `/api/knowledge-bases/${id}`,
      params,
      options,
    ) as Promise<KnowledgeBase>;
  }

  /**
   * Deletes a knowledge base.
   *
   * @param id - The knowledge base identifier.
   * @param options - Per-request options.
   */
  async delete(id: string, options?: Omit<RequestOptions, 'raw'>): Promise<void> {
    await this._client.delete<void>(
      `/api/knowledge-bases/${id}`,
      options,
    );
  }

  /**
   * Performs a semantic search across documents in a knowledge base.
   *
   * @param id - The knowledge base identifier.
   * @param params - Search parameters.
   * @param options - Per-request options.
   * @returns Search results with similarity scores.
   */
  async search(id: string, params: KnowledgeBaseSearchParams, options?: Omit<RequestOptions, 'raw'>): Promise<SearchResult> {
    return this._client.post<SearchResult>(
      `/api/knowledge-bases/${id}/search`,
      params,
      options,
    ) as Promise<SearchResult>;
  }

  /**
   * Triggers a sync operation for the knowledge base.
   *
   * @param id - The knowledge base identifier.
   * @param options - Per-request options.
   * @returns The sync operation result.
   */
  async sync(id: string, options?: Omit<RequestOptions, 'raw'>): Promise<SyncResult> {
    return this._client.post<SyncResult>(
      `/api/knowledge-bases/${id}/sync`,
      undefined,
      options,
    ) as Promise<SyncResult>;
  }

  /**
   * Returns a sub-resource for managing documents within a specific knowledge base.
   *
   * @param knowledgeBaseId - The knowledge base identifier.
   * @returns A {@link KnowledgeBaseDocuments} instance scoped to the given knowledge base.
   */
  documents(knowledgeBaseId: string): KnowledgeBaseDocuments {
    return new KnowledgeBaseDocuments(this._client, knowledgeBaseId);
  }

  /**
   * Returns a wrapper that provides raw HTTP responses for all methods.
   */
  get withRawResponse(): KnowledgeBasesWithRawResponse {
    return new KnowledgeBasesWithRawResponse(this._client);
  }
}

/**
 * Sub-resource for managing documents within a specific knowledge base.
 *
 * Obtain via {@link KnowledgeBases.documents}.
 *
 * @example
 * ```ts
 * const docs = client.knowledgeBases.documents('kb_abc123');
 *
 * const doc = await docs.create({
 *   content: { title: 'Invoice #001', amount: 100 },
 *   metadata: { source: 'email' },
 * });
 *
 * const page = await docs.list({ limit: 10 });
 * ```
 */
export class KnowledgeBaseDocuments {
  /** @internal */
  protected _client: APIClient;
  /** @internal */
  protected _basePath: string;

  /** @internal */
  constructor(client: APIClient, knowledgeBaseId: string) {
    this._client = client;
    this._basePath = `/api/knowledge-bases/${knowledgeBaseId}/documents`;
  }

  /**
   * Lists documents with optional pagination.
   *
   * @param params - Optional pagination parameters.
   * @param options - Per-request options.
   * @returns A paginated list of documents.
   */
  async list(params?: KBDocumentListParams, options?: Omit<RequestOptions, 'raw'>): Promise<Page<KnowledgeBaseDocument>> {
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

  /**
   * Retrieves a single document by ID.
   *
   * @param id - The document identifier.
   * @param options - Per-request options.
   */
  async get(id: string, options?: Omit<RequestOptions, 'raw'>): Promise<KnowledgeBaseDocument> {
    return this._client.get<KnowledgeBaseDocument>(
      `${this._basePath}/${id}`,
      options,
    ) as Promise<KnowledgeBaseDocument>;
  }

  /**
   * Creates a new document in the knowledge base.
   *
   * @param params - Document content and optional metadata.
   * @param options - Per-request options.
   * @returns The created document.
   */
  async create(params: KBDocumentCreateParams, options?: Omit<RequestOptions, 'raw'>): Promise<KnowledgeBaseDocument> {
    return this._client.post<KnowledgeBaseDocument>(
      this._basePath,
      params,
      options,
    ) as Promise<KnowledgeBaseDocument>;
  }

  /**
   * Updates an existing document.
   *
   * @param id - The document identifier.
   * @param params - Fields to update.
   * @param options - Per-request options.
   * @returns The updated document.
   */
  async update(id: string, params: KBDocumentUpdateParams, options?: Omit<RequestOptions, 'raw'>): Promise<KnowledgeBaseDocument> {
    return this._client.put<KnowledgeBaseDocument>(
      `${this._basePath}/${id}`,
      params,
      options,
    ) as Promise<KnowledgeBaseDocument>;
  }

  /**
   * Deletes a document from the knowledge base.
   *
   * @param id - The document identifier.
   * @param options - Per-request options.
   */
  async delete(id: string, options?: Omit<RequestOptions, 'raw'>): Promise<void> {
    await this._client.delete<void>(
      `${this._basePath}/${id}`,
      options,
    );
  }

  /**
   * Returns a wrapper that provides raw HTTP responses for all methods.
   */
  get withRawResponse(): KnowledgeBaseDocumentsWithRawResponse {
    return new KnowledgeBaseDocumentsWithRawResponse(this._client, this._basePath);
  }
}

/** @internal */
class KnowledgeBasesWithRawResponse {
  private _client: APIClient;

  constructor(client: APIClient) {
    this._client = client;
  }

  async list(params?: KnowledgeBaseListParams, options?: Omit<RequestOptions, 'raw'>): Promise<RawResponse<PageResponse<KnowledgeBase>>> {
    const query = params ? { ...params } : undefined;
    return this._client.get<PageResponse<KnowledgeBase>>(
      '/api/knowledge-bases',
      { ...options, query, raw: true },
    ) as Promise<RawResponse<PageResponse<KnowledgeBase>>>;
  }

  async get(id: string, options?: Omit<RequestOptions, 'raw'>): Promise<RawResponse<KnowledgeBase>> {
    return this._client.get<KnowledgeBase>(
      `/api/knowledge-bases/${id}`,
      { ...options, raw: true },
    ) as Promise<RawResponse<KnowledgeBase>>;
  }

  async create(params: KnowledgeBaseCreateParams, options?: Omit<RequestOptions, 'raw'>): Promise<RawResponse<KnowledgeBase>> {
    return this._client.post<KnowledgeBase>(
      '/api/knowledge-bases',
      params,
      { ...options, raw: true },
    ) as Promise<RawResponse<KnowledgeBase>>;
  }

  async update(id: string, params: KnowledgeBaseUpdateParams, options?: Omit<RequestOptions, 'raw'>): Promise<RawResponse<KnowledgeBase>> {
    return this._client.put<KnowledgeBase>(
      `/api/knowledge-bases/${id}`,
      params,
      { ...options, raw: true },
    ) as Promise<RawResponse<KnowledgeBase>>;
  }

  async delete(id: string, options?: Omit<RequestOptions, 'raw'>): Promise<RawResponse<void>> {
    return this._client.delete<void>(
      `/api/knowledge-bases/${id}`,
      { ...options, raw: true },
    ) as Promise<RawResponse<void>>;
  }

  async search(id: string, params: KnowledgeBaseSearchParams, options?: Omit<RequestOptions, 'raw'>): Promise<RawResponse<SearchResult>> {
    return this._client.post<SearchResult>(
      `/api/knowledge-bases/${id}/search`,
      params,
      { ...options, raw: true },
    ) as Promise<RawResponse<SearchResult>>;
  }

  async sync(id: string, options?: Omit<RequestOptions, 'raw'>): Promise<RawResponse<SyncResult>> {
    return this._client.post<SyncResult>(
      `/api/knowledge-bases/${id}/sync`,
      undefined,
      { ...options, raw: true },
    ) as Promise<RawResponse<SyncResult>>;
  }
}

/** @internal */
class KnowledgeBaseDocumentsWithRawResponse {
  private _client: APIClient;
  private _basePath: string;

  constructor(client: APIClient, basePath: string) {
    this._client = client;
    this._basePath = basePath;
  }

  async list(params?: KBDocumentListParams, options?: Omit<RequestOptions, 'raw'>): Promise<RawResponse<PageResponse<KnowledgeBaseDocument>>> {
    const query = params ? { ...params } : undefined;
    return this._client.get<PageResponse<KnowledgeBaseDocument>>(
      this._basePath,
      { ...options, query, raw: true },
    ) as Promise<RawResponse<PageResponse<KnowledgeBaseDocument>>>;
  }

  async get(id: string, options?: Omit<RequestOptions, 'raw'>): Promise<RawResponse<KnowledgeBaseDocument>> {
    return this._client.get<KnowledgeBaseDocument>(
      `${this._basePath}/${id}`,
      { ...options, raw: true },
    ) as Promise<RawResponse<KnowledgeBaseDocument>>;
  }

  async create(params: KBDocumentCreateParams, options?: Omit<RequestOptions, 'raw'>): Promise<RawResponse<KnowledgeBaseDocument>> {
    return this._client.post<KnowledgeBaseDocument>(
      this._basePath,
      params,
      { ...options, raw: true },
    ) as Promise<RawResponse<KnowledgeBaseDocument>>;
  }

  async update(id: string, params: KBDocumentUpdateParams, options?: Omit<RequestOptions, 'raw'>): Promise<RawResponse<KnowledgeBaseDocument>> {
    return this._client.put<KnowledgeBaseDocument>(
      `${this._basePath}/${id}`,
      params,
      { ...options, raw: true },
    ) as Promise<RawResponse<KnowledgeBaseDocument>>;
  }

  async delete(id: string, options?: Omit<RequestOptions, 'raw'>): Promise<RawResponse<void>> {
    return this._client.delete<void>(
      `${this._basePath}/${id}`,
      { ...options, raw: true },
    ) as Promise<RawResponse<void>>;
  }
}

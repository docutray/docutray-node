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
  /** Name (1–100 characters: letters, digits, spaces, `-` and `_`). Unique among active knowledge bases. */
  name: string;
  /** Description (1–500 characters). */
  description: string;
  /** JSON Schema describing the content of its documents. */
  schema: Record<string, unknown>;
  /** Indexing preferences used to build embeddings. Defaults to `{}`. */
  indexingPreferences?: Record<string, unknown>;
}

/**
 * Parameters for updating an existing knowledge base.
 */
export interface KnowledgeBaseUpdateParams {
  /** Updated name. */
  name?: string;
  /** Updated description (1–500 characters). */
  description?: string;
  /** Updated schema. */
  schema?: Record<string, unknown>;
  /** Updated indexing preferences. */
  indexingPreferences?: Record<string, unknown>;
  /** Whether the knowledge base is active. `true` restores a deleted knowledge base. */
  isActive?: boolean;
}

/**
 * Parameters for searching a knowledge base.
 */
export interface KnowledgeBaseSearchParams {
  /** The search query text (1–1000 characters). */
  query: string;
  /** Maximum number of results (1–50). Defaults to `10`. */
  limit?: number;
  /** Minimum similarity, between 0 and 1. Defaults to `0.7`. */
  similarityThreshold?: number;
  /** Whether to return each document's metadata. Defaults to `true`. */
  includeMetadata?: boolean;
}

/**
 * Parameters for listing knowledge bases.
 */
export interface KnowledgeBaseListParams {
  /** Page number (1-based). */
  page?: number;
  /** Maximum items per page (1–100). */
  limit?: number;
  /** Case-insensitive match on name or description. */
  search?: string;
  /** `false` lists deleted knowledge bases. Defaults to `true`. */
  isActive?: boolean;
}

/**
 * Parameters for synchronizing a knowledge base's embeddings.
 */
export interface KnowledgeBaseSyncParams {
  /** Regenerate embeddings even for documents that already have one. */
  force?: boolean;
  /** Regenerate every document's embedding. */
  regenerateEmbeddings?: boolean;
}

/**
 * Parameters for creating a document in a knowledge base.
 */
export interface KBDocumentCreateParams {
  /**
   * Your identifier for the document (1–100 characters: letters, digits, `-`
   * and `_`), unique within the knowledge base. Use it with `get`, `update`
   * and `delete`.
   */
  documentId: string;
  /** The document content (at least one field). */
  content: Record<string, unknown>;
  /** Optional metadata to associate with the document. */
  metadata?: Record<string, unknown>;
  /** Whether to generate the embedding now. Defaults to `true`. */
  generateEmbedding?: boolean;
}

/**
 * Parameters for updating a document in a knowledge base.
 */
export interface KBDocumentUpdateParams {
  /** Updated document content. Changing it regenerates the embedding. */
  content?: Record<string, unknown>;
  /** Updated metadata. */
  metadata?: Record<string, unknown>;
  /** Regenerate the embedding even when `content` does not change. */
  regenerateEmbedding?: boolean;
}

/**
 * Parameters for listing documents in a knowledge base.
 */
export interface KBDocumentListParams {
  /** Page number (1-based). */
  page?: number;
  /** Maximum items per page (1–100). */
  limit?: number;
  /** Case-insensitive match on `documentId`. The API currently treats it like `documentId`. */
  search?: string;
  /** Case-insensitive partial match on `documentId`. */
  documentId?: string;
}

/**
 * Body of the single-resource knowledge base endpoints, which wrap the result
 * in a `data` envelope. The regular methods unwrap it; `withRawResponse`
 * returns it as is.
 */
export interface KnowledgeBaseEnvelope<T> {
  data: T;
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
 * const results = await client.knowledgeBases.search(knowledgeBaseId, {
 *   query: 'invoice total amount',
 * });
 *
 * // Manage documents
 * const docs = client.knowledgeBases.documents(knowledgeBaseId);
 * const doc = await docs.create({ documentId: 'invoice-001', content: { title: 'Test' } });
 * ```
 */
export class KnowledgeBases extends APIResource {
  /**
   * Lists knowledge bases with optional pagination and filters.
   *
   * @param params - Optional pagination and filter parameters.
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
   * Retrieves a single active knowledge base by ID.
   *
   * @param id - The knowledge base identifier.
   * @param options - Per-request options.
   * @returns The knowledge base, including its document count.
   */
  async get(id: string, options?: Omit<RequestOptions, 'raw'>): Promise<KnowledgeBase> {
    const response = await this._client.get<KnowledgeBaseEnvelope<KnowledgeBase>>(
      `/api/knowledge-bases/${encodeURIComponent(id)}`,
      options,
    ) as KnowledgeBaseEnvelope<KnowledgeBase>;
    return response.data;
  }

  /**
   * Creates a new knowledge base.
   *
   * @param params - Creation parameters.
   * @param options - Per-request options.
   * @returns The created knowledge base.
   */
  async create(params: KnowledgeBaseCreateParams, options?: Omit<RequestOptions, 'raw'>): Promise<KnowledgeBase> {
    const response = await this._client.post<KnowledgeBaseEnvelope<KnowledgeBase>>(
      '/api/knowledge-bases',
      params,
      options,
    ) as KnowledgeBaseEnvelope<KnowledgeBase>;
    return response.data;
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
    const response = await this._client.put<KnowledgeBaseEnvelope<KnowledgeBase>>(
      `/api/knowledge-bases/${encodeURIComponent(id)}`,
      params,
      options,
    ) as KnowledgeBaseEnvelope<KnowledgeBase>;
    return response.data;
  }

  /**
   * Deletes a knowledge base. The deletion is soft: `update(id, { isActive: true })` restores it.
   *
   * @param id - The knowledge base identifier.
   * @param options - Per-request options.
   */
  async delete(id: string, options?: Omit<RequestOptions, 'raw'>): Promise<void> {
    await this._client.delete<void>(
      `/api/knowledge-bases/${encodeURIComponent(id)}`,
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
      `/api/knowledge-bases/${encodeURIComponent(id)}/search`,
      params,
      options,
    ) as Promise<SearchResult>;
  }

  /**
   * Regenerates the embeddings of the knowledge base's documents. The call
   * waits until the sync finishes.
   *
   * @param id - The knowledge base identifier.
   * @param params - Optional sync parameters.
   * @param options - Per-request options.
   * @returns The sync operation result.
   */
  async sync(id: string, params?: KnowledgeBaseSyncParams, options?: Omit<RequestOptions, 'raw'>): Promise<SyncResult> {
    const response = await this._client.post<KnowledgeBaseEnvelope<SyncResult>>(
      `/api/knowledge-bases/${encodeURIComponent(id)}/sync`,
      params ?? {},
      options,
    ) as KnowledgeBaseEnvelope<SyncResult>;
    return response.data;
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
 * Obtain via {@link KnowledgeBases.documents}. Documents are addressed by
 * their `documentId` (your identifier), not by their internal `id`.
 *
 * @example
 * ```ts
 * const docs = client.knowledgeBases.documents(knowledgeBaseId);
 *
 * const doc = await docs.create({
 *   documentId: 'invoice-001',
 *   content: { title: 'Invoice #001', amount: 100 },
 *   metadata: { source: 'email' },
 * });
 *
 * const same = await docs.get('invoice-001');
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
    this._basePath = `/api/knowledge-bases/${encodeURIComponent(knowledgeBaseId)}/documents`;
  }

  /**
   * Lists documents with optional pagination and filters.
   *
   * @param params - Optional pagination and filter parameters.
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
   * Retrieves a single document.
   *
   * @param documentId - Your identifier for the document (its `documentId`, not its internal `id`).
   * @param options - Per-request options.
   */
  async get(documentId: string, options?: Omit<RequestOptions, 'raw'>): Promise<KnowledgeBaseDocument> {
    const response = await this._client.get<KnowledgeBaseEnvelope<KnowledgeBaseDocument>>(
      `${this._basePath}/${encodeURIComponent(documentId)}`,
      options,
    ) as KnowledgeBaseEnvelope<KnowledgeBaseDocument>;
    return response.data;
  }

  /**
   * Creates a new document in the knowledge base.
   *
   * @param params - Document identifier, content and optional metadata.
   * @param options - Per-request options.
   * @returns The created document.
   */
  async create(params: KBDocumentCreateParams, options?: Omit<RequestOptions, 'raw'>): Promise<KnowledgeBaseDocument> {
    const response = await this._client.post<KnowledgeBaseEnvelope<KnowledgeBaseDocument>>(
      this._basePath,
      params,
      options,
    ) as KnowledgeBaseEnvelope<KnowledgeBaseDocument>;
    return response.data;
  }

  /**
   * Updates an existing document.
   *
   * @param documentId - Your identifier for the document (its `documentId`, not its internal `id`).
   * @param params - Fields to update.
   * @param options - Per-request options.
   * @returns The updated document.
   */
  async update(documentId: string, params: KBDocumentUpdateParams, options?: Omit<RequestOptions, 'raw'>): Promise<KnowledgeBaseDocument> {
    const response = await this._client.put<KnowledgeBaseEnvelope<KnowledgeBaseDocument>>(
      `${this._basePath}/${encodeURIComponent(documentId)}`,
      params,
      options,
    ) as KnowledgeBaseEnvelope<KnowledgeBaseDocument>;
    return response.data;
  }

  /**
   * Deletes a document.
   *
   * @param documentId - Your identifier for the document (its `documentId`, not its internal `id`).
   * @param options - Per-request options.
   */
  async delete(documentId: string, options?: Omit<RequestOptions, 'raw'>): Promise<void> {
    await this._client.delete<void>(
      `${this._basePath}/${encodeURIComponent(documentId)}`,
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

  async get(id: string, options?: Omit<RequestOptions, 'raw'>): Promise<RawResponse<KnowledgeBaseEnvelope<KnowledgeBase>>> {
    return this._client.get<KnowledgeBaseEnvelope<KnowledgeBase>>(
      `/api/knowledge-bases/${encodeURIComponent(id)}`,
      { ...options, raw: true },
    ) as Promise<RawResponse<KnowledgeBaseEnvelope<KnowledgeBase>>>;
  }

  async create(params: KnowledgeBaseCreateParams, options?: Omit<RequestOptions, 'raw'>): Promise<RawResponse<KnowledgeBaseEnvelope<KnowledgeBase>>> {
    return this._client.post<KnowledgeBaseEnvelope<KnowledgeBase>>(
      '/api/knowledge-bases',
      params,
      { ...options, raw: true },
    ) as Promise<RawResponse<KnowledgeBaseEnvelope<KnowledgeBase>>>;
  }

  async update(id: string, params: KnowledgeBaseUpdateParams, options?: Omit<RequestOptions, 'raw'>): Promise<RawResponse<KnowledgeBaseEnvelope<KnowledgeBase>>> {
    return this._client.put<KnowledgeBaseEnvelope<KnowledgeBase>>(
      `/api/knowledge-bases/${encodeURIComponent(id)}`,
      params,
      { ...options, raw: true },
    ) as Promise<RawResponse<KnowledgeBaseEnvelope<KnowledgeBase>>>;
  }

  async delete(id: string, options?: Omit<RequestOptions, 'raw'>): Promise<RawResponse<void>> {
    return this._client.delete<void>(
      `/api/knowledge-bases/${encodeURIComponent(id)}`,
      { ...options, raw: true },
    ) as Promise<RawResponse<void>>;
  }

  async search(id: string, params: KnowledgeBaseSearchParams, options?: Omit<RequestOptions, 'raw'>): Promise<RawResponse<SearchResult>> {
    return this._client.post<SearchResult>(
      `/api/knowledge-bases/${encodeURIComponent(id)}/search`,
      params,
      { ...options, raw: true },
    ) as Promise<RawResponse<SearchResult>>;
  }

  async sync(id: string, params?: KnowledgeBaseSyncParams, options?: Omit<RequestOptions, 'raw'>): Promise<RawResponse<KnowledgeBaseEnvelope<SyncResult>>> {
    return this._client.post<KnowledgeBaseEnvelope<SyncResult>>(
      `/api/knowledge-bases/${encodeURIComponent(id)}/sync`,
      params ?? {},
      { ...options, raw: true },
    ) as Promise<RawResponse<KnowledgeBaseEnvelope<SyncResult>>>;
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

  async get(documentId: string, options?: Omit<RequestOptions, 'raw'>): Promise<RawResponse<KnowledgeBaseEnvelope<KnowledgeBaseDocument>>> {
    return this._client.get<KnowledgeBaseEnvelope<KnowledgeBaseDocument>>(
      `${this._basePath}/${encodeURIComponent(documentId)}`,
      { ...options, raw: true },
    ) as Promise<RawResponse<KnowledgeBaseEnvelope<KnowledgeBaseDocument>>>;
  }

  async create(params: KBDocumentCreateParams, options?: Omit<RequestOptions, 'raw'>): Promise<RawResponse<KnowledgeBaseEnvelope<KnowledgeBaseDocument>>> {
    return this._client.post<KnowledgeBaseEnvelope<KnowledgeBaseDocument>>(
      this._basePath,
      params,
      { ...options, raw: true },
    ) as Promise<RawResponse<KnowledgeBaseEnvelope<KnowledgeBaseDocument>>>;
  }

  async update(documentId: string, params: KBDocumentUpdateParams, options?: Omit<RequestOptions, 'raw'>): Promise<RawResponse<KnowledgeBaseEnvelope<KnowledgeBaseDocument>>> {
    return this._client.put<KnowledgeBaseEnvelope<KnowledgeBaseDocument>>(
      `${this._basePath}/${encodeURIComponent(documentId)}`,
      params,
      { ...options, raw: true },
    ) as Promise<RawResponse<KnowledgeBaseEnvelope<KnowledgeBaseDocument>>>;
  }

  async delete(documentId: string, options?: Omit<RequestOptions, 'raw'>): Promise<RawResponse<void>> {
    return this._client.delete<void>(
      `${this._basePath}/${encodeURIComponent(documentId)}`,
      { ...options, raw: true },
    ) as Promise<RawResponse<void>>;
  }
}

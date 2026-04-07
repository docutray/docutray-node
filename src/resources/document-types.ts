import { APIResource } from '../resource.js';
import type { APIClient } from '../core/api-client.js';
import { Page } from '../core/pagination.js';
import type { PageResponse } from '../core/pagination.js';
import type { DocumentType, DocumentTypeCreateParams, DocumentTypeUpdateParams, DocumentTypesListParams, ValidationResult } from '../types/document-type.js';
import type { RequestOptions } from '../core/types.js';
import type { RawResponse } from '../core/raw-response.js';

/**
 * Resource for listing and inspecting document type definitions.
 *
 * Access via {@link DocuTray.documentTypes}.
 *
 * @example
 * ```ts
 * // List all document types
 * const page = await client.documentTypes.list();
 * for (const dt of page.data) {
 *   console.log(dt.name, dt.codeType);
 * }
 *
 * // Get a specific document type
 * const dt = await client.documentTypes.get('dt_abc123');
 * ```
 */
export class DocumentTypes extends APIResource {
  /**
   * Lists document types with optional pagination and search.
   *
   * @param params - Optional pagination and search parameters.
   * @param options - Per-request options.
   * @returns A paginated list of document types.
   */
  async list(params?: DocumentTypesListParams, options?: Omit<RequestOptions, 'raw'>): Promise<Page<DocumentType>> {
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

  /**
   * Retrieves a single document type by ID.
   *
   * @param id - The document type identifier.
   * @param options - Per-request options.
   * @returns The document type definition.
   */
  async get(id: string, options?: Omit<RequestOptions, 'raw'>): Promise<DocumentType> {
    return this._client.get<DocumentType>(
      `/api/document-types/${id}`,
      options,
    ) as Promise<DocumentType>;
  }

  /**
   * Creates a new document type.
   *
   * @param params - Creation parameters including name, codeType, description, and jsonSchema.
   * @param options - Per-request options.
   * @returns The created document type.
   */
  async create(params: DocumentTypeCreateParams, options?: Omit<RequestOptions, 'raw'>): Promise<DocumentType> {
    const response = await this._client.post<{ data: DocumentType }>(
      '/api/document-types',
      params,
      options,
    ) as { data: DocumentType };
    return response.data;
  }

  /**
   * Updates an existing document type.
   *
   * Note: `codeType` cannot be changed after creation.
   *
   * @param id - The document type identifier.
   * @param params - Fields to update.
   * @param options - Per-request options.
   * @returns The updated document type.
   */
  async update(id: string, params: DocumentTypeUpdateParams, options?: Omit<RequestOptions, 'raw'>): Promise<DocumentType> {
    const response = await this._client.put<{ data: DocumentType }>(
      `/api/document-types/${id}`,
      params,
      options,
    ) as { data: DocumentType };
    return response.data;
  }

  /**
   * Validates a document type schema.
   *
   * @param id - The document type identifier.
   * @param options - Per-request options.
   * @returns The validation result with errors and warnings.
   */
  async validate(id: string, options?: Omit<RequestOptions, 'raw'>): Promise<ValidationResult> {
    return this._client.post<ValidationResult>(
      `/api/document-types/${id}/validate`,
      undefined,
      options,
    ) as Promise<ValidationResult>;
  }

  /**
   * Returns a wrapper that provides raw HTTP responses for all methods.
   */
  get withRawResponse(): DocumentTypesWithRawResponse {
    return new DocumentTypesWithRawResponse(this._client);
  }
}

/** @internal */
class DocumentTypesWithRawResponse {
  private _client: APIClient;

  constructor(client: APIClient) {
    this._client = client;
  }

  async list(params?: DocumentTypesListParams, options?: Omit<RequestOptions, 'raw'>): Promise<RawResponse<PageResponse<DocumentType>>> {
    const query = params ? { ...params } : undefined;
    return this._client.get<PageResponse<DocumentType>>(
      '/api/document-types',
      { ...options, query, raw: true },
    ) as Promise<RawResponse<PageResponse<DocumentType>>>;
  }

  async get(id: string, options?: Omit<RequestOptions, 'raw'>): Promise<RawResponse<DocumentType>> {
    return this._client.get<DocumentType>(
      `/api/document-types/${id}`,
      { ...options, raw: true },
    ) as Promise<RawResponse<DocumentType>>;
  }

  async create(params: DocumentTypeCreateParams, options?: Omit<RequestOptions, 'raw'>): Promise<RawResponse<{ data: DocumentType }>> {
    return this._client.post<{ data: DocumentType }>(
      '/api/document-types',
      params,
      { ...options, raw: true },
    ) as Promise<RawResponse<{ data: DocumentType }>>;
  }

  async update(id: string, params: DocumentTypeUpdateParams, options?: Omit<RequestOptions, 'raw'>): Promise<RawResponse<{ data: DocumentType }>> {
    return this._client.put<{ data: DocumentType }>(
      `/api/document-types/${id}`,
      params,
      { ...options, raw: true },
    ) as Promise<RawResponse<{ data: DocumentType }>>;
  }

  async validate(id: string, options?: Omit<RequestOptions, 'raw'>): Promise<RawResponse<ValidationResult>> {
    return this._client.post<ValidationResult>(
      `/api/document-types/${id}/validate`,
      undefined,
      { ...options, raw: true },
    ) as Promise<RawResponse<ValidationResult>>;
  }
}

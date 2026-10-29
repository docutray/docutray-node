import { APIResource } from '../resource.js';
import type { APIClient } from '../core/api-client.js';
import { DocuTrayError } from '../core/error.js';
import { Page } from '../core/pagination.js';
import type { PageResponse } from '../core/pagination.js';
import type { DocumentType, DocumentTypeCreateParams, DocumentTypeUpdateParams, DocumentTypeValidateParams, DocumentTypesListParams, ValidationResult } from '../types/document-type.js';
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
 * // Get a specific document type by its internal id (not its codeType)
 * const dt = await client.documentTypes.get(page.data[0].id);
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
   * @param id - The document type's internal id (a cuid), not its `codeType`. Resolve a code with {@link DocumentTypes.list} first; passing a code returns a `NotFoundError`.
   * @param options - Per-request options.
   * @returns The document type definition.
   */
  async get(id: string, options?: Omit<RequestOptions, 'raw'>): Promise<DocumentType> {
    const response = await this._client.get<{ data: DocumentType }>(
      `/api/document-types/${id}`,
      options,
    ) as { data: DocumentType };
    return response.data;
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
   * @param id - The document type's internal id (a cuid), not its `codeType`. Resolve a code with {@link DocumentTypes.list} first; passing a code returns a `NotFoundError`.
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
   * Validates a document's data against a document type, without running OCR
   * or changing the document type.
   *
   * Runs the type's JSON Schema and DSL rules. Pass `dslRules` to test
   * temporary rules instead of the stored ones (dry-run); `null` or `''` tests
   * without DSL rules. The call succeeds even when the data has errors:
   * inspect `valid` (or {@link isValidationValid}).
   *
   * Without `dslRules`, `data` is sent as the whole request body. An object
   * with both `data` and `dslRules` at its root is reserved by the API for
   * dry-run requests, so validate such a document by passing `dslRules`.
   *
   * @param id - The document type's internal id (a cuid), not its `codeType`. Resolve a code with {@link DocumentTypes.list} first; passing a code returns a `NotFoundError`.
   * @param data - The document data to validate (e.g. the `data` of a conversion).
   * @param params - Optional temporary DSL rules.
   * @param options - Per-request options.
   * @returns The validation result with `valid`, `issues` and the error/warning summaries.
   * @throws {DocuTrayError} When `data` is `undefined`, before any request is sent.
   * @throws {DSLValidationError} When `dslRules` fails to compile.
   *
   * @example
   * ```ts
   * const result = await client.documentTypes.validate(documentTypeId, extracted, {
   *   dslRules: 'field.total greaterThan 0',
   * });
   * if (!result.valid) {
   *   for (const issue of result.issues ?? []) console.log(issue.field, issue.message);
   * }
   * ```
   */
  async validate(
    id: string,
    data: unknown,
    params?: DocumentTypeValidateParams,
    options?: Omit<RequestOptions, 'raw'>,
  ): Promise<ValidationResult> {
    return this._client.post<ValidationResult>(
      `/api/document-types/${id}/validate`,
      validateBody(data, params),
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

  async create(params: DocumentTypeCreateParams, options?: Omit<RequestOptions, 'raw'>): Promise<RawResponse<DocumentType>> {
    return this._client.post<DocumentType>(
      '/api/document-types',
      params,
      { ...options, raw: true },
    ) as Promise<RawResponse<DocumentType>>;
  }

  async update(id: string, params: DocumentTypeUpdateParams, options?: Omit<RequestOptions, 'raw'>): Promise<RawResponse<DocumentType>> {
    return this._client.put<DocumentType>(
      `/api/document-types/${id}`,
      params,
      { ...options, raw: true },
    ) as Promise<RawResponse<DocumentType>>;
  }

  async validate(
    id: string,
    data: unknown,
    params?: DocumentTypeValidateParams,
    options?: Omit<RequestOptions, 'raw'>,
  ): Promise<RawResponse<ValidationResult>> {
    return this._client.post<ValidationResult>(
      `/api/document-types/${id}/validate`,
      validateBody(data, params),
      { ...options, raw: true },
    ) as Promise<RawResponse<ValidationResult>>;
  }
}

/**
 * Builds the validate request body: the `{ data, dslRules }` dry-run envelope
 * when `dslRules` is given (including `null`), otherwise the data itself.
 *
 * `undefined` data is rejected: JSON serialization would drop it, sending no
 * body or a `{ dslRules }` document that the API validates as data.
 *
 * @internal
 */
function validateBody(data: unknown, params?: DocumentTypeValidateParams): unknown {
  if (data === undefined) {
    throw new DocuTrayError('Must provide data to validate');
  }
  return params?.dslRules !== undefined ? { data, dslRules: params.dslRules } : data;
}

import { APIClient } from './core/api-client.js';
import { DocuTrayError } from './core/error.js';
import type { ClientOptions } from './core/types.js';
import { readEnv } from './lib/utils.js';
import { Convert } from './resources/convert.js';
import { Identify } from './resources/identify.js';
import { DocumentTypes } from './resources/document-types.js';
import { Steps } from './resources/steps.js';
import { KnowledgeBases } from './resources/knowledge-bases.js';

/**
 * DocuTray API client for document processing operations.
 *
 * Provides access to OCR conversion, document identification, document types,
 * processing steps, and knowledge bases through resource properties.
 *
 * @example
 * ```ts
 * import DocuTray from 'docutray';
 *
 * const client = new DocuTray(); // uses DOCUTRAY_API_KEY env var
 *
 * const result = await client.convert.run({
 *   documentTypeCode: 'invoice',
 *   url: 'https://example.com/invoice.pdf',
 * });
 * ```
 */
export class DocuTray {
  /** Resource for converting documents to structured data. */
  readonly convert: Convert;
  /** Resource for identifying document types from images. */
  readonly identify: Identify;
  /** Resource for listing and inspecting document type definitions. */
  readonly documentTypes: DocumentTypes;
  /** Resource for running predefined processing steps. */
  readonly steps: Steps;
  /** Resource for managing knowledge bases and their documents. */
  readonly knowledgeBases: KnowledgeBases;

  /** @internal */
  private readonly _client: APIClient;

  /**
   * Creates a new DocuTray client instance.
   *
   * The API key is resolved in order: `options.apiKey` then the `DOCUTRAY_API_KEY` environment variable.
   *
   * @param options - Client configuration options.
   * @throws {@link DocuTrayError} if no API key is found.
   *
   * @example
   * ```ts
   * // Using environment variable
   * const client = new DocuTray();
   *
   * // Explicit API key
   * const client = new DocuTray({ apiKey: 'dt_my-api-key' });
   * ```
   */
  constructor(options: Partial<ClientOptions> = {}) {
    const apiKey = options.apiKey ?? readEnv('DOCUTRAY_API_KEY');
    if (!apiKey) {
      throw new DocuTrayError(
        'The DOCUTRAY_API_KEY environment variable is missing or empty; either provide it, or instantiate the DocuTray client with an apiKey option, like new DocuTray({ apiKey: "My API Key" }).',
      );
    }

    this._client = new APIClient({ ...options, apiKey });

    this.convert = new Convert(this._client);
    this.identify = new Identify(this._client);
    this.documentTypes = new DocumentTypes(this._client);
    this.steps = new Steps(this._client);
    this.knowledgeBases = new KnowledgeBases(this._client);
  }
}

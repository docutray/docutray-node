import { APIClient } from './core/api-client.js';
import { DocuTrayError } from './core/error.js';
import type { ClientOptions } from './core/types.js';
import { readEnv } from './lib/utils.js';
import { Convert } from './resources/convert.js';
import { Identify } from './resources/identify.js';
import { DocumentTypes } from './resources/document-types.js';
import { Steps } from './resources/steps.js';
import { KnowledgeBases } from './resources/knowledge-bases.js';

export class DocuTray {
  readonly convert: Convert;
  readonly identify: Identify;
  readonly documentTypes: DocumentTypes;
  readonly steps: Steps;
  readonly knowledgeBases: KnowledgeBases;

  private readonly _client: APIClient;

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

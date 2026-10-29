/**
 * A knowledge base: a collection of documents with semantic search.
 */
export interface KnowledgeBase {
  /** Unique identifier. */
  id: string;
  /** Organization that owns the knowledge base. */
  organizationId: string;
  /** Name, unique among the organization's active knowledge bases. */
  name: string;
  /** Description of the knowledge base. */
  description: string;
  /** JSON Schema describing the content of its documents. */
  schema: Record<string, unknown>;
  /** Indexing preferences used to build embeddings. */
  indexingPreferences: Record<string, unknown>;
  /** Fields of the content used for indexing. */
  indexingFields: string[];
  /** `false` once the knowledge base has been deleted (soft delete). */
  isActive: boolean;
  /** ISO 8601 creation timestamp. */
  createdAt: string;
  /** ISO 8601 last-updated timestamp. */
  updatedAt: string;
  /** Document count. Present on `list()` and `get()`, absent on `create()` and `update()`. */
  _count?: { documents: number };
}

/**
 * Embedding generation status of a knowledge base document.
 */
export type EmbeddingStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'ERROR';

/**
 * A document stored in a knowledge base.
 */
export interface KnowledgeBaseDocument {
  /** Internal identifier (cuid). */
  id: string;
  /** Knowledge base the document belongs to. */
  knowledgeBaseId: string;
  /**
   * Your identifier for the document, unique within the knowledge base. The
   * document methods (`get`, `update`, `delete`) take this value, not `id`.
   */
  documentId: string;
  /** The document content. */
  content: Record<string, unknown>;
  /** Metadata attached to the document. */
  metadata: Record<string, unknown>;
  /** Embedding status. Absent from `documents.list()` results. */
  embeddingStatus?: EmbeddingStatus;
  /** ISO 8601 creation timestamp. */
  createdAt: string;
  /** ISO 8601 last-updated timestamp. */
  updatedAt: string;
  /**
   * Returned by `documents.get()` and `documents.update()`. Currently always
   * `false` because of a known API limitation; do not rely on it to know
   * whether the embedding exists.
   */
  hasEmbedding?: boolean;
}

/**
 * A single semantic search match.
 */
export interface SearchResultItem {
  /** The matching document. `metadata` is `{}` when `includeMetadata` is `false`. */
  document: KnowledgeBaseDocument;
  /** Similarity score between 0 and 1, rounded to 4 decimals. */
  similarity: number;
}

/**
 * Result of a semantic search in a knowledge base.
 */
export interface SearchResult {
  /** Matches ordered by similarity. Only documents with an embedding are searched. */
  data: SearchResultItem[];
  /** The query that was searched. */
  query: string;
  /** Number of matches returned. */
  resultsCount: number;
}

/**
 * Result of synchronizing a knowledge base's embeddings.
 */
export interface SyncResult {
  /** Identifier of this sync run. */
  syncId: string;
  /** Outcome of the sync. */
  status: 'completed' | 'failed';
  /** Number of documents processed. */
  documentsProcessed: number;
  /** Number of embeddings generated. */
  embeddingsGenerated: number;
  /** Errors found while processing documents. */
  errors: string[];
  /** ISO 8601 start timestamp. */
  startedAt: string;
  /** ISO 8601 end timestamp. */
  completedAt?: string;
}

/**
 * A knowledge base definition from the API.
 */
export interface KnowledgeBase {
  /** Unique identifier. */
  id: string;
  /** Human-readable name. */
  name: string;
  /** Optional description. */
  description: string | null;
  /** The knowledge base schema definition. */
  schema: Record<string, unknown> | null;
  /** Whether the knowledge base is currently active. */
  isActive: boolean;
  /** ISO 8601 creation timestamp. */
  createdAt: string | null;
  /** ISO 8601 last-updated timestamp. */
  updatedAt: string | null;
  /** Number of documents in the knowledge base. */
  documentCount: number | null;
}

/**
 * A document stored in a knowledge base.
 */
export interface KnowledgeBaseDocument {
  /** Unique identifier. */
  id: string;
  /** External document identifier. */
  documentId: string | null;
  /** The document content. */
  content: Record<string, unknown>;
  /** Additional metadata about the document. */
  metadata: Record<string, unknown> | null;
  /** ISO 8601 creation timestamp. */
  createdAt: string | null;
  /** ISO 8601 last-updated timestamp. */
  updatedAt: string | null;
}

/**
 * A single search result item with similarity score.
 */
export interface SearchResultItem {
  /** The matched document. */
  document: KnowledgeBaseDocument;
  /** Similarity score between 0 and 1 (higher is more similar). */
  similarity: number;
}

/**
 * Search results from a knowledge base query.
 */
export interface SearchResult {
  /** The matching documents with similarity scores. */
  data: SearchResultItem[];
  /** The original search query. */
  query: string | null;
  /** Total number of results returned. */
  resultsCount: number;
}

/**
 * Result of a knowledge base sync operation.
 */
export interface SyncResult {
  /** Unique identifier for the sync operation. */
  syncId: string | null;
  /** Current status of the sync. */
  status: string;
  /** Number of documents processed during sync. */
  documentsProcessed: number | null;
  /** Any errors encountered during sync. */
  errors: string[] | null;
  /** ISO 8601 timestamp when the sync started. */
  startedAt: string | null;
  /** ISO 8601 timestamp when the sync completed. */
  completedAt: string | null;
}

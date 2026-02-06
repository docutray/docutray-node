/**
 * A knowledge base definition from the API.
 */
export interface KnowledgeBase {
  id: string;
  name: string;
  description: string | null;
  schema: Record<string, unknown> | null;
  isActive: boolean;
  createdAt: string | null;
  updatedAt: string | null;
  documentCount: number | null;
}

/**
 * A document stored in a knowledge base.
 */
export interface KnowledgeBaseDocument {
  id: string;
  documentId: string | null;
  content: Record<string, unknown>;
  metadata: Record<string, unknown> | null;
  createdAt: string | null;
  updatedAt: string | null;
}

/**
 * A single search result item with similarity score.
 */
export interface SearchResultItem {
  document: KnowledgeBaseDocument;
  similarity: number;
}

/**
 * Search results from a knowledge base query.
 */
export interface SearchResult {
  data: SearchResultItem[];
  query: string | null;
  resultsCount: number;
}

/**
 * Result of a knowledge base sync operation.
 */
export interface SyncResult {
  syncId: string | null;
  status: string;
  documentsProcessed: number | null;
  errors: string[] | null;
  startedAt: string | null;
  completedAt: string | null;
}

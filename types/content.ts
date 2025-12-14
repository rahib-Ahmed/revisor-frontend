export type ContentType = 'text' | 'audio' | 'pdf' | 'video';
export type ContentStatus =
  | 'pending'
  | 'uploading'
  | 'processing'
  | 'transcribing'
  | 'extracting'
  | 'text_extracted'
  | 'parsing'
  | 'parsed'
  | 'indexing'
  | 'ready'
  | 'failed';

export interface Topic {
  title: string;
  relevanceScore: number;
}

export interface VocabularyItem {
  term: string;
  context: string;
  definition?: string;
}

export interface GrammarPoint {
  concept: string;
  explanation: string;
  examples: string[];
}

export interface ContentItem {
  id: string;
  userId: string;
  contentType: ContentType;
  status: ContentStatus;
  originalFilename: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  title: string | null;
  rawText?: string;
  language?: string;
  topics?: Topic[];
  vocabulary?: VocabularyItem[];
  grammarPoints?: GrammarPoint[];
  chunkCount?: number;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContentRequest {
  contentType: ContentType;
  originalFilename: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
}

export interface ContentListResponse {
  items: ContentItem[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Transform snake_case API response to camelCase for TypeScript
 */
export function transformContentItem(data: Record<string, unknown>): ContentItem {
  // Parse JSON fields if they're strings
  const parseJsonField = <T>(field: unknown): T | undefined => {
    if (!field) return undefined;
    if (typeof field === 'string') {
      try {
        return JSON.parse(field) as T;
      } catch {
        return undefined;
      }
    }
    return field as T;
  };

  // Transform topics from snake_case
  const rawTopics = parseJsonField<Array<{ title: string; relevance_score: number }>>(data.topics);
  const topics = rawTopics?.map((t) => ({
    title: t.title,
    relevanceScore: t.relevance_score,
  }));

  // Transform grammar points from snake_case
  const rawGrammar = parseJsonField<GrammarPoint[]>(data.grammar_points);

  return {
    id: data.id as string,
    userId: data.user_id as string,
    contentType: data.content_type as ContentType,
    status: data.status as ContentStatus,
    originalFilename: data.original_filename as string,
    filePath: data.file_path as string,
    fileSize: data.file_size as number,
    mimeType: data.mime_type as string,
    title: data.title as string | null,
    rawText: data.raw_text as string | undefined,
    language: data.language as string | undefined,
    topics,
    vocabulary: parseJsonField<VocabularyItem[]>(data.vocabulary),
    grammarPoints: rawGrammar,
    chunkCount: data.chunk_count as number | undefined,
    errorMessage: data.error_message as string | null,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
  };
}

/**
 * Transform camelCase request to snake_case for API
 */
export function transformContentRequest(data: CreateContentRequest): Record<string, unknown> {
  return {
    content_type: data.contentType,
    original_filename: data.originalFilename,
    file_path: data.filePath,
    file_size: data.fileSize,
    mime_type: data.mimeType,
  };
}

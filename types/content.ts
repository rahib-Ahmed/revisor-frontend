export type ContentType = 'text' | 'audio' | 'pdf' | 'video';
export type ContentStatus =
  | 'uploading'
  | 'processing'
  | 'text_extracted'
  | 'parsing'
  | 'indexing'
  | 'ready'
  | 'failed';

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

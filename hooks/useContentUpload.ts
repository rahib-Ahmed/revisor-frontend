'use client';

import { useCallback, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { createClient } from '@/lib/supabase/client';
import type { ContentType, CreateContentRequest } from '@/types/content';
import { transformContentRequest } from '@/types/content';

export type UploadStatus = 'queued' | 'uploading' | 'processing' | 'complete' | 'error' | 'cancelled';

export interface UploadItem {
  id: string;
  file: File;
  progress: number;
  status: UploadStatus;
  error?: string;
  contentId?: string;
}

interface AbortControllerMap {
  [uploadId: string]: AbortController;
}

/**
 * Get content type from MIME type.
 * Throws error for unsupported types instead of silently defaulting.
 */
function getContentType(mimeType: string): ContentType {
  if (mimeType.startsWith('text/') || mimeType === 'text/markdown') return 'text';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType.startsWith('video/')) return 'video';

  throw new Error(`Unsupported file type: ${mimeType}`);
}

export function useContentUpload() {
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();
  const supabase = createClient();
  const abortControllersRef = useRef<AbortControllerMap>({});

  /**
   * Queue a file for upload (doesn't upload immediately)
   */
  const queueFile = useCallback((file: File) => {
    // Validate content type before queueing
    try {
      getContentType(file.type);
    } catch {
      // Still add to queue but mark as error immediately
      const uploadId = uuidv4();
      setUploads((prev) => [
        ...prev,
        {
          id: uploadId,
          file,
          progress: 0,
          status: 'error',
          error: `Unsupported file type: ${file.type || 'unknown'}`,
        },
      ]);
      return;
    }

    const uploadId = uuidv4();
    const contentId = uuidv4();

    setUploads((prev) => [
      ...prev,
      {
        id: uploadId,
        file,
        progress: 0,
        status: 'queued',
        contentId,
      },
    ]);
  }, []);

  /**
   * Remove a queued file (before upload starts)
   */
  const removeFromQueue = useCallback((uploadId: string) => {
    setUploads((prev) => prev.filter((u) => u.id !== uploadId));
  }, []);

  /**
   * Upload a single file with abort support
   */
  const uploadSingleFile = useCallback(
    async (upload: UploadItem, session: { user: { id: string }; access_token: string }) => {
      const { id: uploadId, file, contentId } = upload;

      // Create AbortController for this upload
      const abortController = new AbortController();
      abortControllersRef.current[uploadId] = abortController;

      // Track progress interval for cleanup
      let progressInterval: NodeJS.Timeout | null = null;

      try {
        // Mark as uploading
        setUploads((prev) =>
          prev.map((u) => (u.id === uploadId ? { ...u, status: 'uploading' as UploadStatus } : u))
        );

        const userId = session.user.id;
        const filePath = `${userId}/${contentId}/${file.name}`;

        // Simulate progress updates
        progressInterval = setInterval(() => {
          setUploads((prev) =>
            prev.map((u) =>
              u.id === uploadId && u.status === 'uploading' && u.progress < 90
                ? { ...u, progress: u.progress + 10 }
                : u
            )
          );
        }, 200);

        // Check if cancelled before upload
        if (abortController.signal.aborted) {
          throw new Error('Upload cancelled');
        }

        const { error: uploadError } = await supabase.storage
          .from('user-uploads')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          });

        // Check if cancelled after upload
        if (abortController.signal.aborted) {
          // Try to delete the uploaded file since we're cancelling
          await supabase.storage.from('user-uploads').remove([filePath]);
          throw new Error('Upload cancelled');
        }

        if (uploadError) throw uploadError;

        // Clear interval and set to 100%
        if (progressInterval) {
          clearInterval(progressInterval);
          progressInterval = null;
        }

        setUploads((prev) =>
          prev.map((u) =>
            u.id === uploadId ? { ...u, progress: 100, status: 'processing' as UploadStatus } : u
          )
        );

        const contentRequest: CreateContentRequest = {
          contentType: getContentType(file.type),
          originalFilename: file.name,
          filePath: filePath,
          fileSize: file.size,
          mimeType: file.type,
        };

        // Transform to snake_case for API
        await apiClient.post('/content-items', transformContentRequest(contentRequest), {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          signal: abortController.signal,
        });

        setUploads((prev) =>
          prev.map((u) => (u.id === uploadId ? { ...u, status: 'complete' as UploadStatus } : u))
        );
      } catch (error: unknown) {
        // Always clear interval on any error/exception
        if (progressInterval) {
          clearInterval(progressInterval);
          progressInterval = null;
        }

        const isCancelled =
          error instanceof Error &&
          (error.name === 'AbortError' || error.message === 'Upload cancelled');

        if (isCancelled) {
          setUploads((prev) =>
            prev.map((u) =>
              u.id === uploadId ? { ...u, status: 'cancelled' as UploadStatus } : u
            )
          );
        } else {
          const errorMessage = error instanceof Error ? error.message : 'Upload failed';
          setUploads((prev) =>
            prev.map((u) =>
              u.id === uploadId
                ? { ...u, status: 'error' as UploadStatus, error: errorMessage }
                : u
            )
          );
        }
      } finally {
        // Cleanup abort controller reference
        delete abortControllersRef.current[uploadId];
      }
    },
    [supabase]
  );

  /**
   * Start uploading all queued files
   */
  const startUpload = useCallback(async () => {
    const queuedUploads = uploads.filter((u) => u.status === 'queued');
    if (queuedUploads.length === 0) return;

    setIsUploading(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        // Mark all queued as error
        setUploads((prev) =>
          prev.map((u) =>
            u.status === 'queued'
              ? { ...u, status: 'error' as UploadStatus, error: 'Not authenticated' }
              : u
          )
        );
        return;
      }

      // Upload files sequentially to avoid overwhelming the server
      for (const upload of queuedUploads) {
        // Check if this specific upload was cancelled while waiting
        const currentUpload = uploads.find((u) => u.id === upload.id);
        if (!currentUpload || currentUpload.status !== 'queued') continue;

        await uploadSingleFile(upload, session);
      }

      // Invalidate content list query after all uploads complete
      queryClient.invalidateQueries({ queryKey: ['content'] });
    } finally {
      setIsUploading(false);
    }
  }, [uploads, supabase, uploadSingleFile, queryClient]);

  /**
   * Cancel an in-progress or queued upload
   */
  const cancelUpload = useCallback((uploadId: string) => {
    const upload = uploads.find((u) => u.id === uploadId);
    if (!upload) return;

    if (upload.status === 'queued') {
      // Just remove from queue
      setUploads((prev) => prev.filter((u) => u.id !== uploadId));
    } else if (upload.status === 'uploading') {
      // Abort the in-progress upload
      const controller = abortControllersRef.current[uploadId];
      if (controller) {
        controller.abort();
      }
    }
  }, [uploads]);

  /**
   * Clear completed, cancelled, and errored uploads
   */
  const clearCompleted = useCallback(() => {
    setUploads((prev) =>
      prev.filter(
        (u) => u.status !== 'complete' && u.status !== 'error' && u.status !== 'cancelled'
      )
    );
  }, []);

  /**
   * Check if there are files ready to upload
   */
  const hasQueuedFiles = uploads.some((u) => u.status === 'queued');

  /**
   * Get count of queued files
   */
  const queuedCount = uploads.filter((u) => u.status === 'queued').length;

  return {
    uploads,
    isUploading,
    hasQueuedFiles,
    queuedCount,
    queueFile,
    removeFromQueue,
    startUpload,
    cancelUpload,
    clearCompleted,
  };
}

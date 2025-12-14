'use client';

import { AlertCircle, CheckCircle, Clock, Loader2, X, XCircle } from 'lucide-react';
import type { UploadItem } from '@/hooks/useContentUpload';
import { FileTypeIcon } from './FileTypeIcon';

interface UploadProgressProps {
  upload: UploadItem;
  onCancel: () => void;
}

export function UploadProgress({ upload, onCancel }: UploadProgressProps) {
  const { file, progress, status, error } = upload;

  const statusConfig = {
    queued: {
      text: 'Queued',
      icon: <Clock className="h-4 w-4 text-gray-500" />,
    },
    uploading: {
      text: 'Uploading...',
      icon: <Loader2 className="h-4 w-4 animate-spin text-blue-500" />,
    },
    processing: {
      text: 'Processing...',
      icon: <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />,
    },
    complete: {
      text: 'Complete',
      icon: <CheckCircle className="h-4 w-4 text-green-500" />,
    },
    error: {
      text: error || 'Upload failed',
      icon: <AlertCircle className="h-4 w-4 text-red-500" />,
    },
    cancelled: {
      text: 'Cancelled',
      icon: <XCircle className="h-4 w-4 text-gray-500" />,
    },
  };

  const { text: statusText, icon: statusIcon } = statusConfig[status];

  const canCancel = status === 'queued' || status === 'uploading';

  return (
    <div className="bg-muted flex items-center gap-3 rounded-lg p-3">
      <FileTypeIcon mimeType={file.type} />

      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center justify-between">
          <p className="text-foreground truncate text-sm font-medium">{file.name}</p>
          <div className="flex items-center gap-2">
            {statusIcon}
            <span className="text-muted-foreground text-xs">{statusText}</span>
          </div>
        </div>

        {status === 'uploading' && (
          <div className="bg-muted-foreground/20 h-1.5 w-full rounded-full">
            <div
              className="h-1.5 rounded-full bg-blue-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {status === 'error' && <p className="truncate text-xs text-red-500">{error}</p>}
      </div>

      {canCancel && (
        <button
          onClick={onCancel}
          className="hover:bg-muted-foreground/20 rounded p-1"
          aria-label="Cancel upload"
        >
          <X className="text-muted-foreground h-4 w-4" />
        </button>
      )}
    </div>
  );
}

'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import type { FileRejection } from 'react-dropzone';
import { AlertCircle, Upload, Loader2 } from 'lucide-react';
import { useContentUpload } from '@/hooks/useContentUpload';
import { UploadProgress } from './UploadProgress';

const ACCEPTED_FILE_TYPES = {
  'text/plain': ['.txt'],
  'text/markdown': ['.md'],
  'application/pdf': ['.pdf'],
  'audio/mpeg': ['.mp3'],
  'audio/mp4': ['.m4a'],
  'audio/wav': ['.wav'],
  'video/mp4': ['.mp4'],
};

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB (increased for video)

export function UploadDropzone() {
  const [error, setError] = useState<string | null>(null);
  const {
    uploads,
    isUploading,
    hasQueuedFiles,
    queuedCount,
    queueFile,
    startUpload,
    cancelUpload,
    clearCompleted,
  } = useContentUpload();

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      setError(null);

      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        if (rejection.errors[0]?.code === 'file-too-large') {
          setError('File is too large. Maximum size is 100MB.');
        } else if (rejection.errors[0]?.code === 'file-invalid-type') {
          setError('Invalid file type. Supported: .txt, .md, .pdf, .mp3, .m4a, .wav, .mp4');
        } else {
          setError(rejection.errors[0]?.message || 'File rejected');
        }
        return;
      }

      // Queue files instead of uploading immediately
      acceptedFiles.forEach((file) => {
        queueFile(file);
      });
    },
    [queueFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    maxSize: MAX_FILE_SIZE,
    multiple: true,
  });

  const hasCompletedUploads = uploads.some(
    (u) => u.status === 'complete' || u.status === 'error' || u.status === 'cancelled'
  );

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-12 transition-colors ${
          isDragActive
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
            : 'border-border hover:border-muted-foreground'
        } `}
      >
        <input {...getInputProps()} />
        <div
          className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full ${isDragActive ? 'bg-blue-100 dark:bg-blue-900' : 'bg-muted'} `}
        >
          <Upload
            className={`h-6 w-6 ${isDragActive ? 'text-blue-500' : 'text-muted-foreground'}`}
          />
        </div>

        {isDragActive ? (
          <p className="font-medium text-blue-500">Drop files here...</p>
        ) : (
          <>
            <p className="text-foreground mb-1 font-medium">Drag and drop your files here</p>
            <p className="text-muted-foreground text-sm">or click to browse</p>
          </>
        )}

        <p className="text-muted-foreground mt-3 text-xs">
          Supports: .txt, .md, .pdf, .mp3, .m4a, .wav, .mp4 (max 100MB)
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {uploads.length > 0 && (
        <div className="space-y-3">
          {/* Upload queue */}
          <div className="space-y-2">
            {uploads.map((upload) => (
              <UploadProgress
                key={upload.id}
                upload={upload}
                onCancel={() => cancelUpload(upload.id)}
              />
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {hasQueuedFiles && (
                <button
                  onClick={startUpload}
                  disabled={isUploading}
                  className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Upload {queuedCount} {queuedCount === 1 ? 'file' : 'files'}
                    </>
                  )}
                </button>
              )}
            </div>

            {hasCompletedUploads && (
              <button
                onClick={clearCompleted}
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                Clear completed
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import * as Dialog from '@radix-ui/react-dialog';
import { AlertTriangle, Loader2, RotateCcw, Trash2, X } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { FileTypeIcon } from './FileTypeIcon';
import type { ContentItem } from '@/types/content';

interface ContentDetailModalProps {
  item: ContentItem;
  onClose: () => void;
  onDelete: (id: string) => Promise<void>;
  onRetry: (id: string) => Promise<void>;
  isDeleting?: boolean;
  isRetrying?: boolean;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function ContentDetailModal({
  item,
  onClose,
  onDelete,
  onRetry,
  isDeleting = false,
  isRetrying = false,
}: ContentDetailModalProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = async () => {
    await onDelete(item.id);
    onClose();
  };

  const handleRetry = async () => {
    await onRetry(item.id);
  };

  return (
    <Dialog.Root open={true} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 max-h-[85vh] w-[90vw] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg bg-white p-6 shadow-xl focus:outline-none dark:bg-gray-800 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]">
          <Dialog.Title className="flex items-center justify-between text-lg font-semibold text-gray-900 dark:text-gray-100">
            <div className="flex items-center gap-3">
              <FileTypeIcon contentType={item.contentType} className="h-6 w-6" />
              <span className="max-w-[300px] truncate">
                {item.title || item.originalFilename}
              </span>
            </div>
            <Dialog.Close asChild>
              <button
                className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </Dialog.Title>

          <div className="mt-4 space-y-4">
            {/* Status */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Status</span>
              <StatusBadge status={item.status} errorMessage={item.errorMessage} />
            </div>

            {/* Error message for failed items */}
            {item.status === 'failed' && item.errorMessage && (
              <div className="rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" />
                  <p className="text-sm text-red-700 dark:text-red-400">
                    {item.errorMessage}
                  </p>
                </div>
              </div>
            )}

            {/* File details */}
            <div className="space-y-2 rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Type</span>
                <span className="text-gray-900 dark:text-gray-100 capitalize">
                  {item.contentType}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Size</span>
                <span className="text-gray-900 dark:text-gray-100">
                  {formatFileSize(item.fileSize)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Uploaded</span>
                <span className="text-gray-900 dark:text-gray-100">
                  {format(new Date(item.createdAt), 'MMM d, yyyy h:mm a')}
                </span>
              </div>
              {item.language && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Language</span>
                  <span className="text-gray-900 dark:text-gray-100">{item.language}</span>
                </div>
              )}
              {item.chunkCount !== undefined && item.chunkCount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Indexed Chunks</span>
                  <span className="text-gray-900 dark:text-gray-100">{item.chunkCount}</span>
                </div>
              )}
            </div>

            {/* Topics */}
            {item.topics && item.topics.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Topics
                </h4>
                <div className="flex flex-wrap gap-2">
                  {item.topics.map((topic, index) => (
                    <span
                      key={index}
                      className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                    >
                      {topic.title}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Vocabulary */}
            {item.vocabulary && item.vocabulary.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Vocabulary ({item.vocabulary.length} items)
                </h4>
                <div className="max-h-32 overflow-y-auto rounded-lg bg-gray-50 p-2 dark:bg-gray-700/50">
                  {item.vocabulary.slice(0, 10).map((vocab, index) => (
                    <div key={index} className="py-1 text-sm">
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {vocab.term}
                      </span>
                      {vocab.definition && (
                        <span className="text-gray-500 dark:text-gray-400">
                          {' '}- {vocab.definition}
                        </span>
                      )}
                    </div>
                  ))}
                  {item.vocabulary.length > 10 && (
                    <p className="pt-1 text-xs text-gray-500 dark:text-gray-400">
                      And {item.vocabulary.length - 10} more...
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Grammar Points */}
            {item.grammarPoints && item.grammarPoints.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Grammar Points ({item.grammarPoints.length})
                </h4>
                <div className="space-y-1">
                  {item.grammarPoints.slice(0, 5).map((point, index) => (
                    <div
                      key={index}
                      className="rounded bg-gray-50 px-2 py-1 text-sm dark:bg-gray-700/50"
                    >
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {point.concept}
                      </span>
                    </div>
                  ))}
                  {item.grammarPoints.length > 5 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      And {item.grammarPoints.length - 5} more...
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-end gap-3">
            {item.status === 'failed' && (
              <button
                onClick={handleRetry}
                disabled={isRetrying}
                className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isRetrying ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RotateCcw className="h-4 w-4" />
                )}
                Retry Processing
              </button>
            )}

            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="inline-flex items-center gap-2 rounded-md bg-red-100 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Are you sure?
                </span>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Yes, Delete'
                  )}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

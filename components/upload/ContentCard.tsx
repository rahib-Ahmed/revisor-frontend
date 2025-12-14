'use client';

import { formatDistanceToNow } from 'date-fns';
import { StatusBadge } from './StatusBadge';
import { FileTypeIcon } from './FileTypeIcon';
import type { ContentItem } from '@/types/content';

interface ContentCardProps {
  item: ContentItem;
  onClick: () => void;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function ContentCard({ item, onClick }: ContentCardProps) {
  const isReady = item.status === 'ready';

  return (
    <div
      className="cursor-pointer rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <FileTypeIcon contentType={item.contentType} className="h-8 w-8" />
          <div className="min-w-0 flex-1">
            <h3 className="max-w-[180px] truncate font-medium text-gray-900 dark:text-gray-100">
              {item.title || item.originalFilename}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>
        <StatusBadge status={item.status} errorMessage={item.errorMessage} />
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>{formatFileSize(item.fileSize)}</span>
        {isReady && item.chunkCount && (
          <span>{item.chunkCount} indexed chunks</span>
        )}
      </div>

      {item.status === 'failed' && item.errorMessage && (
        <p
          className="mt-2 truncate text-xs text-red-500"
          title={item.errorMessage}
        >
          {item.errorMessage}
        </p>
      )}
    </div>
  );
}

'use client';

import { cn } from '@/lib/utils';
import type { ContentStatus } from '@/types/content';

interface StatusBadgeProps {
  status: ContentStatus;
  errorMessage?: string | null;
}

const statusConfig: Record<
  ContentStatus,
  {
    label: string;
    color: string;
    isLoading: boolean;
  }
> = {
  pending: { label: 'Pending', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300', isLoading: false },
  uploading: { label: 'Uploading...', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300', isLoading: true },
  processing: { label: 'Processing...', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300', isLoading: true },
  transcribing: { label: 'Transcribing...', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300', isLoading: true },
  extracting: { label: 'Extracting...', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300', isLoading: true },
  text_extracted: { label: 'Text Extracted', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300', isLoading: false },
  parsing: { label: 'Analyzing...', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300', isLoading: true },
  parsed: { label: 'Analyzed', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300', isLoading: false },
  indexing: { label: 'Indexing...', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300', isLoading: true },
  ready: { label: 'Ready', color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300', isLoading: false },
  failed: { label: 'Failed', color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300', isLoading: false },
};

export function StatusBadge({ status, errorMessage }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        config.color
      )}
      title={status === 'failed' && errorMessage ? errorMessage : undefined}
    >
      {config.isLoading && (
        <svg
          className="h-3 w-3 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {config.label}
    </span>
  );
}

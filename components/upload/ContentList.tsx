'use client';

import { useState } from 'react';
import { AlertCircle, FolderOpen } from 'lucide-react';
import { useContentItems } from '@/hooks/useContentItems';
import { ContentCard } from './ContentCard';
import { ContentDetailModal } from './ContentDetailModal';
import type { ContentItem } from '@/types/content';

export function ContentList() {
  const {
    data: items,
    isLoading,
    error,
    deleteItemAsync,
    isDeleting,
    retryItemAsync,
    isRetrying,
  } = useContentItems();
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);

  if (isLoading) {
    return <ContentListSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center gap-2 py-8 text-red-500">
        <AlertCircle className="h-5 w-5" />
        <span>Failed to load content. Please try again.</span>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500 dark:text-gray-400">
        <FolderOpen className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
        <p className="mt-4 text-lg">No content uploaded yet</p>
        <p className="mt-2 text-sm">
          Drag and drop files above to get started
        </p>
      </div>
    );
  }

  const handleDelete = async (id: string) => {
    await deleteItemAsync(id);
  };

  const handleRetry = async (id: string) => {
    await retryItemAsync(id);
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <ContentCard
            key={item.id}
            item={item}
            onClick={() => setSelectedItem(item)}
          />
        ))}
      </div>

      {selectedItem && (
        <ContentDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onDelete={handleDelete}
          onRetry={handleRetry}
          isDeleting={isDeleting}
          isRetrying={isRetrying}
        />
      )}
    </>
  );
}

function ContentListSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-32 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"
        />
      ))}
    </div>
  );
}

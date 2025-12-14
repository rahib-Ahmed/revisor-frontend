'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { contentApi } from '@/lib/api';
import { createClient } from '@/lib/supabase/client';
import type { ContentItem, ContentStatus } from '@/types/content';
import { transformContentItem } from '@/types/content';

const PROCESSING_STATUSES: ContentStatus[] = [
  'pending',
  'uploading',
  'processing',
  'transcribing',
  'extracting',
  'parsing',
  'indexing',
];

async function getAccessToken(): Promise<string> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('No active session');
  }

  return session.access_token;
}

export function useContentItems() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['content-items'],
    queryFn: async (): Promise<ContentItem[]> => {
      const token = await getAccessToken();
      const response = await contentApi.getContentItems(token);
      return (response.items || []).map(transformContentItem);
    },
    refetchInterval: (query) => {
      const items = query.state.data as ContentItem[] | undefined;
      // Poll every 3 seconds if any items are still processing
      const hasProcessing = items?.some((item) =>
        PROCESSING_STATUSES.includes(item.status)
      );
      return hasProcessing ? 3000 : false;
    },
    staleTime: 1000, // Consider data stale after 1 second
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = await getAccessToken();
      await contentApi.deleteContentItem(id, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-items'] });
    },
  });

  const retryMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = await getAccessToken();
      const response = await contentApi.retryProcessing(id, token);
      return transformContentItem(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-items'] });
    },
  });

  return {
    ...query,
    deleteItem: deleteMutation.mutate,
    deleteItemAsync: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    deleteError: deleteMutation.error,
    retryItem: retryMutation.mutate,
    retryItemAsync: retryMutation.mutateAsync,
    isRetrying: retryMutation.isPending,
    retryError: retryMutation.error,
  };
}

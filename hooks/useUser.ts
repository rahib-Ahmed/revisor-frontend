'use client';

import { useQuery } from '@tanstack/react-query';
import { ApiError, apiClient } from '@/lib/api';
import { createClient } from '@/lib/supabase/client';
import type { UserResponse } from '@/types/user';

const isDev = process.env.NODE_ENV === 'development';

function logSession(message: string, data?: unknown) {
  if (isDev) {
    console.log(`[Session] ${message}`, data ?? '');
  }
}

export function useUser() {
  return useQuery({
    queryKey: ['user', 'me'],
    queryFn: async (): Promise<UserResponse> => {
      const supabase = createClient();
      logSession('Fetching session...');

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        logSession('No active session found');
        throw new ApiError(401, 'NO_SESSION', 'No active session');
      }

      logSession('Session found, fetching user from API', {
        expiresAt: session.expires_at,
      });

      const user = await apiClient.get<UserResponse>('/users/me', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      logSession('User fetched successfully', { userId: user.id });
      return user;
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

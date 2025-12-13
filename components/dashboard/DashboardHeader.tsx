'use client';

import { UserMenu } from '@/components/auth/UserMenu';
import { useUser } from '@/hooks/useUser';

export function DashboardHeader() {
  const { data: user, isLoading, error } = useUser();

  if (isLoading) {
    return <DashboardHeaderSkeleton />;
  }

  if (error) {
    return (
      <header className="flex items-center justify-between">
        <div className="text-red-500">Failed to load user data</div>
      </header>
    );
  }

  const displayName = user?.display_name || 'User';
  const avatarUrl = user?.avatar_url || undefined;

  return (
    <header className="flex items-center justify-between">
      <div>
        <h1 className="text-foreground text-2xl font-bold">Welcome back, {displayName}!</h1>
        <p className="text-muted-foreground">Ready for your revision session?</p>
      </div>
      <UserMenu
        user={{
          email: user?.email,
          displayName: user?.display_name || undefined,
          avatarUrl: avatarUrl,
        }}
      />
    </header>
  );
}

function DashboardHeaderSkeleton() {
  return (
    <header className="flex items-center justify-between">
      <div className="animate-pulse">
        <div className="bg-muted mb-2 h-8 w-48 rounded" />
        <div className="bg-muted h-4 w-32 rounded" />
      </div>
      <div className="bg-muted h-10 w-10 animate-pulse rounded-full" />
    </header>
  );
}

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

interface AuthGuardProps {
  children: React.ReactNode;
}

export async function AuthGuard({ children }: AuthGuardProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return <>{children}</>;
}

export async function getAuthUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    displayName: user.user_metadata?.full_name || user.user_metadata?.name,
    avatarUrl: user.user_metadata?.avatar_url,
  };
}

import { redirect } from 'next/navigation';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { EmptyContentState } from '@/components/dashboard/EmptyContentState';
import { createClient } from '@/lib/supabase/server';

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Belt-and-suspenders auth check (layout also checks)
  if (!user) {
    redirect('/login');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <DashboardHeader />
      <main className="mt-8">
        <EmptyContentState />
      </main>
    </div>
  );
}

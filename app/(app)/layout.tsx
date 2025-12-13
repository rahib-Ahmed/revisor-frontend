import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getAuthUser } from '@/components/auth/AuthGuard';
import { UserMenu } from '@/components/auth/UserMenu';
import { getAppConfig } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
}

export default async function Layout({ children }: LayoutProps) {
  const hdrs = await headers();
  const { companyName, logo, logoDark } = await getAppConfig(hdrs);

  // Auth guard: redirect to login if not authenticated
  const user = await getAuthUser();
  if (!user) {
    redirect('/login');
  }

  return (
    <>
      <header className="fixed top-0 left-0 z-50 hidden w-full flex-row justify-between p-6 md:flex">
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://livekit.io"
          className="scale-100 transition-transform duration-300 hover:scale-110"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logo} alt={`${companyName} Logo`} className="block size-6 dark:hidden" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoDark ?? logo}
            alt={`${companyName} Logo`}
            className="hidden size-6 dark:block"
          />
        </a>
        <div className="flex items-center gap-4">
          <span className="text-foreground font-mono text-xs font-bold tracking-wider uppercase">
            Built with{' '}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://docs.livekit.io/agents"
              className="underline underline-offset-4"
            >
              LiveKit Agents
            </a>
          </span>
          <UserMenu user={user} />
        </div>
      </header>

      {children}
    </>
  );
}

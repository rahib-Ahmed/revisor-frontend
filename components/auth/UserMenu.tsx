'use client';

import { useState } from 'react';
import { signOut } from '@/app/logout/actions';

interface UserMenuProps {
  user: {
    email?: string;
    displayName?: string;
    avatarUrl?: string;
  };
}

export function UserMenu({ user }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full p-1 transition-colors hover:bg-gray-700"
      >
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.displayName || 'User avatar'}
            className="h-8 w-8 rounded-full"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-medium text-white">
            {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
          </div>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 z-20 mt-2 w-56 rounded-lg bg-gray-800 py-2 shadow-xl ring-1 ring-gray-700">
            <div className="border-b border-gray-700 px-4 py-3">
              <p className="text-sm font-medium text-white">{user.displayName || 'User'}</p>
              <p className="text-xs text-gray-400">{user.email}</p>
            </div>
            <form action={signOut}>
              <button
                type="submit"
                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-300 transition-colors hover:bg-gray-700 hover:text-white"
              >
                <LogoutIcon />
                Sign out
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}

function LogoutIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
      />
    </svg>
  );
}

import { ReactNode } from 'react';
import { User } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { Page } from '@/types';

interface AppShellProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  profileName: string;
  children: ReactNode;
}

const PAGE_TITLES: Record<Page, string> = {
  dashboard: '',
  goals: 'Goals',
  money: 'Money',
  history: 'History',
  profile: 'Profile',
  settings: 'Settings',
};

export function AppShell({ currentPage, onNavigate, profileName, children }: AppShellProps) {
  const today = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <Sidebar currentPage={currentPage} onNavigate={onNavigate} />
      <div className="flex-1 min-w-0">
        <header className="h-20 sticky top-0 z-30 flex items-center justify-between px-8 border-b border-neutral-200 bg-neutral-50/80 backdrop-blur-sm">
          <h1 className="text-xl font-display font-semibold text-neutral-900">
            {currentPage === 'dashboard' ? `Hello, ${profileName.split(' ')[0] || 'there'}` : PAGE_TITLES[currentPage]}
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-neutral-500">{today}</span>
            <button
              onClick={() => onNavigate('profile')}
              className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center hover:bg-primary-200 transition-colors"
              aria-label="Profile"
            >
              <User size={17} strokeWidth={2} />
            </button>
          </div>
        </header>
        <main className="px-8 py-8 max-w-[1600px] animate-fade-in">{children}</main>
      </div>
    </div>
  );
}

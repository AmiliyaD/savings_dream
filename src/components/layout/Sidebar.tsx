import { LayoutDashboard, Target, Wallet, History, User, Settings, PiggyBank } from 'lucide-react';
import { Page } from '@/types';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const primaryNav: { page: Page; label: string; icon: typeof LayoutDashboard }[] = [
  { page: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
];

const workingNav: { page: Page; label: string; icon: typeof LayoutDashboard }[] = [
  { page: 'goals', label: 'Goals', icon: Target },
  { page: 'money', label: 'Money', icon: Wallet },
  { page: 'history', label: 'History', icon: History },
];

const accountNav: { page: Page; label: string; icon: typeof LayoutDashboard }[] = [
  { page: 'profile', label: 'Profile', icon: User },
  { page: 'settings', label: 'Settings', icon: Settings },
];

function NavGroup({
  items,
  currentPage,
  onNavigate,
}: {
  items: typeof primaryNav;
  currentPage: Page;
  onNavigate: (page: Page) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      {items.map(({ page, label, icon: Icon }) => {
        const active = currentPage === page;
        return (
          <button
            key={page}
            onClick={() => onNavigate(page)}
            className={`group flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              active
                ? 'bg-primary-600 text-white shadow-sm'
                : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800'
            }`}
          >
            <Icon
              size={18}
              strokeWidth={2}
              className={active ? 'text-white' : 'text-neutral-400 group-hover:text-neutral-600'}
            />
            {label}
          </button>
        );
      })}
    </div>
  );
}

export function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  return (
    <aside className="w-64 shrink-0 h-screen sticky top-0 border-r border-neutral-200 bg-white flex flex-col">
      <div className="flex items-center gap-2.5 px-6 h-20 border-b border-neutral-100">
        <div className="w-9 h-9 rounded-lg bg-primary-600 flex items-center justify-center shrink-0">
          <PiggyBank size={20} className="text-white" strokeWidth={2} />
        </div>
        <span className="font-display font-semibold text-neutral-900 text-[15px] tracking-tight">
          Dream Savings
        </span>
      </div>

      <nav className="flex-1 px-4 py-6 flex flex-col gap-6">
        <NavGroup items={primaryNav} currentPage={currentPage} onNavigate={onNavigate} />
        <div>
          <p className="px-3.5 text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-2">
            Track
          </p>
          <NavGroup items={workingNav} currentPage={currentPage} onNavigate={onNavigate} />
        </div>
      </nav>

      <div className="px-4 py-4 border-t border-neutral-100">
        <NavGroup items={accountNav} currentPage={currentPage} onNavigate={onNavigate} />
      </div>
    </aside>
  );
}

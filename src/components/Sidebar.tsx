import React, { useState } from 'react';
import {
  Brain,
  LayoutGrid,
  Menu,
  Moon,
  Sigma,
  Sun,
  Timer,
  X,
  Zap,
} from 'lucide-react';
import { NavigationTab } from '../types/nuet';

interface SidebarProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  predictedScore: number;
  hasScoreData: boolean;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const NAV_ITEMS: Array<{
  id: NavigationTab;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  accentClass: string;
}> = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutGrid,
    accentClass: 'bg-[#0A0A0A] dark:bg-white',
  },
  {
    id: 'math',
    label: 'Math',
    icon: Sigma,
    accentClass: 'bg-[#2563EB]',
  },
  {
    id: 'ct',
    label: 'Critical Thinking',
    icon: Brain,
    accentClass: 'bg-[#D97706]',
  },
  {
    id: 'sprint',
    label: 'Daily Sprint',
    icon: Zap,
    accentClass: 'bg-[#D97706]',
  },
  {
    id: 'mock',
    label: 'Mock Exam',
    icon: Timer,
    accentClass: 'bg-[#E11D48]',
  },
];

export function Sidebar({
  activeTab,
  onSelectTab,
  predictedScore,
  hasScoreData,
  theme,
  onToggleTheme,
}: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNavClick = (id: NavigationTab) => {
    onSelectTab(id);
    setMobileOpen(false);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white">
      {/* Top Wordmark */}
      <div className="px-6 py-6 border-b border-black/15 dark:border-white/15 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => handleNavClick('dashboard')}
          className="text-left text-base font-semibold tracking-tight text-[#0A0A0A] dark:text-white whitespace-nowrap"
        >
          NUET PREP
        </button>
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="lg:hidden p-1.5 border border-black/15 dark:border-white/15 hover:border-[#0A0A0A] dark:hover:border-white transition-colors"
          aria-label="Close menu"
        >
          <X className="w-4 h-4" strokeWidth={1.5} />
        </button>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 py-4 space-y-1" aria-label="Main navigation">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavClick(item.id)}
              className={`group relative w-full flex items-center gap-3 px-6 py-2.5 text-left text-sm transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] whitespace-nowrap ${
                isActive
                  ? 'font-semibold text-[#0A0A0A] dark:text-white bg-black/[0.035] dark:bg-white/[0.05]'
                  : 'font-normal text-black/65 dark:text-white/65 hover:text-[#0A0A0A] dark:hover:text-white hover:bg-black/[0.02] dark:hover:bg-white/[0.025]'
              }`}
            >
              <span
                aria-hidden="true"
                className={`absolute left-0 top-1 bottom-1 w-[2px] transition-opacity duration-200 ${
                  item.accentClass
                } ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'}`}
              />
              <Icon
                className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
                strokeWidth={1.5}
              />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Theme Toggle + Score Pill */}
      <div className="px-6 py-4 border-t border-black/15 dark:border-white/15 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onToggleTheme}
          className="inline-flex items-center gap-2 px-3 py-1.5 border border-black/15 dark:border-white/15 text-xs font-medium text-[#0A0A0A] dark:text-white hover:border-[#0A0A0A] dark:hover:border-white transition-colors duration-200 whitespace-nowrap"
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? (
            <Sun className="w-3.5 h-3.5" strokeWidth={1.5} />
          ) : (
            <Moon className="w-3.5 h-3.5" strokeWidth={1.5} />
          )}
          <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
        </button>

        <span className="px-2.5 py-1 rounded-full border border-black/20 dark:border-white/20 font-mono text-[11px] font-medium tabular-nums text-[#0A0A0A] dark:text-white whitespace-nowrap">
          {hasScoreData ? `${predictedScore} / 240` : '--- / 240'}
        </span>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:block lg:w-[248px] lg:shrink-0 border-r border-black/15 dark:border-white/15 sticky top-0 h-screen">
        {sidebarContent}
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-30 bg-white dark:bg-[#0A0A0A] border-b border-black/15 dark:border-white/15 px-4 py-3 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => handleNavClick('dashboard')}
          className="text-sm font-semibold tracking-tight text-[#0A0A0A] dark:text-white whitespace-nowrap"
        >
          NUET PREP
        </button>

        <div className="flex items-center gap-2.5">
          <span className="px-2 py-0.5 rounded-full border border-black/20 dark:border-white/20 font-mono text-[11px] tabular-nums text-[#0A0A0A] dark:text-white">
            {hasScoreData ? `${predictedScore} / 240` : '--- / 240'}
          </span>
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 border border-black/15 dark:border-white/15 text-xs font-medium text-[#0A0A0A] dark:text-white hover:border-[#0A0A0A] dark:hover:border-white transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-4 h-4" strokeWidth={1.5} />
            <span>Menu</span>
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div className="relative z-10 w-[248px] max-w-[85vw] h-full border-r border-black/15 dark:border-white/15">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}

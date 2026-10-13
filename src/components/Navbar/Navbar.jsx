import React from 'react';
import { Flame, Disc, Sun, Moon, Settings } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';

export const Navbar = ({ activeTab, onNavigateTab }) => {
  const { userStreaks, effectiveStreak } = useData();
  const { theme, toggleTheme } = useTheme();

  const streak = (effectiveStreak || userStreaks)?.current_streak || 0;
  const isActiveToday = effectiveStreak?.is_active_today;

  return (
    <header className="fixed top-0 w-full z-40 pt-safe bg-surface/85 backdrop-blur-xl border-b border-outline-variant/30 h-14 max-h-16">
      <div className="max-w-6xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between">
        
        {/* Brand Wordmark Button */}
        <button
          type="button"
          onClick={() => {
            onNavigateTab('spin');
            if (typeof window !== 'undefined') {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
          aria-label="Daily Dive, go to Spin"
          title="Daily Dive, go to Spin"
          className="flex items-center gap-2.5 cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg -ml-1 p-1 hover:opacity-90 transition-opacity"
        >
          <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary-container/20 border border-primary-container/30 text-primary">
            <Disc size={18} />
          </div>
          <span className="font-display font-bold text-base sm:text-lg text-on-surface tracking-tight whitespace-nowrap">
            Daily Dive
          </span>
        </button>
        
        {/* Top Controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Streak Counter: Hidden when 0; when >= 1 show flame + number only */}
          {streak >= 1 && (
            <div
              data-testid="header-streak-pill"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container-high border border-outline-variant/30 text-xs shadow-inner select-none whitespace-nowrap"
              style={{ whiteSpace: 'nowrap' }}
            >
              <Flame size={14} className={isActiveToday ? 'text-amber-500 fill-amber-500' : 'text-tertiary'} />
              <span className="font-mono font-bold text-on-surface">{streak}</span>
            </div>
          )}

          {/* Theme Toggle Button (>=44x44 touch target) */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            className="w-11 h-11 flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-surface-container-high border border-outline-variant/30 hover:bg-surface-container-highest transition-all active:scale-95 shadow-inner">
              {theme === 'dark' ? (
                <Sun size={15} className="text-tertiary" />
              ) : (
                <Moon size={15} className="text-primary" />
              )}
            </div>
          </button>
          
          {/* Settings Gear Button (>=44x44 touch target) */}
          <button
            type="button"
            onClick={() => onNavigateTab('settings')}
            aria-label="Settings"
            title="Settings"
            aria-current={activeTab === 'settings' ? 'page' : undefined}
            className="w-11 h-11 flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all active:scale-95 shadow-inner ${
              activeTab === 'settings'
                ? 'bg-primary-container/20 border-primary-container/40 text-primary'
                : 'bg-surface-container-high border-outline-variant/30 hover:bg-surface-container-highest text-on-surface-variant'
            }`}>
              <Settings size={15} />
            </div>
          </button>
        </div>

      </div>
    </header>
  );
};


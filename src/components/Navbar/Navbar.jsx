import React from 'react';
import { Flame, Disc, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import { UserMenu } from './UserMenu';

export const Navbar = ({ activeTab, onNavigateTab }) => {
  const { user } = useAuth();
  const { userStreaks, effectiveStreak, isOnline } = useData();
  const { theme, toggleTheme } = useTheme();

  const streak = (effectiveStreak || userStreaks)?.current_streak || 0;
  const isActiveToday = effectiveStreak?.is_active_today;

  const getScreenTitle = () => {
    switch (activeTab) {
      case 'spin': return 'Daily Dive';
      case 'extract': return 'Extract Topics';
      case 'filter': return 'Category Filters';
      case 'progress': return 'Progress & Metrics';
      case 'settings': return 'Settings & Preferences';
      case 'auth': return 'Account Access';
      default: return 'Daily Dive';
    }
  };

  return (
    <header className="fixed top-0 w-full z-40 pt-safe bg-surface/85 backdrop-blur-xl border-b border-outline-variant/30">
      <div className="max-w-6xl mx-auto h-14 px-4 sm:px-6 flex items-center justify-between">
        
        {/* Brand & Active Screen Title */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary-container/20 border border-primary-container/30 text-primary">
            <Disc size={19} />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-base sm:text-lg text-on-surface tracking-tight">
              {getScreenTitle()}
            </span>
            <span className="text-[11px] font-mono text-on-surface-variant hidden sm:inline">
              Micro-learning on Demand
            </span>
          </div>
        </div>
        
        {/* Top Actions / Stats Pill */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Streak Counter */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-high border border-outline-variant/30 text-on-surface-variant text-xs shadow-inner">
            <Flame size={15} className={isActiveToday ? 'text-amber-500 fill-amber-500' : 'text-tertiary'} />
            <span className="font-mono font-medium text-on-surface">{streak}d streak</span>
          </div>

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center bg-surface-container-high border border-outline-variant/30 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest transition-all active:scale-95 cursor-pointer shadow-inner"
          >
            {theme === 'dark' ? (
              <Sun size={15} className="text-tertiary" />
            ) : (
              <Moon size={15} className="text-primary" />
            )}
          </button>
          
          {/* User Profile Avatar Dropdown */}
          <UserMenu 
            onNavigateSettings={() => onNavigateTab('settings')}
            onNavigateAuth={() => onNavigateTab('auth')}
          />
        </div>

      </div>
    </header>
  );
};

import React from 'react';
import { motion } from 'framer-motion';
import { RotateCw, SlidersHorizontal, BarChart3, Settings } from 'lucide-react';

export const BottomNavigation = ({ activeTab, onSelectTab }) => {
  const tabs = [
    { id: 'spin', label: 'Spin', icon: RotateCw },
    { id: 'filter', label: 'Filter', icon: SlidersHorizontal },
    { id: 'progress', label: 'Progress', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 w-full z-40 pb-safe bg-surface/90 backdrop-blur-xl border-t border-outline-variant/30 shadow-2xl">
      <div className="h-16 px-3 flex items-center justify-around">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              className={`relative min-w-[64px] min-h-[48px] px-2.5 py-1 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-colors z-10 cursor-pointer ${
                isActive
                  ? 'text-primary font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-indicator"
                  className="absolute inset-0 rounded-xl bg-primary-container/15 dark:bg-primary-container/25 border border-primary-container/30 -z-10"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <Icon size={20} className="relative z-10" />
              <span className="relative z-10 text-[11px] font-medium tracking-wide">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

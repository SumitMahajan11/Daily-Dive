import React from 'react';
import { motion } from 'framer-motion';
import { RotateCw, BookOpen, BarChart3 } from 'lucide-react';

export const BottomNavigation = ({ activeTab, onSelectTab }) => {
  const tabs = [
    { id: 'spin', label: 'Spin', icon: RotateCw },
    { id: 'library', label: 'Library', icon: BookOpen },
    { id: 'progress', label: 'Progress', icon: BarChart3 },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 w-full z-40 pb-safe bg-surface/90 backdrop-blur-xl border-t border-outline-variant/30 shadow-2xl">
      <div className="h-16 px-4 flex items-center justify-around">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              data-nav-id={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`relative min-w-[72px] min-h-[48px] px-3 py-1.5 rounded-xl flex flex-col items-center justify-center gap-1 transition-colors z-10 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary ${
                isActive
                  ? 'text-on-surface font-bold'
                  : 'text-on-surface-variant hover:text-on-surface font-medium'
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
              <span className="relative z-10 text-xs font-medium tracking-wide">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};


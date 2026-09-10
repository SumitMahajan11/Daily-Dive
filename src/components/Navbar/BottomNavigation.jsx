import React from 'react';
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
              className={`min-w-[56px] min-h-[48px] flex flex-col items-center justify-center gap-1 transition-colors ${
                isActive
                  ? 'text-primary font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <Icon size={22} />
              <span className="text-[11px] font-medium tracking-wide">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

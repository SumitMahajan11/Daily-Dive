import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider, useData } from './context/DataContext';
import { Navbar } from './components/Navbar/Navbar';
import { BottomNavigation } from './components/Navbar/BottomNavigation';
import { SpinScreen } from './components/Screens/SpinScreen';
import { FilterScreen } from './components/Screens/FilterScreen';
import { ProgressScreen } from './components/Screens/ProgressScreen';
import { SettingsScreen } from './components/Screens/SettingsScreen';
import { AuthScreen } from './components/Auth/AuthScreen';
import { ToastContainer } from './components/UI/Toast';
import { RotateCw, SlidersHorizontal, BarChart3, Settings } from 'lucide-react';

const MainLayout = () => {
  const { user } = useAuth();
  const { topics, eligibleTopics, userProgressMap } = useData();
  const [activeTab, setActiveTab] = useState('spin');

  // Keyboard navigation shortcuts: 1 -> Spin, 2 -> Filter, 3 -> Progress, 4 -> Settings
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
      if (e.key === '1') setActiveTab('spin');
      else if (e.key === '2') setActiveTab('filter');
      else if (e.key === '3') setActiveTab('progress');
      else if (e.key === '4') setActiveTab('settings');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const learnedCount = Object.keys(userProgressMap).length;
  const totalTopics = topics.length || 1;
  const progressPercent = Math.min(100, Math.round((learnedCount / totalTopics) * 100));

  const navItems = [
    { id: 'spin', label: 'Spin Roulette', icon: RotateCw, kbd: '1' },
    { id: 'filter', label: 'Category Filter', icon: SlidersHorizontal, kbd: '2' },
    { id: 'progress', label: 'Progress & Stats', icon: BarChart3, kbd: '3' },
    { id: 'settings', label: 'Settings', icon: Settings, kbd: '4' }
  ];

  return (
    <div className="bg-surface font-sans text-on-surface antialiased min-h-screen flex flex-col selection:bg-primary-container selection:text-white">
      {/* Top Navbar */}
      <Navbar activeTab={activeTab} onNavigateTab={setActiveTab} />

      {/* Main Wrapper with Desktop Sidebar */}
      <div className="flex-1 w-full max-w-6xl mx-auto flex pt-14 pb-20 md:pb-8">
        
        {/* Desktop Sidebar Navigation */}
        <aside className="hidden md:flex flex-col w-64 p-4 sticky top-14 h-[calc(100vh-3.5rem)] border-r border-outline-variant/20 shrink-0">
          <nav className="flex flex-col gap-1.5 flex-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'text-primary bg-primary-container/20 border border-primary-container/30'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container border border-transparent'
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                  <kbd className="ml-auto font-mono text-[10px] px-1.5 py-0.5 bg-surface-container text-outline rounded border border-outline-variant/30">
                    {item.kbd}
                  </kbd>
                </button>
              );
            })}
          </nav>

          {/* Sidebar Footer Card */}
          <div className="mt-auto p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-on-surface-variant">
              <span>Active Topics:</span>
              <span className="text-primary font-semibold">
                {eligibleTopics.length} / {topics.length}
              </span>
            </div>
            <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-primary-container h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-[11px] text-outline">
              Press <kbd className="px-1 py-0.5 bg-surface-container rounded border border-outline-variant/40 font-mono">Space</kbd> anywhere to spin instantly.
            </p>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 w-full px-4 sm:px-8 py-6 max-w-4xl mx-auto overflow-x-hidden">
          {activeTab === 'auth' && (
            <AuthScreen onAuthSuccess={() => setActiveTab('spin')} />
          )}
          {activeTab === 'spin' && (
            <SpinScreen onNavigateFilter={() => setActiveTab('filter')} />
          )}
          {activeTab === 'filter' && (
            <FilterScreen onSpinActivePool={() => setActiveTab('spin')} />
          )}
          {activeTab === 'progress' && (
            <ProgressScreen onReviewTopic={() => setActiveTab('spin')} />
          )}
          {activeTab === 'settings' && (
            <SettingsScreen />
          )}
        </main>

      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNavigation activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <MainLayout />
      </DataProvider>
    </AuthProvider>
  );
}

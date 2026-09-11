import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider, useData } from './context/DataContext';
import { Navbar } from './components/Navbar/Navbar';
import { BottomNavigation } from './components/Navbar/BottomNavigation';
import { SpinScreen } from './components/Screens/SpinScreen';
import { FilterScreen } from './components/Screens/FilterScreen';
import { ProgressScreen } from './components/Screens/ProgressScreen';
import { SettingsScreen } from './components/Screens/SettingsScreen';
import { AuthScreen } from './components/Auth/AuthScreen';
import { Hero } from './components/Landing/Hero';
import { ToastContainer } from './components/UI/Toast';
import { Skeleton } from './components/UI/Skeleton';
import { RotateCw, SlidersHorizontal, BarChart3, Settings } from 'lucide-react';

const SECTIONS = [
  { id: 'spin',     label: 'Spin Roulette',    icon: RotateCw,          kbd: '1' },
  { id: 'filter',   label: 'Category Filter',  icon: SlidersHorizontal, kbd: '2' },
  { id: 'progress', label: 'Progress & Stats', icon: BarChart3,         kbd: '3' },
  { id: 'settings', label: 'Settings',          icon: Settings,          kbd: '4' },
];

/* ── Small helper components ── */

const SectionDivider = ({ label, icon: Icon }) => (
  <div className="flex items-center gap-3 mb-6">
    <div className="flex items-center gap-2 text-primary">
      <Icon size={18} />
      <h2 className="font-display text-sm font-bold uppercase tracking-widest text-primary/90">{label}</h2>
    </div>
    <div className="flex-1 h-px bg-outline-variant/20" />
  </div>
);

const HorizontalSeparator = () => (
  <div className="max-w-4xl mx-auto px-4 sm:px-8">
    <div className="h-px bg-gradient-to-r from-transparent via-outline-variant/30 to-transparent" />
  </div>
);

const MainLayout = () => {
  const { user } = useAuth();
  const { topics, eligibleTopics, userProgressMap, loadingData } = useData();
  const [activeSection, setActiveSection] = useState('spin');

  const sectionRefs = useRef({});
  const isScrollingProgrammatically = useRef(false);

  // Register a ref for each section
  const setSectionRef = useCallback((id) => (el) => {
    sectionRefs.current[id] = el;
  }, []);

  // Scroll to a section smoothly
  const scrollToSection = useCallback((id) => {
    const el = sectionRefs.current[id];
    if (!el) return;
    isScrollingProgrammatically.current = true;
    setActiveSection(id);
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // Release programmatic flag after scroll animation (~800ms)
    setTimeout(() => { isScrollingProgrammatically.current = false; }, 900);
  }, []);

  // IntersectionObserver: keep active nav in sync while user scrolls manually
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (isScrollingProgrammatically.current) return;
        let best = null;
        let bestRatio = 0;
        entries.forEach((entry) => {
          if (entry.intersectionRatio > bestRatio) {
            bestRatio = entry.intersectionRatio;
            best = entry;
          }
        });
        if (best && best.isIntersecting && best.target.dataset.section) {
          setActiveSection(best.target.dataset.section);
        }
      },
      { threshold: [0.15, 0.5, 0.85], rootMargin: '-10% 0px -15% 0px' }
    );

    SECTIONS.forEach(({ id }) => {
      const el = sectionRefs.current[id];
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Keyboard shortcuts: 1-4 scroll to sections
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
      const map = { '1': 'spin', '2': 'filter', '3': 'progress', '4': 'settings' };
      if (map[e.key]) scrollToSection(map[e.key]);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [scrollToSection]);

  const learnedCount = Object.keys(userProgressMap).length;
  const totalTopics = topics.length || 1;
  const progressPercent = Math.min(100, Math.round((learnedCount / totalTopics) * 100));

  return (
    <div className="bg-surface font-sans text-on-surface antialiased min-h-screen flex flex-col selection:bg-primary-container selection:text-white">
      {/* Top Navbar — passes activeSection & scroll handler */}
      <Navbar activeTab={activeSection} onNavigateTab={scrollToSection} />

      {/* Main Wrapper */}
      <div className="flex-1 w-full max-w-6xl mx-auto flex pt-14 pb-20 md:pb-8">

        {/* Desktop Sticky Sidebar */}
        <aside className="hidden md:flex flex-col w-64 p-4 sticky top-14 h-[calc(100vh-3.5rem)] border-r border-outline-variant/20 shrink-0">
          <nav className="flex flex-col gap-1.5 flex-1">
            {SECTIONS.map(item => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollToSection(item.id)}
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
              {loadingData ? (
                <Skeleton className="h-3.5 w-14 rounded" />
              ) : (
                <span className="text-primary font-semibold">
                  {eligibleTopics.length} / {topics.length}
                </span>
              )}
            </div>
            <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
              {loadingData ? (
                <Skeleton className="h-full w-full rounded-full" />
              ) : (
                <motion.div
                  className="bg-primary-container h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
              )}
            </div>
            <p className="text-[11px] text-outline">
              Press <kbd className="px-1 py-0.5 bg-surface-container rounded border border-outline-variant/40 font-mono">Space</kbd> anywhere to spin instantly.
            </p>
          </div>
        </aside>

        {/* Scrollable Content — all sections stacked vertically */}
        <main className="flex-1 w-full overflow-x-hidden">

          {/* Introductory Hero (only when not signed in) */}
          {!user && (
            <Hero onGetStarted={() => scrollToSection('auth')} />
          )}

          {/* Auth section (only when not signed in) */}
          {!user && (
            <section
              id="auth"
              data-section="auth"
              ref={setSectionRef('auth')}
              className="px-4 sm:px-8 py-8 max-w-4xl mx-auto scroll-mt-16"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              >
                <AuthScreen onAuthSuccess={() => scrollToSection('spin')} />
              </motion.div>
            </section>
          )}

          {/* ── SPIN ── */}
          <section
            id="spin"
            data-section="spin"
            ref={setSectionRef('spin')}
            className="px-4 sm:px-8 py-8 max-w-4xl mx-auto scroll-mt-16"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <SectionDivider label="Spin Roulette" icon={RotateCw} />
              <SpinScreen onNavigateFilter={() => scrollToSection('filter')} />
            </motion.div>
          </section>

          <HorizontalSeparator />

          {/* ── FILTER ── */}
          <section
            id="filter"
            data-section="filter"
            ref={setSectionRef('filter')}
            className="px-4 sm:px-8 py-8 max-w-4xl mx-auto scroll-mt-16"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <SectionDivider label="Category Filter" icon={SlidersHorizontal} />
              <FilterScreen onSpinActivePool={() => scrollToSection('spin')} />
            </motion.div>
          </section>

          <HorizontalSeparator />

          {/* ── PROGRESS ── */}
          <section
            id="progress"
            data-section="progress"
            ref={setSectionRef('progress')}
            className="px-4 sm:px-8 py-8 max-w-4xl mx-auto scroll-mt-16"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <SectionDivider label="Progress & Stats" icon={BarChart3} />
              <ProgressScreen onReviewTopic={() => scrollToSection('spin')} />
            </motion.div>
          </section>

          <HorizontalSeparator />

          {/* ── SETTINGS ── */}
          <section
            id="settings"
            data-section="settings"
            ref={setSectionRef('settings')}
            className="px-4 sm:px-8 py-8 max-w-4xl mx-auto scroll-mt-16"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <SectionDivider label="Settings" icon={Settings} />
              <SettingsScreen />
            </motion.div>
          </section>

          {/* Bottom breathing room */}
          <div className="h-16" />
        </main>
      </div>

      {/* Mobile Bottom Navigation — scrolls to section */}
      <BottomNavigation activeTab={activeSection} onSelectTab={scrollToSection} />

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

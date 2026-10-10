import React, { useState, useEffect, useRef, useCallback, Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import { DataProvider, useData } from './context/DataContext';
import { Navbar } from './components/Navbar/Navbar';
import { BottomNavigation } from './components/Navbar/BottomNavigation';
import { SpinScreen } from './components/Screens/SpinScreen';
import { ToastContainer } from './components/UI/Toast';
import { RotateCw, BookOpen, BarChart3 } from 'lucide-react';

const LibraryScreen = lazy(() => import('./components/Screens/LibraryScreen').then(m => ({ default: m.LibraryScreen })));
const ProgressScreen = lazy(() => import('./components/Screens/ProgressScreen').then(m => ({ default: m.ProgressScreen })));
const SettingsScreen = lazy(() => import('./components/Screens/SettingsScreen').then(m => ({ default: m.SettingsScreen })));

const SECTIONS = [
  { id: 'spin',     label: 'Spin',     icon: RotateCw,  kbd: '1' },
  { id: 'library',  label: 'Library',  icon: BookOpen,  kbd: '2' },
  { id: 'progress', label: 'Progress', icon: BarChart3, kbd: '3' },
];

class ChunkErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.warn('Chunk load error caught in boundary:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 rounded-2xl border border-error/30 bg-error/5 text-center space-y-3">
          <p className="text-sm font-semibold text-on-surface">Failed to load this section.</p>
          <p className="text-xs text-on-surface-variant">A new version may have been deployed or the network was interrupted.</p>
          <button
            type="button"
            onClick={this.handleRetry}
            className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary-hover transition-colors cursor-pointer"
          >
            Retry Loading
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const HorizontalSeparator = () => (
  <div className="max-w-4xl mx-auto px-4 sm:px-8 my-4">
    <div className="h-px bg-gradient-to-r from-transparent via-outline-variant/30 to-transparent" />
  </div>
);

const MainLayout = () => {
  const [activeSection, setActiveSection] = useState('spin');

  const sectionRefs = useRef({});
  const isScrollingProgrammatically = useRef(false);

  const setSectionRef = useCallback((id) => (el) => {
    sectionRefs.current[id] = el;
  }, []);

  const scrollToSection = useCallback((id) => {
    const el = sectionRefs.current[id];
    if (!el) return;
    isScrollingProgrammatically.current = true;
    setActiveSection(id);
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => { isScrollingProgrammatically.current = false; }, 900);
  }, []);

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

    ['spin', 'library', 'progress', 'settings'].forEach((id) => {
      const el = sectionRefs.current[id];
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Keyboard shortcuts: 1-3 switch tabs
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
      const map = { '1': 'spin', '2': 'library', '3': 'progress' };
      if (map[e.key]) scrollToSection(map[e.key]);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [scrollToSection]);

  return (
    <div className="bg-surface font-sans text-on-surface antialiased min-h-screen flex flex-col selection:bg-primary-container selection:text-white">
      {/* Top Navbar */}
      <Navbar activeTab={activeSection} onNavigateTab={scrollToSection} />

      {/* Main Wrapper */}
      <div className="flex-1 w-full max-w-6xl mx-auto flex pt-14 pb-20 md:pb-8">

        {/* Desktop Sticky Sidebar */}
        <aside className="hidden md:flex flex-col w-60 p-4 sticky top-14 h-[calc(100vh-3.5rem)] border-r border-outline-variant/20 shrink-0">
          <nav className="flex flex-col gap-1.5 flex-1">
            {SECTIONS.map(item => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  data-nav-id={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-primary ${
                    isActive
                      ? 'text-on-surface bg-primary-container/20 border border-primary-container/30 font-bold'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container border border-transparent font-medium'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-primary' : ''} />
                  <span>{item.label}</span>
                  <kbd className="ml-auto font-mono text-[10px] px-1.5 py-0.5 bg-surface-container text-outline rounded border border-outline-variant/30">
                    {item.kbd}
                  </kbd>
                </button>
              );
            })}
          </nav>

          {/* Sidebar Footer space hint */}
          <div className="mt-auto p-3 rounded-xl bg-surface-container-low border border-outline-variant/30">
            <p className="text-xs text-on-surface-variant">
              Press <kbd className="px-1.5 py-0.5 bg-surface-container rounded border border-outline-variant/40 font-mono text-[11px]">Space</kbd> anywhere to spin.
            </p>
          </div>
        </aside>

        {/* Scrollable Content */}
        <main className="flex-1 w-full overflow-x-hidden">

          {/* ── SPIN ── */}
          <section
            id="spin"
            data-section="spin"
            ref={setSectionRef('spin')}
            className="px-4 sm:px-8 pt-4 pb-6 max-w-4xl mx-auto scroll-mt-16"
          >
            <SpinScreen
              onNavigateLibrary={() => scrollToSection('library')}
            />
          </section>

          <HorizontalSeparator />

          {/* ── LIBRARY (MERGED FILTER & EXTRACT) ── */}
          <section
            id="library"
            data-section="library"
            ref={setSectionRef('library')}
            className="px-4 sm:px-8 py-6 max-w-4xl mx-auto scroll-mt-16"
          >
            <ChunkErrorBoundary>
              <Suspense fallback={<div className="h-48 rounded-2xl bg-surface-container-low animate-pulse" />}>
                <LibraryScreen
                  onSpinActivePool={() => scrollToSection('spin')}
                />
              </Suspense>
            </ChunkErrorBoundary>
          </section>

          <HorizontalSeparator />

          {/* ── PROGRESS ── */}
          <section
            id="progress"
            data-section="progress"
            ref={setSectionRef('progress')}
            className="px-4 sm:px-8 py-6 max-w-4xl mx-auto scroll-mt-16"
          >
            <ChunkErrorBoundary>
              <Suspense fallback={<div className="h-48 rounded-2xl bg-surface-container-low animate-pulse" />}>
                <ProgressScreen onReviewTopic={() => scrollToSection('spin')} />
              </Suspense>
            </ChunkErrorBoundary>
          </section>

          <HorizontalSeparator />

          {/* ── SETTINGS ── */}
          <section
            id="settings"
            data-section="settings"
            ref={setSectionRef('settings')}
            className="px-4 sm:px-8 py-6 max-w-4xl mx-auto scroll-mt-16"
          >
            <ChunkErrorBoundary>
              <Suspense fallback={<div className="h-48 rounded-2xl bg-surface-container-low animate-pulse" />}>
                <SettingsScreen />
              </Suspense>
            </ChunkErrorBoundary>
          </section>

          <div className="h-16" />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNavigation activeTab={activeSection} onSelectTab={scrollToSection} />

      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <DataProvider>
      <MainLayout />
    </DataProvider>
  );
}

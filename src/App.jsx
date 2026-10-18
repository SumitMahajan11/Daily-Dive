import React, { useState, useEffect, useRef, useCallback, Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import { DataProvider, useData } from './context/DataContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar/Navbar';
import { BottomNavigation } from './components/Navbar/BottomNavigation';
import { SpinScreen } from './components/Screens/SpinScreen';
import { ToastContainer } from './components/UI/Toast';
import { RotateCw, BookOpen, BarChart3 } from 'lucide-react';

const LibraryScreen = lazy(() => import('./components/Screens/LibraryScreen').then(m => ({ default: m.LibraryScreen })));
const ProgressScreen = lazy(() => import('./components/Screens/ProgressScreen').then(m => ({ default: m.ProgressScreen })));
const SettingsScreen = lazy(() => import('./components/Screens/SettingsScreen').then(m => ({ default: m.SettingsScreen })));
const LoginScreen = lazy(() => import('./components/Screens/LoginScreen').then(m => ({ default: m.LoginScreen })));
const SetNewPasswordScreen = lazy(() => import('./components/Screens/SetNewPasswordScreen').then(m => ({ default: m.SetNewPasswordScreen })));

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

const getScreenFromUrl = () => {
  if (typeof window === 'undefined') return 'spin';
  const hash = window.location.hash.replace(/^#\/?/, '').trim().toLowerCase();
  if (hash.includes('error=') || hash.includes('error_description=')) return 'login';
  if (hash === 'library') return 'library';
  if (hash === 'progress') return 'progress';
  if (hash === 'settings') return 'settings';
  if (hash === 'login' || hash === 'auth') return 'login';
  if (hash === 'spin') return 'spin';

  const search = (window.location.search || '').toLowerCase();
  if (search.includes('error=') || search.includes('error_description=')) return 'login';

  const path = window.location.pathname.trim().toLowerCase();
  if (path === '/library') return 'library';
  if (path === '/progress') return 'progress';
  if (path === '/settings') return 'settings';
  if (path === '/login' || path === '/auth') return 'login';

  return 'spin';
};

const MainLayout = () => {
  const { recovering } = useAuth();
  const [activeSection, setActiveSection] = useState(getScreenFromUrl);
  const [previousTab, setPreviousTab] = useState('spin');
  const [reviewedTopic, setReviewedTopic] = useState(null);
  const [loginNotice, setLoginNotice] = useState(null);
  const [loginMode, setLoginMode] = useState(null);
  const isScrollingProgrammatically = useRef(false);
  const hasUserNavigated = useRef(false);

  const scrollToSection = useCallback((id, instant = false) => {
    hasUserNavigated.current = true;
    if (id === 'settings' || id === 'login') {
      if (activeSection !== 'settings' && activeSection !== 'login') {
        setPreviousTab(activeSection);
      }
      const targetHash = `#/${id}`;
      if (window.location.hash !== targetHash) {
        window.location.hash = targetHash;
      }
      setActiveSection(id);
      window.scrollTo({ top: 0, behavior: 'instant' });
      return;
    }

    setPreviousTab(id);
    setActiveSection(id);
    const targetHash = id === 'spin' ? '#/spin' : `#/${id}`;
    if (window.location.hash !== targetHash) {
      window.location.hash = targetHash;
    }

    const el = document.getElementById(id);
    if (el) {
      isScrollingProgrammatically.current = true;
      const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const behavior = (instant || prefersReducedMotion) ? 'instant' : 'smooth';
      el.scrollIntoView({ behavior, block: 'start' });
      setTimeout(() => {
        isScrollingProgrammatically.current = false;
      }, 850);
    }
  }, [activeSection]);

  const handleReviewTopic = useCallback((topic) => {
    setReviewedTopic(topic ? { ...topic, _revKey: Date.now() } : null);
    scrollToSection('spin');
  }, [scrollToSection]);

  const handleBackFromSettings = useCallback(() => {
    const target = previousTab && previousTab !== 'settings' && previousTab !== 'login' ? previousTab : 'spin';
    if (window.history.length > 1) {
      window.history.back();
    } else {
      scrollToSection(target);
    }
  }, [previousTab, scrollToSection]);

  const handleBackFromLogin = useCallback(() => {
    const target = previousTab && previousTab !== 'settings' && previousTab !== 'login' ? previousTab : 'spin';
    if (window.history.length > 1) {
      window.history.back();
    } else {
      scrollToSection(target);
    }
  }, [previousTab, scrollToSection]);

  const handleLoginSuccess = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.location.hash = '#/spin';
    }
    scrollToSection('spin');
  }, [scrollToSection]);

  const handlePasswordResetSuccess = useCallback((message) => {
    setLoginNotice(message || 'Password updated. Log in with your new password.');
    setLoginMode('login');
    scrollToSection('login');
  }, [scrollToSection]);

  const handleGoToForgot = useCallback(() => {
    setLoginNotice(null);
    setLoginMode('forgot');
    scrollToSection('login');
  }, [scrollToSection]);

  // Initial deep link scroll
  useEffect(() => {
    const markUserInteraction = () => {
      hasUserNavigated.current = true;
    };

    window.addEventListener('wheel', markUserInteraction, { passive: true });
    window.addEventListener('touchstart', markUserInteraction, { passive: true });
    window.addEventListener('touchmove', markUserInteraction, { passive: true });
    window.addEventListener('keydown', markUserInteraction, { passive: true });
    window.addEventListener('pointerdown', markUserInteraction, { passive: true });
    window.addEventListener('popstate', markUserInteraction);

    const initialScreen = getScreenFromUrl();
    let t1, t2;
    if (initialScreen && initialScreen !== 'settings' && initialScreen !== 'login') {
      const doScroll = () => {
        if (hasUserNavigated.current) return;
        const el = document.getElementById(initialScreen);
        if (el) {
          el.scrollIntoView({ behavior: 'instant', block: 'start' });
        }
      };
      doScroll();
      t1 = setTimeout(doScroll, 120);
      t2 = setTimeout(doScroll, 350);
    }

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener('wheel', markUserInteraction);
      window.removeEventListener('touchstart', markUserInteraction);
      window.removeEventListener('touchmove', markUserInteraction);
      window.removeEventListener('keydown', markUserInteraction);
      window.removeEventListener('pointerdown', markUserInteraction);
      window.removeEventListener('popstate', markUserInteraction);
    };
  }, []);

  // History and URL change listener
  useEffect(() => {
    const handleUrlChange = () => {
      const screen = getScreenFromUrl();
      if (screen === 'settings' || screen === 'login') {
        setActiveSection(screen);
        window.scrollTo({ top: 0, behavior: 'instant' });
      } else {
        scrollToSection(screen, false);
      }
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, [scrollToSection]);

  // Active section tracking via IntersectionObserver
  useEffect(() => {
    if (activeSection === 'settings' || activeSection === 'login') return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (isScrollingProgrammatically.current) return;
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.target.dataset.section) {
            setActiveSection(entry.target.dataset.section);
          }
        });
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: 0 }
    );

    ['spin', 'progress', 'library'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [activeSection]);

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
                  aria-current={isActive ? 'page' : undefined}
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

        {/* Scrollable Content, Full-Screen Settings View, Login View, or Set New Password View */}
        {recovering ? (
          <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-8 py-6">
            <ChunkErrorBoundary>
              <Suspense fallback={<div className="h-48 rounded-2xl bg-surface-container-low animate-pulse" />}>
                <SetNewPasswordScreen
                  onSuccess={handlePasswordResetSuccess}
                  onGoToForgot={handleGoToForgot}
                />
              </Suspense>
            </ChunkErrorBoundary>
            <div className="h-28" />
          </main>
        ) : activeSection === 'settings' ? (
          <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-8 py-6">
            <ChunkErrorBoundary>
              <Suspense fallback={<div className="h-48 rounded-2xl bg-surface-container-low animate-pulse" />}>
                <SettingsScreen onBack={handleBackFromSettings} />
              </Suspense>
            </ChunkErrorBoundary>
            <div className="h-28" />
          </main>
        ) : activeSection === 'login' ? (
          <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-8 py-6">
            <ChunkErrorBoundary>
              <Suspense fallback={<div className="h-48 rounded-2xl bg-surface-container-low animate-pulse" />}>
                <LoginScreen
                  onBack={handleBackFromLogin}
                  onSuccess={handleLoginSuccess}
                  initialNotice={loginNotice}
                  initialMode={loginMode}
                />
              </Suspense>
            </ChunkErrorBoundary>
            <div className="h-28" />
          </main>
        ) : (
          <main className="flex-1 w-full overflow-x-hidden">
            {/* 1) Spin (id="spin") */}
            <section
              id="spin"
              data-section="spin"
              className="px-4 sm:px-8 pt-4 pb-6 max-w-4xl mx-auto scroll-mt-16"
            >
              <SpinScreen
                onNavigateLibrary={() => scrollToSection('library')}
                reviewedTopic={reviewedTopic}
                onConsumeReview={() => setReviewedTopic(null)}
              />
            </section>

            <HorizontalSeparator />

            {/* 2) Progress (id="progress") */}
            <section
              id="progress"
              data-section="progress"
              className="px-4 sm:px-8 py-6 max-w-4xl mx-auto scroll-mt-16"
            >
              <ChunkErrorBoundary>
                <Suspense fallback={<div className="h-48 rounded-2xl bg-surface-container-low animate-pulse" />}>
                  <ProgressScreen onReviewTopic={handleReviewTopic} />
                </Suspense>
              </ChunkErrorBoundary>
            </section>

            <HorizontalSeparator />

            {/* 3) Library (id="library") */}
            <section
              id="library"
              data-section="library"
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

            <div className="h-28" />
          </main>
        )}
      </div>

      {/* Mobile Bottom Navigation */}
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

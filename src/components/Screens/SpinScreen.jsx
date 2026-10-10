import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { useData } from '../../context/DataContext';
import { AudioController } from '../../lib/audio';
import { CATEGORY_TREE } from '../../lib/roulette';
import {
  RotateCw,
  BookOpen,
  ExternalLink,
  Bot,
  Cloud,
  Binary,
  Cpu,
  Globe,
  Wallet,
  MessageSquare,
  Compass,
  Brain,
  Check,
  Sparkles,
  Share2,
  Clock,
  Briefcase,
  Atom,
  Landmark,
  X,
  Flame,
  Layers
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Button } from '../UI/Button';
import { Skeleton } from '../UI/Skeleton';

import { requestStoragePersistence, isIOSSafariNonStandalone } from '../../lib/storage';

// Visual metadata for categories
const CATEGORY_META = {
  'ai-ml': { icon: Bot, shortLabel: 'AI & Machine Learning', bgBadge: 'bg-primary/15 text-primary border-primary/30', accentColor: '#e06841' },
  'cloud-infra': { icon: Cloud, shortLabel: 'Cloud & Infrastructure', bgBadge: 'bg-primary/10 text-primary border-primary/25', accentColor: '#d95a32' },
  'data-structures-algorithms': { icon: Binary, shortLabel: 'Algorithms & Data', bgBadge: 'bg-primary-fixed-dim/25 text-inverse-primary border-inverse-primary/30', accentColor: '#e87a52' },
  'systems-distributed-computing': { icon: Cpu, shortLabel: 'Distributed Systems', bgBadge: 'bg-primary/10 text-primary border-primary/20', accentColor: '#c5532b' },
  'web-dev': { icon: Globe, shortLabel: 'Web Architecture', bgBadge: 'bg-primary-fixed/30 text-primary-fixed-dim border-primary-fixed-dim/40', accentColor: '#e87a52' },
  'finance': { icon: Wallet, shortLabel: 'Finance & Capital', bgBadge: 'bg-tertiary/15 text-tertiary border-tertiary/30', accentColor: '#f59e0b' },
  'communication': { icon: MessageSquare, shortLabel: 'Communication', bgBadge: 'bg-secondary/15 text-secondary border-secondary/30', accentColor: '#94a88f' },
  'philosophy-critical-thinking': { icon: Compass, shortLabel: 'Mental Models', bgBadge: 'bg-secondary-fixed-dim/25 text-secondary-fixed-dim border-secondary-fixed-dim/30', accentColor: '#a3b89e' },
  'psychology': { icon: Brain, shortLabel: 'Cognitive Psychology', bgBadge: 'bg-secondary/10 text-secondary border-secondary/20', accentColor: '#84977f' },
  'career-strategy': { icon: Briefcase, shortLabel: 'Career Strategy', bgBadge: 'bg-tertiary/10 text-tertiary border-tertiary/25', accentColor: '#eab308' },
  'science-nature': { icon: Atom, shortLabel: 'Science & Cosmos', bgBadge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/25', accentColor: '#06b6d4' },
  'history-innovation': { icon: Landmark, shortLabel: 'History of Ideas', bgBadge: 'bg-amber-500/10 text-amber-400 border-amber-500/25', accentColor: '#f59e0b' }
};

export const BASE_REEL_CATEGORIES = CATEGORY_TREE.flatMap(groupDef =>
  groupDef.categories.map(cat => {
    const meta = CATEGORY_META[cat.name] || {
      icon: Cpu,
      shortLabel: cat.label,
      bgBadge: 'bg-primary/10 text-primary border-primary/20',
      accentColor: '#e06841'
    };
    return {
      group: groupDef.group,
      groupLabel: groupDef.label,
      name: cat.name,
      label: cat.label,
      ...meta
    };
  })
);

const REPEAT_COUNT = 14;
const ITEM_WIDTH = 144;
const ITEM_GAP = 12;
const ITEM_STEP = ITEM_WIDTH + ITEM_GAP; // 156px
const SPIN_DURATION_MS = 2800;
const SPIN_EASING = [0.12, 0.98, 0.24, 1.0];

const PrecisionReelCard = ({ item, idx, motionX, containerWidth, isSelectedTarget }) => {
  const Icon = item.icon;
  const cardCenter = idx * ITEM_STEP + ITEM_WIDTH / 2;

  const scale = useTransform(motionX, (curX) => {
    const dist = Math.abs(curX + cardCenter - containerWidth / 2);
    const t = Math.min(1, dist / (2.2 * ITEM_STEP));
    return 1.0 - (t * 0.14);
  });

  const opacity = useTransform(motionX, (curX) => {
    const dist = Math.abs(curX + cardCenter - containerWidth / 2);
    const t = Math.min(1, dist / (2.4 * ITEM_STEP));
    return 1.0 - (t * 0.65);
  });

  return (
    <motion.div
      style={{ width: `${ITEM_WIDTH}px`, scale, opacity }}
      className="shrink-0 flex items-center justify-center select-none"
    >
      <div
        className={`w-full h-22 rounded-2xl p-2.5 flex flex-col justify-between transition-all duration-300 relative overflow-hidden ${
          isSelectedTarget
            ? 'bg-surface-container-high border-2 border-primary ring-4 ring-primary/20 shadow-xl'
            : 'bg-surface-container-low/90 dark:bg-surface-container-lowest/80 border border-outline-variant/30 shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between relative z-10">
          <span className={`text-[10px] font-mono uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-full border ${item.bgBadge}`}>
            {item.groupLabel}
          </span>
          <div className={`w-5 h-5 rounded-md flex items-center justify-center bg-surface-container ${isSelectedTarget ? 'text-primary' : 'text-on-surface-variant'}`}>
            <Icon size={12} />
          </div>
        </div>

        <div className="relative z-10">
          <div className="text-xs font-semibold text-on-surface truncate leading-tight">
            {item.shortLabel}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const SpinScreen = ({ onNavigateLibrary, onNavigateFilter, onNavigateExtract }) => {
  const navigateToLibrary = onNavigateLibrary || onNavigateFilter || onNavigateExtract;
  const {
    topics,
    eligibleTopics,
    currentTopic,
    userProgressMap,
    userSettings,
    userStreaks,
    effectiveStreak,
    history = [],
    updateSettings,
    spinNextTopic,
    markCurrentTopicLearned,
    isMarkingLearned,
    showToast,
    loadingData
  } = useData();

  const [showFirstRunPicker, setShowFirstRunPicker] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !localStorage.getItem('daily_dive_first_run_dismissed');
  });

  const [showSafariNudge, setShowSafariNudge] = useState(() => {
    if (typeof window === 'undefined') return false;
    if (localStorage.getItem('daily_dive_safari_nudge_dismissed')) return false;
    return isIOSSafariNonStandalone();
  });

  const handleDismissSafariNudge = () => {
    setShowSafariNudge(false);
    try {
      localStorage.setItem('daily_dive_safari_nudge_dismissed', 'true');
    } catch (e) {}
  };

  // Derive active reel categories strictly from enabled categories & custom pool
  const activeReelCategories = useMemo(() => {
    const enabledMap = userSettings?.enabled_categories || {};
    const filtered = BASE_REEL_CATEGORIES.filter(cat => {
      if (enabledMap[cat.group] === false) return false;
      if (enabledMap[`${cat.group}::${cat.name}`] === false) return false;
      return true;
    });

    const hasCustom = (topics || []).some(t => t.is_custom);
    if (hasCustom && enabledMap['custom'] !== false) {
      filtered.push({
        group: 'custom',
        groupLabel: 'Custom',
        name: 'custom-notes',
        label: 'Custom Notes',
        icon: Sparkles,
        shortLabel: 'Custom Notes',
        bgBadge: 'bg-primary/15 text-primary border-primary/30',
        accentColor: '#e06841'
      });
    }

    return filtered.length > 0 ? filtered : BASE_REEL_CATEGORIES;
  }, [userSettings?.enabled_categories, topics]);

  const reelStrip = useMemo(() => {
    return Array.from({ length: REPEAT_COUNT }, (_, r) =>
      activeReelCategories.map(cat => ({ ...cat, repeatIdx: r }))
    ).flat();
  }, [activeReelCategories]);

  const toggleBroadGroup = (groupKey) => {
    const groupDef = CATEGORY_TREE.find(g => g.group === groupKey);
    if (!groupDef) return;
    const currentCategories = { ...(userSettings?.enabled_categories || {}) };
    
    const isCurrentlyOn = currentCategories[groupKey] !== false;
    const activeCount = CATEGORY_TREE.filter(g => currentCategories[g.group] !== false).length;
    
    if (isCurrentlyOn && activeCount <= 1) {
      if (showToast) showToast('At least one topic group must remain active.', 'warning');
      return;
    }

    const nextState = !isCurrentlyOn;
    currentCategories[groupKey] = nextState;
    groupDef.categories.forEach(cat => {
      currentCategories[`${groupKey}::${cat.name}`] = nextState;
    });

    updateSettings({ enabled_categories: currentCategories });
  };

  const handleDismissFirstRun = () => {
    setShowFirstRunPicker(false);
    try {
      localStorage.setItem('daily_dive_first_run_dismissed', 'true');
    } catch (e) {}
  };

  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(580);
  const [isSpinning, setIsSpinning] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [isLanded, setIsLanded] = useState(false);
  const [showLandingHalo, setShowLandingHalo] = useState(false);
  const [activeAccentColor, setActiveAccentColor] = useState('#e06841');

  const [reelIndex, setReelIndex] = useState(() => {
    const initCat = currentTopic?.category || currentTopic?.sub;
    const foundIdx = activeReelCategories.findIndex(c => c.name === initCat);
    return (3 * activeReelCategories.length) + (foundIdx >= 0 ? foundIdx : 0);
  });

  const translateX = (containerWidth - ITEM_WIDTH) / 2 - (reelIndex * ITEM_STEP);
  const motionX = useMotionValue(translateX);

  useEffect(() => {
    if (!isSpinning) {
      motionX.set(translateX);
    }
  }, [translateX, isSpinning, motionX]);

  const lastFiredIndexRef = useRef(-1);
  const spinStartTimeRef = useRef(0);
  const isSpinningRef = useRef(false);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };
    updateWidth();
    const ro = new ResizeObserver(updateWidth);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Keyboard shortcut: Space triggers spin
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && !['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
        e.preventDefault();
        handleSpin();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSpinning, eligibleTopics, showToast, navigateToLibrary]);

  const handleSpin = () => {
    if (isSpinning) return;

    if (eligibleTopics.length === 0) {
      if (showToast) {
        showToast('All topics are currently filtered out. Choose interests in Library to spin.', 'warning');
      }
      if (navigateToLibrary) navigateToLibrary();
      return;
    }

    isSpinningRef.current = true;
    spinStartTimeRef.current = Date.now();
    lastFiredIndexRef.current = Math.round(((containerWidth - ITEM_WIDTH) / 2 - translateX) / ITEM_STEP);

    setIsSpinning(true);
    setShowResult(false);
    setIsLanded(false);
    setShowLandingHalo(false);

    AudioController.init();
    AudioController.playWhoosh(SPIN_DURATION_MS);

    const selected = spinNextTopic();

    // Call persistent storage request after completed/triggered spin
    requestStoragePersistence().catch(() => {});

    const targetCat = selected?.category || selected?.sub;
    let foundIdx = activeReelCategories.findIndex(c => c.name === targetCat);
    if (foundIdx < 0 && selected?.is_custom) {
      foundIdx = activeReelCategories.findIndex(c => c.name === 'custom-notes');
    }
    const baseIndex = foundIdx >= 0 ? foundIdx : 0;

    const currentBase = reelIndex % activeReelCategories.length;
    let forwardOffset = baseIndex - currentBase;
    if (forwardOffset <= 0) forwardOffset += activeReelCategories.length;
    const travelCards = (4 * activeReelCategories.length) + forwardOffset;
    const targetIndex = reelIndex + travelCards;
    setReelIndex(targetIndex);

    setTimeout(() => {
      isSpinningRef.current = false;
      setIsSpinning(false);
      setShowResult(true);
      setIsLanded(true);

      const landedCatDef = activeReelCategories[baseIndex];
      AudioController.playLanding();
      setActiveAccentColor(landedCatDef?.accentColor || '#e06841');
      setShowLandingHalo(true);
      setTimeout(() => setShowLandingHalo(false), 800);

      try {
        confetti({
          particleCount: 45,
          spread: 70,
          origin: { y: 0.62 },
          colors: ['#e06841', '#f59e0b', '#94a88f', '#ff8c69']
        });
      } catch (e) {}

      if (userSettings?.haptics_enabled && navigator.vibrate) {
        try { navigator.vibrate([30, 50, 90]); } catch (e) {}
      }

      setTimeout(() => {
        setReelIndex(prev => (prev % activeReelCategories.length) + (3 * activeReelCategories.length));
      }, 500);
    }, SPIN_DURATION_MS);
  };

  const handleMarkLearned = async () => {
    await markCurrentTopicLearned();
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#e06841', '#f59e0b', '#94a88f']
      });
    } catch (e) {}
    if (showToast) {
      showToast('Topic recorded in your journal!', 'success');
    }
  };

  const handleCopySummary = () => {
    if (!currentTopic) return;
    const textToCopy = `Daily Dive: ${currentTopic.title}\n\n${currentTopic.description || currentTopic.desc}\n\nLearn more: https://daily-dive.vercel.app`;
    try {
      navigator.clipboard.writeText(textToCopy);
      if (showToast) {
        showToast('Topic insight copied to clipboard!', 'info');
      }
    } catch (e) {
      if (showToast) showToast('Could not copy text', 'error');
    }
  };

  const streak = (effectiveStreak || userStreaks)?.current_streak || 0;
  
  // Calculate review queue count
  const toReviewCount = useMemo(() => {
    return Object.values(userProgressMap || {}).filter(p => (p.times_seen || 0) > 0).length;
  }, [userProgressMap]);

  const topicProgress = currentTopic ? userProgressMap[currentTopic.id] : null;
  const isLearned = topicProgress && topicProgress.times_seen > 0;
  const group = currentTopic?.group_name || currentTopic?.group || 'General';
  const category = currentTopic?.category || currentTopic?.sub || '';
  const resources = currentTopic?.resources || currentTopic?.links || [];

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto pb-4">
      
      {/* ── FIRST-RUN ONBOARDING (WELCOME & INTEREST PICKER ONLY) ── */}
      <AnimatePresence>
        {showFirstRunPicker && (
          <motion.div
            data-testid="first-run-picker"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="w-full mb-4"
          >
            <div className="journal-card rounded-2xl p-4 sm:p-5 border border-primary/30 bg-surface-container-low shadow-lg relative">
              <button
                type="button"
                onClick={handleDismissFirstRun}
                className="absolute top-3.5 right-3.5 p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
                title="Dismiss welcome guide"
                aria-label="Dismiss welcome guide"
              >
                <X size={16} />
              </button>

              <h1 className="font-display text-lg sm:text-xl font-bold text-on-surface">
                Welcome to Daily Dive
              </h1>
              <p className="text-sm text-on-surface-variant mt-1 leading-relaxed">
                Spin the dial to discover one bite-sized concept every day across technology, career, mental models, and world ideas.
              </p>
              <p className="text-xs text-on-surface-variant/80 mt-1">
                All data is stored locally on your device with zero tracking.
              </p>

              {/* Four Category Group Cards: All preselected */}
              <div className="mt-3.5 pt-3 border-t border-outline-variant/20">
                <div className="text-xs font-semibold text-on-surface mb-2">
                  Choose your interests (at least one required):
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {CATEGORY_TREE.map(groupDef => {
                    const isGroupActive = userSettings?.enabled_categories?.[groupDef.group] !== false;
                    return (
                      <button
                        key={groupDef.group}
                        type="button"
                        onClick={() => toggleBroadGroup(groupDef.group)}
                        className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition-all cursor-pointer select-none min-h-[56px] ${
                          isGroupActive
                            ? 'bg-primary-container/20 border-primary/40 text-on-surface shadow-xs'
                            : 'bg-surface-container-lowest/60 border-outline-variant/30 text-on-surface-variant hover:border-outline-variant/60'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-0.5">
                          <span className={`text-xs font-bold ${isGroupActive ? 'text-primary' : 'text-on-surface-variant'}`}>
                            {groupDef.label}
                          </span>
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold ${isGroupActive ? 'bg-primary text-white' : 'bg-surface-container text-outline'}`}>
                            {isGroupActive ? '✓' : ''}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-3.5 pt-3 border-t border-outline-variant/20 flex items-center justify-end">
                <Button
                  variant="primary"
                  onClick={handleDismissFirstRun}
                  className="h-10 px-5 text-sm font-semibold cursor-pointer"
                >
                  Start exploring
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── RETURNING USER SLIM STATUS LINE ── */}
      {!showFirstRunPicker && (streak >= 1 || toReviewCount > 0) && (
        <div
          data-testid="spin-status-line"
          className="flex items-center justify-center gap-2 mb-2 text-xs font-medium text-on-surface-variant"
        >
          {streak >= 1 && (
            <span className="inline-flex items-center gap-1 font-semibold text-primary">
              <Flame size={13} className="text-amber-500 fill-amber-500" />
              {streak}-day streak
            </span>
          )}
          {streak >= 1 && toReviewCount > 0 && <span>·</span>}
          {toReviewCount > 0 && (
            <span>
              {toReviewCount} to review
            </span>
          )}
        </div>
      )}

      {/* ── QUIET DISMISSIBLE IOS SAFARI NON-STANDALONE NUDGE ── */}
      {showSafariNudge && (
        <div
          data-testid="ios-safari-install-nudge"
          className="w-full mb-3 p-3 rounded-xl bg-surface-container-low border border-outline-variant/30 flex items-center justify-between text-xs text-on-surface-variant gap-2"
        >
          <span>Add to Home Screen to keep your progress safe.</span>
          <button
            type="button"
            onClick={handleDismissSafariNudge}
            className="p-1 text-on-surface-variant hover:text-on-surface cursor-pointer text-sm leading-none"
            aria-label="Dismiss Home Screen tip"
          >
            ×
          </button>
        </div>
      )}

      {/* ── REEL CHASSIS ── */}
      <div className="w-full py-1 relative flex flex-col items-center">
        <div
          ref={containerRef}
          className="relative w-full h-28 sm:h-32 overflow-hidden rounded-3xl dial-chassis flex items-center select-none shadow-xl"
        >
          <AnimatePresence>
            {showLandingHalo && (
              <motion.div
                key="landing-halo"
                initial={{ opacity: 0.8, scale: 0.4 }}
                animate={{ opacity: 0, scale: 2.8 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.75, ease: 'easeOut' }}
                style={{ backgroundColor: activeAccentColor }}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full blur-3xl pointer-events-none z-10"
              />
            )}
          </AnimatePresence>

          {/* Center Precision Target Aperture */}
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center justify-between pointer-events-none w-10">
            <div className="flex flex-col items-center -mt-0.5 filter drop-shadow">
              <div className="w-3.5 h-3.5 bg-primary rotate-45 border-2 border-surface shadow-[0_0_12px_rgba(var(--color-primary),0.8)]" />
              <div className="w-[1.5px] h-2.5 bg-primary" />
            </div>

            <div className="relative flex items-center justify-center">
              <div className={`w-3.5 h-3.5 rounded-full border border-primary/60 flex items-center justify-center transition-all duration-300 ${isSpinning ? 'scale-125 border-primary shadow-[0_0_10px_rgba(var(--color-primary),0.8)]' : isLanded ? 'scale-110 border-primary ring-2 ring-primary/40' : 'scale-90'}`}>
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              </div>
            </div>

            <div className="flex flex-col items-center -mb-0.5 filter drop-shadow">
              <div className="w-[1.5px] h-2.5 bg-primary" />
              <div className="w-3.5 h-3.5 bg-primary rotate-45 border-2 border-surface shadow-[0_0_12px_rgba(var(--color-primary),0.8)]" />
            </div>
          </div>

          {/* Vignette Edge Shadow Masks */}
          <div className="absolute inset-y-0 left-0 w-16 sm:w-28 bg-gradient-to-r from-surface via-surface/80 to-transparent z-20 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-16 sm:w-28 bg-gradient-to-l from-surface via-surface/80 to-transparent z-20 pointer-events-none" />

          {/* Kinetic Card Strip */}
          <motion.div
            className="flex items-center absolute left-0"
            style={{ gap: `${ITEM_GAP}px` }}
            animate={{ x: translateX }}
            transition={
              isSpinning
                ? { duration: SPIN_DURATION_MS / 1000, ease: SPIN_EASING }
                : { duration: 0 }
            }
            onUpdate={(latest) => {
              const curX = typeof latest.x === 'number' ? latest.x : parseFloat(latest.x);
              if (isNaN(curX)) return;
              motionX.set(curX);

              if (isSpinningRef.current) {
                const nearestIdx = Math.round(((containerWidth - ITEM_WIDTH) / 2 - curX) / ITEM_STEP);
                if (nearestIdx !== lastFiredIndexRef.current) {
                  lastFiredIndexRef.current = nearestIdx;
                  const elapsed = Date.now() - spinStartTimeRef.current;
                  const progress = Math.min(1, Math.max(0, elapsed / SPIN_DURATION_MS));
                  AudioController.playTick(progress);
                }
              }
            }}
          >
            {reelStrip.map((item, idx) => (
              <PrecisionReelCard
                key={`${item.name}-${idx}`}
                item={item}
                idx={idx}
                motionX={motionX}
                containerWidth={containerWidth}
                isSelectedTarget={isLanded && (idx === reelIndex)}
              />
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── PRIMARY SPIN BUTTON OR EMPTY POOL STATE ── */}
      {eligibleTopics.length === 0 ? (
        <div data-testid="empty-spin-pool" className="mt-4 w-full journal-card rounded-2xl p-6 text-center flex flex-col items-center justify-center border border-outline-variant/30">
          <h2 className="font-display text-base font-bold text-on-surface">No active topics</h2>
          <p className="text-sm text-on-surface-variant mt-1 max-w-sm">
            Enable categories or add custom notes in your Library to spin.
          </p>
          <Button
            variant="primary"
            onClick={navigateToLibrary}
            className="mt-3.5 h-11 px-5 text-sm font-semibold cursor-pointer"
          >
            Choose interests
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center my-3">
          <Button
            variant="primary"
            data-testid="primary-spin-button"
            onClick={handleSpin}
            disabled={isSpinning || loadingData}
            className="w-full max-w-sm h-12 text-sm font-semibold tracking-wide shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all cursor-pointer relative overflow-hidden"
          >
            <RotateCw
              size={17}
              className={`transition-transform ${isSpinning ? 'animate-spin' : 'group-hover:rotate-45'}`}
            />
            <span>{isSpinning ? 'Spinning...' : 'Spin'}</span>
            <span className="hidden [@media(pointer:fine)]:inline text-xs opacity-75 font-normal ml-1.5">
              (Space)
            </span>
          </Button>
        </div>
      )}

      {/* ── POST-SPIN TOPIC CARD ── */}
      {loadingData ? (
        <div className="mt-3 w-full journal-card rounded-2xl p-5 sm:p-6 space-y-3">
          <Skeleton className="h-4 w-32 rounded" />
          <Skeleton className="h-8 w-3/4 rounded-lg" />
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-5/6 rounded" />
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {showResult && currentTopic && (
            <motion.article
              key={currentTopic.id}
              data-testid="post-spin-topic-card"
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="mt-3 w-full journal-card rounded-2xl p-5 sm:p-7 relative transition-all duration-300 border border-outline-variant/30"
            >
              {/* Category Breadcrumb & Read Time */}
              <div className="flex items-center justify-between pb-3 mb-3.5 border-b border-outline-variant/20 flex-wrap gap-2">
                <div className="flex items-center gap-2 text-xs font-medium">
                  <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold uppercase tracking-wider text-[10px]">
                    {group}
                  </span>
                  <span className="text-outline">/</span>
                  <span className="text-on-surface font-semibold">{category}</span>
                </div>

                <div className="flex items-center gap-2">
                  {currentTopic?.is_custom && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-semibold">
                      <Sparkles size={12} />
                      <span>Custom Note</span>
                    </span>
                  )}

                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-xs">
                    <Clock size={12} className="text-outline" />
                    <span>~2 min dive</span>
                  </div>
                </div>
              </div>

              {/* Topic Headline (H2 for clear hierarchy) */}
              <h2 className="editorial-title text-xl sm:text-2xl lg:text-3xl font-bold text-on-surface tracking-tight leading-snug">
                {currentTopic.title}
              </h2>

              {/* Topic Description */}
              <div className="mt-3.5 text-sm sm:text-base text-on-surface/90 leading-relaxed font-normal space-y-2">
                <p className="leading-relaxed">
                  {currentTopic.description || currentTopic.desc}
                </p>
              </div>

              {/* References & Deep Dives (Prominent Cards) */}
              {resources.length > 0 && (
                <div className="mt-5 pt-4 border-t border-outline-variant/20">
                  <div className="text-xs font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5 mb-2.5">
                    <BookOpen size={13} className="text-primary" />
                    <span>Go deeper</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {resources.map((res, i) => (
                      <a
                        key={i}
                        href={res.url || '#'}
                        rel="noopener noreferrer"
                        target="_blank"
                        className="group flex flex-col justify-between p-3 rounded-xl bg-surface-container/70 hover:bg-surface-container border border-outline-variant/30 hover:border-primary/50 transition-all shadow-xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="px-1.5 py-0.5 rounded bg-surface-container-high text-primary text-[10px] font-mono uppercase font-bold tracking-wider">
                            {res.type || 'SOURCE'}
                          </span>
                          <ExternalLink size={14} className="text-on-surface-variant group-hover:text-primary transition-colors shrink-0" />
                        </div>
                        <div className="mt-1.5">
                          <span className="text-xs sm:text-sm text-on-surface font-semibold group-hover:text-primary transition-colors line-clamp-1">
                            {res.label || res.title || 'Explore Reference'}
                          </span>
                          {res.desc && (
                            <p className="text-xs text-on-surface-variant line-clamp-2 mt-0.5 leading-snug">
                              {res.desc}
                            </p>
                          )}
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Toolbar */}
              <div className="mt-6 pt-4 border-t border-outline-variant/20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                <Button
                  variant={isLearned ? 'outline' : 'primary'}
                  onClick={handleMarkLearned}
                  disabled={isMarkingLearned}
                  className={`h-11 px-4 text-sm font-semibold flex-1 shadow-xs cursor-pointer ${
                    isLearned ? 'border-emerald-500/40 text-emerald-500 bg-emerald-500/10' : ''
                  }`}
                >
                  {isMarkingLearned ? (
                    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  ) : (
                    <Check size={16} className={isLearned ? 'text-emerald-500' : ''} />
                  )}
                  <span>{isLearned ? 'Learned' : 'Mark as learned'}</span>
                </Button>

                <Button
                  variant="ghost"
                  onClick={handleSpin}
                  disabled={isSpinning}
                  className="h-11 px-4 text-sm font-medium border border-outline-variant/30 hover:border-outline-variant/60 cursor-pointer"
                >
                  <RotateCw size={15} />
                  <span>Spin again</span>
                </Button>

                <button
                  type="button"
                  onClick={handleCopySummary}
                  aria-label="Copy summary"
                  title="Copy summary to clipboard"
                  className="h-11 w-11 rounded-xl border border-outline-variant/30 hover:border-outline-variant/60 flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer shrink-0"
                >
                  <Share2 size={16} />
                </button>
              </div>

            </motion.article>
          )}
        </AnimatePresence>
      )}

    </div>
  );
};

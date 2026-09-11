import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '../../context/DataContext';
import { AudioController } from '../../lib/audio';
import { CATEGORY_TREE } from '../../lib/roulette';
import {
  RotateCw,
  BookOpen,
  ExternalLink,
  FilterX,
  Bot,
  Cloud,
  Binary,
  Cpu,
  Globe,
  Wallet,
  MessageSquare,
  Compass,
  Brain,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Button } from '../UI/Button';

// Category metadata: icons, short display labels, and group token styles
const CATEGORY_META = {
  'ai-ml': {
    icon: Bot,
    shortLabel: 'AI & ML',
    groupColor: 'text-primary',
    bgBadge: 'bg-primary/10 text-primary border-primary/20',
    borderActive: 'border-primary',
    glow: 'shadow-primary/30'
  },
  'cloud-infra': {
    icon: Cloud,
    shortLabel: 'Cloud & Infra',
    groupColor: 'text-primary',
    bgBadge: 'bg-primary/10 text-primary border-primary/20',
    borderActive: 'border-primary',
    glow: 'shadow-primary/30'
  },
  'data-structures-algorithms': {
    icon: Binary,
    shortLabel: 'DSA',
    groupColor: 'text-primary',
    bgBadge: 'bg-primary/10 text-primary border-primary/20',
    borderActive: 'border-primary',
    glow: 'shadow-primary/30'
  },
  'systems-distributed-computing': {
    icon: Cpu,
    shortLabel: 'Systems',
    groupColor: 'text-primary',
    bgBadge: 'bg-primary/10 text-primary border-primary/20',
    borderActive: 'border-primary',
    glow: 'shadow-primary/30'
  },
  'web-dev': {
    icon: Globe,
    shortLabel: 'Web Dev',
    groupColor: 'text-primary',
    bgBadge: 'bg-primary/10 text-primary border-primary/20',
    borderActive: 'border-primary',
    glow: 'shadow-primary/30'
  },
  'finance': {
    icon: Wallet,
    shortLabel: 'Finance',
    groupColor: 'text-tertiary',
    bgBadge: 'bg-tertiary/10 text-tertiary border-tertiary/20',
    borderActive: 'border-tertiary',
    glow: 'shadow-tertiary/30'
  },
  'communication': {
    icon: MessageSquare,
    shortLabel: 'Communication',
    groupColor: 'text-secondary',
    bgBadge: 'bg-secondary/10 text-secondary border-secondary/20',
    borderActive: 'border-secondary',
    glow: 'shadow-secondary/30'
  },
  'philosophy-critical-thinking': {
    icon: Compass,
    shortLabel: 'Philosophy',
    groupColor: 'text-secondary',
    bgBadge: 'bg-secondary/10 text-secondary border-secondary/20',
    borderActive: 'border-secondary',
    glow: 'shadow-secondary/30'
  },
  'psychology': {
    icon: Brain,
    shortLabel: 'Psychology',
    groupColor: 'text-secondary',
    bgBadge: 'bg-secondary/10 text-secondary border-secondary/20',
    borderActive: 'border-secondary',
    glow: 'shadow-secondary/30'
  }
};

// Dynamically derived list of real categories from CATEGORY_TREE
const REEL_CATEGORIES = CATEGORY_TREE.flatMap(groupDef =>
  groupDef.categories.map(cat => {
    const meta = CATEGORY_META[cat.name] || {
      icon: Cpu,
      shortLabel: cat.label,
      groupColor: 'text-primary',
      bgBadge: 'bg-primary/10 text-primary border-primary/20',
      borderActive: 'border-primary',
      glow: 'shadow-primary/30'
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

// Repeated sequence to create a long horizontal reel strip
const REPEAT_COUNT = 12;
const REEL_STRIP = Array.from({ length: REPEAT_COUNT }, (_, r) =>
  REEL_CATEGORIES.map(cat => ({ ...cat, repeatIdx: r }))
).flat();

const ITEM_WIDTH = 148;
const ITEM_GAP = 12;
const ITEM_STEP = ITEM_WIDTH + ITEM_GAP; // 160px

export const SpinScreen = ({ onNavigateFilter }) => {
  const {
    topics,
    eligibleTopics,
    currentTopic,
    userProgressMap,
    userSettings,
    spinNextTopic,
    markCurrentTopicLearned,
    isMarkingLearned,
    showToast
  } = useData();

  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(580);
  const [isSpinning, setIsSpinning] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [isLanded, setIsLanded] = useState(false);
  const [reelIndex, setReelIndex] = useState(() => {
    const initCat = currentTopic?.category || currentTopic?.sub;
    const foundIdx = REEL_CATEGORIES.findIndex(c => c.name === initCat);
    return (2 * REEL_CATEGORIES.length) + (foundIdx >= 0 ? foundIdx : 0);
  });
  const [tickerText, setTickerText] = useState(`Ready to spin · ${eligibleTopics?.length ?? 0} topics active in pool`);
  const [tickerActive, setTickerActive] = useState(false);

  // Keep ticker text in sync with active pool size when idle
  useEffect(() => {
    if (!isSpinning && !isLanded) {
      setTickerText(`Ready to spin · ${eligibleTopics?.length ?? 0} topics active in pool`);
    }
  }, [eligibleTopics?.length, isSpinning, isLanded]);

  // Measure container width for pixel-perfect centering under marker
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

  // Center translateX formula: centers card at reelIndex under center marker
  const translateX = (containerWidth - ITEM_WIDTH) / 2 - (reelIndex * ITEM_STEP);

  // Spacebar triggers spin shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && !['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
        e.preventDefault();
        handleSpin();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSpinning, eligibleTopics, showToast, onNavigateFilter]);

  const handleSpin = () => {
    if (isSpinning) return;

    if (eligibleTopics.length === 0) {
      if (showToast) {
        showToast("All topics are currently filtered out! Please enable at least one category in the Filter tab.", "warning");
      }
      if (onNavigateFilter) onNavigateFilter();
      return;
    }

    setIsSpinning(true);
    setShowResult(false);
    setIsLanded(false);
    setTickerActive(true);
    setTickerText("DECELERATING READOUT...");

    AudioController.init();
    AudioController.playWhoosh(2600);

    const selected = spinNextTopic();

    // Map selected topic to its category card in REEL_CATEGORIES
    const targetCat = selected?.category || selected?.sub;
    const foundIdx = REEL_CATEGORIES.findIndex(c => c.name === targetCat);
    const baseIndex = foundIdx >= 0 ? foundIdx : 0;

    // Compute forward landing index (ensure moving right-to-left with 4 full cycles)
    const currentBase = reelIndex % REEL_CATEGORIES.length;
    let forwardOffset = baseIndex - currentBase;
    if (forwardOffset <= 0) forwardOffset += REEL_CATEGORIES.length;
    const travelCards = (4 * REEL_CATEGORIES.length) + forwardOffset;
    const targetIndex = reelIndex + travelCards;
    setReelIndex(targetIndex);

    // Play ticking sound with progressive deceleration & rising pitch
    let tickInterval = 60;
    let elapsed = 0;
    const playNextTick = () => {
      if (elapsed < 2400) {
        const progress = Math.min(1, elapsed / 2300);
        AudioController.playTick(progress);
        elapsed += tickInterval;
        tickInterval += 18;
        setTimeout(playNextTick, tickInterval);
      }
    };
    playNextTick();

    setTimeout(() => {
      setIsSpinning(false);
      setShowResult(true);
      setIsLanded(true);
      setTickerActive(false);

      const groupName = (selected?.group_name || selected?.group || 'TOPIC').toUpperCase();
      const catLabel = (REEL_CATEGORIES[baseIndex]?.label || selected?.category || '').toUpperCase();
      setTickerText(`SETTLED — ${groupName} · ${catLabel}`);

      AudioController.playLanding();

      // Trigger confetti celebration burst
      try {
        confetti({
          particleCount: 45,
          spread: 65,
          origin: { y: 0.65 },
          colors: ['#b5502e', '#e07a5f', '#f59e0b']
        });
      } catch (e) {}

      if (userSettings?.haptics_enabled && navigator.vibrate) {
        try { navigator.vibrate([40, 60, 80]); } catch (e) {}
      }

      // Silently normalize reel index back to repetition 2 without animation so strip never runs out
      setTimeout(() => {
        setReelIndex(prev => (prev % REEL_CATEGORIES.length) + (2 * REEL_CATEGORIES.length));
      }, 500);
    }, 2600);
  };

  const handleMarkLearned = async () => {
    await markCurrentTopicLearned();
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#b5502e', '#e07a5f', '#f59e0b']
      });
    } catch (e) {}
  };

  const topicProgress = currentTopic ? userProgressMap[currentTopic.id] : null;
  const isLearned = topicProgress && topicProgress.times_seen > 0;
  const group = currentTopic?.group_name || currentTopic?.group || 'General';
  const category = currentTopic?.category || currentTopic?.sub || '';
  const tags = currentTopic?.tags || [];
  const resources = currentTopic?.resources || currentTopic?.links || [];

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto pb-6">
      
      {/* Horizontal Precision Reel Component */}
      <div className="w-full max-w-2xl mx-auto py-2 relative flex flex-col items-center">
        {/* Outer Reel Track Frame */}
        <div
          ref={containerRef}
          className="relative w-full h-28 sm:h-32 overflow-hidden rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-inner flex items-center select-none"
        >
          {/* Top & Bottom Center Marker Needles & Hairline Guideline */}
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center justify-between pointer-events-none w-8">
            {/* Top Indicator Pip */}
            <div className="flex flex-col items-center -mt-1 drop-shadow-md">
              <div className="w-2.5 h-2.5 bg-primary rotate-45 shadow-[0_0_10px_rgba(var(--color-primary),0.8)] border border-white/50"></div>
              <div className="w-1 h-2 bg-primary rounded-full"></div>
            </div>

            {/* Glowing Vertical Center Line */}
            <div className="w-[2px] flex-1 bg-gradient-to-b from-primary/90 via-primary/40 to-primary/90 shadow-[0_0_10px_rgba(var(--color-primary),0.6)]"></div>

            {/* Bottom Indicator Pip */}
            <div className="flex flex-col items-center -mb-1 drop-shadow-md">
              <div className="w-1 h-2 bg-primary rounded-full"></div>
              <div className="w-2.5 h-2.5 bg-primary rotate-45 shadow-[0_0_10px_rgba(var(--color-primary),0.8)] border border-white/50"></div>
            </div>
          </div>

          {/* Left & Right Fade Vignettes */}
          <div className="absolute inset-y-0 left-0 w-16 sm:w-28 bg-gradient-to-r from-surface-container-lowest via-surface-container-lowest/80 to-transparent z-20 pointer-events-none"></div>
          <div className="absolute inset-y-0 right-0 w-16 sm:w-28 bg-gradient-to-l from-surface-container-lowest via-surface-container-lowest/80 to-transparent z-20 pointer-events-none"></div>

          {/* Animated Horizontal Strip */}
          <motion.div
            className="flex items-center absolute left-0"
            style={{ gap: `${ITEM_GAP}px` }}
            animate={{ x: translateX }}
            transition={
              isSpinning
                ? { duration: 2.6, ease: [0.12, 0.9, 0.2, 1] }
                : { duration: 0 }
            }
          >
            {REEL_STRIP.map((item, idx) => {
              const Icon = item.icon;
              const isSelectedTarget = isLanded && (idx === reelIndex);

              return (
                <motion.div
                  key={`${item.name}-${idx}`}
                  animate={isSelectedTarget ? { scale: [1, 1.07, 1] } : { scale: 1 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  style={{ width: `${ITEM_WIDTH}px` }}
                  className={`h-22 shrink-0 rounded-xl p-3 flex flex-col justify-between border transition-all duration-200 ${
                    isSelectedTarget
                      ? `bg-surface-container-high ${item.borderActive} ring-2 ring-primary/60 shadow-lg ${item.glow}`
                      : 'bg-surface-container-low/75 border-outline-variant/30 hover:border-outline-variant/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-mono uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded border ${item.bgBadge}`}>
                      {item.groupLabel}
                    </span>
                    <Icon size={16} className={item.groupColor} />
                  </div>
                  <div className="mt-1">
                    <div className="text-xs font-semibold text-on-surface truncate leading-tight">
                      {item.shortLabel}
                    </div>
                    <div className="text-[10px] text-on-surface-variant font-mono truncate">
                      {item.label}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Ticker Readout */}
        <div className="mt-3 flex items-center gap-2 font-mono text-xs text-on-surface-variant">
          <span className={`w-2 h-2 rounded-full ${tickerActive ? 'bg-tertiary animate-pulse' : 'bg-primary'}`}></span>
          <span className={`tracking-tight ${tickerActive ? 'text-primary font-semibold' : ''}`}>
            {tickerText}
          </span>
        </div>
      </div>

      {/* Spin Action Button */}
      <div className="flex flex-col items-center gap-2 my-3">
        <Button
          variant="primary"
          onClick={handleSpin}
          disabled={isSpinning}
          className="w-full max-w-sm h-11 text-sm shadow-lg shadow-primary-container/20"
        >
          <RotateCw size={18} className={isSpinning ? 'animate-spin' : ''} />
          <span>Spin Roulette</span>
          <kbd className="ml-1.5 px-1.5 py-0.5 text-[10px] font-mono bg-white/20 text-white rounded border border-white/30">Space</kbd>
        </Button>
        <div className="flex items-center justify-center gap-1.5 font-mono text-[11px] tracking-tight text-on-surface-variant">
          <span className="w-1.5 h-1.5 rounded-full bg-primary/60"></span>
          <span>Random selection from {eligibleTopics.length} eligible topics across active categories</span>
        </div>
      </div>

      {/* Active Result Card or Filtered Out Empty State */}
      {eligibleTopics.length === 0 ? (
        <div className="mt-4 w-full bg-surface-container-low rounded-xl p-6 border border-outline-variant/30 text-center flex flex-col items-center justify-center shadow-sm">
          <FilterX size={44} className="text-outline/40 mb-2.5" strokeWidth={1.5} />
          <p className="text-xs sm:text-sm text-on-surface-variant max-w-md leading-relaxed">
            All topics are currently filtered out! Please enable at least one category in the Filter tab.
          </p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {showResult && currentTopic && (
            <motion.div
              key={currentTopic.id}
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="mt-4 w-full bg-surface-container-low rounded-xl p-5 sm:p-6 shadow-lg shadow-black/10 dark:shadow-black/40 border border-outline-variant/40 relative transition-all duration-300"
            >
              
              {/* Breadcrumbs & Status Tags */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-outline-variant/30">
                <div className="flex items-center gap-2 text-xs font-medium text-on-surface-variant">
                  <span className="text-primary font-semibold">{group}</span>
                  <span className="text-outline">/</span>
                  <span className="text-on-surface">{category}</span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {tags.map(tag => (
                    <span key={tag} className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-mono text-[10px] tracking-tight uppercase">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Topic Title */}
              <h2 className="text-xl sm:text-2xl text-on-surface font-semibold tracking-tight">
                {currentTopic.title}
              </h2>

              {/* Description */}
              <p className="mt-2.5 text-sm sm:text-base text-on-surface-variant leading-relaxed">
                {currentTopic.description || currentTopic.desc}
              </p>

              {/* Curated External Sources Header */}
              {resources.length > 0 && (
                <div className="mt-5 pt-4 border-t border-outline-variant/20">
                  <div className="text-xs text-outline uppercase tracking-wider mb-2.5 font-medium flex items-center justify-between">
                    <span>Primary References &amp; Deep Dives</span>
                    <BookOpen size={14} />
                  </div>

                  {/* Links Stack */}
                  <div className="flex flex-col space-y-2">
                    {resources.map((res, i) => (
                      <a
                        key={i}
                        className="group flex items-start justify-between p-2.5 -mx-2 rounded-lg hover:bg-surface-container transition-colors"
                        href={res.url || '#'}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        <div className="flex flex-col pr-2">
                          <div className="flex items-center gap-2">
                            <span className="px-1.5 py-0.5 rounded bg-surface-container-high text-primary font-mono text-[10px] uppercase font-semibold">
                              {res.type || 'Link'}
                            </span>
                            <span className="text-xs sm:text-sm text-on-surface group-hover:text-primary transition-colors font-medium">
                              {res.label || res.title || 'Resource'}
                            </span>
                          </div>
                          {res.desc && (
                            <span className="text-[12px] text-outline leading-tight mt-1">{res.desc}</span>
                          )}
                        </div>
                        <ExternalLink size={16} className="text-outline group-hover:text-primary transition-colors mt-0.5 shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions Footer */}
              <div className="mt-6 pt-4 border-t border-outline-variant/20 flex items-center justify-between gap-3">
                <Button
                  variant={isLearned ? 'ghost' : 'primary'}
                  onClick={handleMarkLearned}
                  disabled={isMarkingLearned}
                  className={`flex-1 h-10 text-sm shadow-sm ${
                    isLearned ? 'bg-surface-container hover:bg-surface-container-high' : ''
                  }`}
                >
                  {isMarkingLearned ? (
                    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                  ) : (
                    <Check size={18} />
                  )}
                  <span>{isLearned ? `Learned (${topicProgress.times_seen}x)` : 'Mark as learned'}</span>
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleSpin}
                  disabled={isSpinning}
                  className="px-4 h-10 text-sm"
                >
                  Spin again
                </Button>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Micro System Note */}
      <div className="mt-4 flex items-center justify-center gap-1.5 text-xs font-mono text-on-surface-variant">
        <Cloud size={15} className="text-emerald-400" />
        <span>Saved &amp; synced with your account</span>
      </div>

    </div>
  );
};

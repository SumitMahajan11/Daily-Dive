import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
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
  Check,
  Sparkles,
  Share2,
  Clock,
  ShieldCheck,
  Target,
  Briefcase,
  Atom,
  Landmark
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Button } from '../UI/Button';
import { Skeleton } from '../UI/Skeleton';

// Visual metadata for categories: icons, short display labels, tonal variations, and accent styles
const CATEGORY_META = {
  // ── Tech Family ──
  'ai-ml': {
    icon: Bot,
    shortLabel: 'AI & Machine Learning',
    groupColor: 'text-primary font-semibold',
    bgBadge: 'bg-primary/15 text-primary border-primary/30',
    borderActive: 'border-primary',
    glow: 'shadow-primary/40',
    accentColor: '#e06841'
  },
  'cloud-infra': {
    icon: Cloud,
    shortLabel: 'Cloud & Infrastructure',
    groupColor: 'text-primary/90',
    bgBadge: 'bg-primary/10 text-primary/90 border-primary/25',
    borderActive: 'border-primary/90',
    glow: 'shadow-primary/30',
    accentColor: '#d95a32'
  },
  'data-structures-algorithms': {
    icon: Binary,
    shortLabel: 'Algorithms & Data',
    groupColor: 'text-inverse-primary',
    bgBadge: 'bg-primary-fixed-dim/25 text-inverse-primary border-inverse-primary/30',
    borderActive: 'border-inverse-primary',
    glow: 'shadow-primary/45',
    accentColor: '#e87a52'
  },
  'systems-distributed-computing': {
    icon: Cpu,
    shortLabel: 'Distributed Systems',
    groupColor: 'text-primary/80',
    bgBadge: 'bg-primary/10 text-primary/80 border-primary/20',
    borderActive: 'border-primary/80',
    glow: 'shadow-primary/25',
    accentColor: '#c5532b'
  },
  'web-dev': {
    icon: Globe,
    shortLabel: 'Modern Web Architecture',
    groupColor: 'text-primary-fixed-dim font-medium',
    bgBadge: 'bg-primary-fixed/30 text-primary-fixed-dim border-primary-fixed-dim/40',
    borderActive: 'border-primary-fixed-dim',
    glow: 'shadow-primary/35',
    accentColor: '#e87a52'
  },

  // ── Money & Career Family ──
  'finance': {
    icon: Wallet,
    shortLabel: 'Finance & Capital',
    groupColor: 'text-tertiary',
    bgBadge: 'bg-tertiary/15 text-tertiary border-tertiary/30',
    borderActive: 'border-tertiary',
    glow: 'shadow-tertiary/40',
    accentColor: '#f59e0b'
  },

  // ── Mind & Growth Family ──
  'communication': {
    icon: MessageSquare,
    shortLabel: 'High-Stakes Communication',
    groupColor: 'text-secondary font-semibold',
    bgBadge: 'bg-secondary/15 text-secondary border-secondary/30',
    borderActive: 'border-secondary',
    glow: 'shadow-secondary/40',
    accentColor: '#94a88f'
  },
  'philosophy-critical-thinking': {
    icon: Compass,
    shortLabel: 'Mental Models & Logic',
    groupColor: 'text-secondary-fixed-dim',
    bgBadge: 'bg-secondary-fixed-dim/25 text-secondary-fixed-dim border-secondary-fixed-dim/30',
    borderActive: 'border-secondary-fixed-dim',
    glow: 'shadow-secondary/35',
    accentColor: '#a3b89e'
  },
  'psychology': {
    icon: Brain,
    shortLabel: 'Cognitive Psychology',
    groupColor: 'text-secondary/85',
    bgBadge: 'bg-secondary/10 text-secondary/85 border-secondary/20',
    borderActive: 'border-secondary/85',
    glow: 'shadow-secondary/25',
    accentColor: '#84977f'
  },

  // ── Extended & World Ideas ──
  'career-strategy': {
    icon: Briefcase,
    shortLabel: 'Career & Leadership',
    groupColor: 'text-tertiary-fixed-dim font-medium',
    bgBadge: 'bg-tertiary/10 text-tertiary border-tertiary/25',
    borderActive: 'border-tertiary',
    glow: 'shadow-tertiary/30',
    accentColor: '#eab308'
  },
  'science-nature': {
    icon: Atom,
    shortLabel: 'Science & Cosmos',
    groupColor: 'text-cyan-400 font-semibold',
    bgBadge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/25',
    borderActive: 'border-cyan-400',
    glow: 'shadow-cyan-500/30',
    accentColor: '#06b6d4'
  },
  'history-innovation': {
    icon: Landmark,
    shortLabel: 'History & Civilization',
    groupColor: 'text-amber-400 font-semibold',
    bgBadge: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
    borderActive: 'border-amber-400',
    glow: 'shadow-amber-500/30',
    accentColor: '#f59e0b'
  }
};

const BASE_REEL_CATEGORIES = CATEGORY_TREE.flatMap(groupDef =>
  groupDef.categories.map(cat => {
    const meta = CATEGORY_META[cat.name] || {
      icon: Cpu,
      shortLabel: cat.label,
      groupColor: 'text-primary',
      bgBadge: 'bg-primary/10 text-primary border-primary/20',
      borderActive: 'border-primary',
      glow: 'shadow-primary/30',
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

const REEL_CATEGORIES = [
  ...BASE_REEL_CATEGORIES,
  {
    group: 'custom',
    groupLabel: 'Custom',
    name: 'custom-notes',
    label: 'Custom Uploads',
    icon: Sparkles,
    shortLabel: 'Custom Uploads',
    groupColor: 'text-primary font-semibold',
    bgBadge: 'bg-primary/15 text-primary border-primary/30',
    borderActive: 'border-primary',
    glow: 'shadow-primary/40',
    accentColor: '#e06841'
  }
];

// Strip geometry constants
const REPEAT_COUNT = 14;
const REEL_STRIP = Array.from({ length: REPEAT_COUNT }, (_, r) =>
  REEL_CATEGORIES.map(cat => ({ ...cat, repeatIdx: r }))
).flat();

const ITEM_WIDTH = 152;
const ITEM_GAP = 14;
const ITEM_STEP = ITEM_WIDTH + ITEM_GAP; // 166px

// Physics Easing & Timing Specification:
// High-inertia burst with magnetic snap deceleration: cubic-bezier(0.12, 0.98, 0.24, 1.0)
const SPIN_DURATION_MS = 2800;
const SPIN_EASING = [0.12, 0.98, 0.24, 1.0];

// Precision Dial Card with 3D Depth Curve
const PrecisionReelCard = ({ item, idx, motionX, containerWidth, isSelectedTarget }) => {
  const Icon = item.icon;
  const cardCenter = idx * ITEM_STEP + ITEM_WIDTH / 2;

  // Real-time distance to center reticle
  const scale = useTransform(motionX, (curX) => {
    const dist = Math.abs(curX + cardCenter - containerWidth / 2);
    // At center: 1.0; tapering to 0.84 at 2.2 cards away
    const t = Math.min(1, dist / (2.2 * ITEM_STEP));
    return 1.0 - (t * 0.16);
  });

  const opacity = useTransform(motionX, (curX) => {
    const dist = Math.abs(curX + cardCenter - containerWidth / 2);
    // At center: 1.0; tapering to 0.32 at edges
    const t = Math.min(1, dist / (2.4 * ITEM_STEP));
    return 1.0 - (t * 0.68);
  });

  const yOffset = useTransform(motionX, (curX) => {
    const dist = Math.abs(curX + cardCenter - containerWidth / 2);
    const t = Math.min(1, dist / (2 * ITEM_STEP));
    return t * 4; // subtle arch effect
  });

  return (
    <motion.div
      style={{
        width: `${ITEM_WIDTH}px`,
        scale,
        opacity,
        y: yOffset
      }}
      className="shrink-0 flex items-center justify-center select-none"
    >
      <motion.div
        animate={
          isSelectedTarget
            ? {
                scale: [1, 1.06, 0.99, 1],
                transition: { duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }
              }
            : { scale: 1 }
        }
        className={`w-full h-24 rounded-2xl p-3 flex flex-col justify-between transition-all duration-300 relative overflow-hidden ${
          isSelectedTarget
            ? 'bg-surface-container-high border-2 border-primary ring-4 ring-primary/20 shadow-xl'
            : 'bg-surface-container-low/90 dark:bg-surface-container-lowest/80 border border-outline-variant/30 hover:border-outline-variant/60 shadow-sm'
        }`}
      >
        {/* Subtle radial sheen on active card */}
        {isSelectedTarget && (
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-primary/5 pointer-events-none" />
        )}

        {/* Top Meta: Group badge + Category Icon */}
        <div className="flex items-center justify-between relative z-10">
          <span className={`text-[9px] font-mono uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-full border ${item.bgBadge}`}>
            {item.groupLabel}
          </span>
          <div className={`w-6 h-6 rounded-lg flex items-center justify-center bg-surface-container ${isSelectedTarget ? 'text-primary ring-1 ring-primary/40' : 'text-on-surface-variant'}`}>
            <Icon size={14} />
          </div>
        </div>

        {/* Bottom Details */}
        <div className="relative z-10">
          <div className="text-xs font-semibold text-on-surface truncate leading-tight tracking-tight">
            {item.shortLabel}
          </div>
          <div className="text-[10px] text-on-surface-variant font-mono truncate mt-0.5">
            {item.label}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export const SpinScreen = ({ onNavigateFilter, onNavigateExtract }) => {
  const {
    topics,
    eligibleTopics,
    currentTopic,
    userProgressMap,
    userSettings,
    spinNextTopic,
    markCurrentTopicLearned,
    isMarkingLearned,
    showToast,
    loadingData
  } = useData();

  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(580);
  const [isSpinning, setIsSpinning] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [isLanded, setIsLanded] = useState(false);
  const [showLandingHalo, setShowLandingHalo] = useState(false);
  const [activeAccentColor, setActiveAccentColor] = useState('#e06841');

  const [reelIndex, setReelIndex] = useState(() => {
    const initCat = currentTopic?.category || currentTopic?.sub;
    const foundIdx = REEL_CATEGORIES.findIndex(c => c.name === initCat);
    return (3 * REEL_CATEGORIES.length) + (foundIdx >= 0 ? foundIdx : 0);
  });

  const [tickerText, setTickerText] = useState(`SYSTEM READY · ${eligibleTopics?.length ?? 0} TOPICS IN ACTIVE REEL`);
  const [tickerActive, setTickerActive] = useState(false);

  // Exact center coordinate formula
  const translateX = (containerWidth - ITEM_WIDTH) / 2 - (reelIndex * ITEM_STEP);
  const motionX = useMotionValue(translateX);

  // Synchronize motion value when resized or idle
  useEffect(() => {
    if (!isSpinning) {
      motionX.set(translateX);
    }
  }, [translateX, isSpinning, motionX]);

  // Audio-sync tracking refs
  const lastFiredIndexRef = useRef(-1);
  const spinStartTimeRef = useRef(0);
  const isSpinningRef = useRef(false);

  // Sync ticker with pool updates
  useEffect(() => {
    if (loadingData) {
      setTickerText('SYNCHRONIZING TOPIC ARCHIVE...');
    } else if (!isSpinning && !isLanded) {
      setTickerText(`READY · ${eligibleTopics?.length ?? 0} TOPICS ACTIVE IN CURRENT POOL`);
    }
  }, [eligibleTopics?.length, isSpinning, isLanded, loadingData]);

  // Measure container width for center alignment
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
  }, [isSpinning, eligibleTopics, showToast, onNavigateFilter]);

  const handleSpin = () => {
    if (isSpinning) return;

    if (eligibleTopics.length === 0) {
      if (showToast) {
        showToast("All topics are currently filtered out. Enable categories in the Filter tab to spin.", "warning");
      }
      if (onNavigateFilter) onNavigateFilter();
      return;
    }

    isSpinningRef.current = true;
    spinStartTimeRef.current = Date.now();
    lastFiredIndexRef.current = Math.round(((containerWidth - ITEM_WIDTH) / 2 - translateX) / ITEM_STEP);

    setIsSpinning(true);
    setShowResult(false);
    setIsLanded(false);
    setShowLandingHalo(false);
    setTickerActive(true);
    setTickerText("ENGAGING ROTATIONAL INERTIA · DECELERATING...");

    AudioController.init();
    AudioController.playWhoosh(SPIN_DURATION_MS);

    // Call underlying roulette selection logic (unchanged)
    const selected = spinNextTopic();

    // Map selected topic to its category card in REEL_CATEGORIES
    const targetCat = selected?.category || selected?.sub;
    let foundIdx = REEL_CATEGORIES.findIndex(c => c.name === targetCat);
    if (foundIdx < 0 && selected?.is_custom) {
      foundIdx = REEL_CATEGORIES.findIndex(c => c.name === 'custom-notes');
    }
    const baseIndex = foundIdx >= 0 ? foundIdx : 0;

    // Advance forward 4 full cycles + offset for satisfying suspense
    const currentBase = reelIndex % REEL_CATEGORIES.length;
    let forwardOffset = baseIndex - currentBase;
    if (forwardOffset <= 0) forwardOffset += REEL_CATEGORIES.length;
    const travelCards = (4 * REEL_CATEGORIES.length) + forwardOffset;
    const targetIndex = reelIndex + travelCards;
    setReelIndex(targetIndex);

    setTimeout(() => {
      isSpinningRef.current = false;
      setIsSpinning(false);
      setShowResult(true);
      setIsLanded(true);
      setTickerActive(false);

      const groupName = (selected?.group_name || selected?.group || 'TOPIC').toUpperCase();
      const landedCatDef = REEL_CATEGORIES[baseIndex];
      const catLabel = (landedCatDef?.label || selected?.category || '').toUpperCase();
      setTickerText(`RETICLE LOCKED · ${groupName} / ${catLabel}`);

      AudioController.playLanding();

      setActiveAccentColor(landedCatDef?.accentColor || '#e06841');
      setShowLandingHalo(true);
      setTimeout(() => setShowLandingHalo(false), 800);

      // Subtle celebration particles
      try {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.62 },
          colors: ['#e06841', '#f59e0b', '#94a88f', '#ff8c69']
        });
      } catch (e) {}

      // Mobile haptics
      if (userSettings?.haptics_enabled && navigator.vibrate) {
        try { navigator.vibrate([30, 50, 90]); } catch (e) {}
      }

      // Silently normalize reel index back to repetition 3 so the strip never runs out
      setTimeout(() => {
        setReelIndex(prev => (prev % REEL_CATEGORIES.length) + (3 * REEL_CATEGORIES.length));
      }, 500);
    }, SPIN_DURATION_MS);
  };

  const handleMarkLearned = async () => {
    await markCurrentTopicLearned();
    try {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#e06841', '#f59e0b', '#94a88f']
      });
    } catch (e) {}
    if (showToast) {
      showToast("Topic recorded in your learning journal!", "success");
    }
  };

  const handleCopySummary = () => {
    if (!currentTopic) return;
    const textToCopy = `Daily Dive: ${currentTopic.title}\n\n${currentTopic.description || currentTopic.desc}\n\nLearn more: https://daily-dive.vercel.app`;
    try {
      navigator.clipboard.writeText(textToCopy);
      if (showToast) {
        showToast("Topic insight copied to clipboard!", "info");
      }
    } catch (e) {
      if (showToast) showToast("Could not copy text", "error");
    }
  };

  const topicProgress = currentTopic ? userProgressMap[currentTopic.id] : null;
  const isLearned = topicProgress && topicProgress.times_seen > 0;
  const timesSeen = topicProgress?.times_seen || 0;
  const group = currentTopic?.group_name || currentTopic?.group || 'General';
  const category = currentTopic?.category || currentTopic?.sub || '';
  const rawTags = currentTopic?.tags || [];
  const tags = Array.isArray(rawTags)
    ? rawTags.flatMap(t => typeof t === 'string' ? t.split(/[;,]/) : []).map(t => t.trim()).filter(Boolean)
    : [];
  const resources = currentTopic?.resources || currentTopic?.links || [];

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto pb-6">
      
      {/* ── PRECISION INSTRUMENT DIAL CHASSIS ── */}
      <div className="w-full py-2 relative flex flex-col items-center">
        
        {/* Outer Dial Frame with Tactile Bevel */}
        <div
          ref={containerRef}
          className="relative w-full h-32 sm:h-36 overflow-hidden rounded-3xl dial-chassis flex items-center select-none shadow-2xl"
        >
          {/* Radial Chromatic Landing Flare */}
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

          {/* Idle Ambient Light Sweep */}
          {!isSpinning && !isLanded && (
            <motion.div
              initial={{ x: '-150%' }}
              animate={{ x: '350%' }}
              transition={{
                repeat: Infinity,
                duration: 3.5,
                ease: 'easeInOut',
                repeatDelay: 1.0
              }}
              className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent pointer-events-none z-20 skew-x-[-20deg]"
            />
          )}

          {/* Center Precision Loupe & Reticle Sights */}
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center justify-between pointer-events-none w-10">
            {/* Top Loupe Pointer */}
            <div className="flex flex-col items-center -mt-0.5 filter drop-shadow">
              <div className="w-3.5 h-3.5 bg-primary rotate-45 border-2 border-surface shadow-[0_0_12px_rgba(var(--color-primary),0.8)]" />
              <div className="w-[1.5px] h-3 bg-primary" />
            </div>

            {/* Central Precision Target Aperture */}
            <div className="relative flex items-center justify-center">
              <div className={`w-4 h-4 rounded-full border border-primary/60 flex items-center justify-center transition-all duration-300 ${isSpinning ? 'scale-125 border-primary shadow-[0_0_10px_rgba(var(--color-primary),0.8)]' : isLanded ? 'scale-110 border-primary ring-2 ring-primary/40' : 'scale-90'}`}>
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              </div>
            </div>

            {/* Glowing Laser Vertical Guideline */}
            <div className={`absolute inset-y-3 w-[1.5px] bg-gradient-to-b from-primary via-primary/50 to-primary transition-opacity duration-300 ${isSpinning ? 'opacity-100 shadow-[0_0_8px_rgba(var(--color-primary),0.8)]' : 'opacity-70'}`} />

            {/* Bottom Loupe Pointer */}
            <div className="flex flex-col items-center -mb-0.5 filter drop-shadow">
              <div className="w-[1.5px] h-3 bg-primary" />
              <div className="w-3.5 h-3.5 bg-primary rotate-45 border-2 border-surface shadow-[0_0_12px_rgba(var(--color-primary),0.8)]" />
            </div>
          </div>

          {/* Optical Vignette Masks (Deep Edge Shadows) */}
          <div className="absolute inset-y-0 left-0 w-20 sm:w-32 bg-gradient-to-r from-surface via-surface/80 to-transparent z-20 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-20 sm:w-32 bg-gradient-to-l from-surface via-surface/80 to-transparent z-20 pointer-events-none" />

          {/* Animated Kinetic Card Strip */}
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
            {REEL_STRIP.map((item, idx) => (
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

        {/* Telemetry Status Readout Bar */}
        <div className="mt-3.5 flex items-center justify-between w-full px-2">
          <div className="flex items-center gap-2 font-mono text-[11px] text-on-surface-variant">
            <span
              className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                tickerActive
                  ? 'bg-tertiary animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.8)]'
                  : loadingData
                  ? 'bg-primary/50 animate-pulse'
                  : 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]'
              }`}
            />
            {loadingData ? (
              <Skeleton className="h-4 w-44 rounded" />
            ) : (
              <span className={`tracking-wide font-medium ${tickerActive ? 'text-primary' : ''}`}>
                {tickerText}
              </span>
            )}
          </div>

          <div className="hidden sm:flex items-center gap-1.5 font-mono text-[11px] text-outline">
            <Target size={13} className="text-primary/70" />
            <span>Magnetic Detent Easing</span>
          </div>
        </div>
      </div>

      {/* ── PRIMARY SPIN TRIGGER ACTION ── */}
      <div className="flex flex-col items-center gap-2.5 my-4">
        <Button
          variant="primary"
          onClick={handleSpin}
          disabled={isSpinning || loadingData}
          className="w-full max-w-sm h-12 text-sm font-semibold tracking-wide shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all cursor-pointer relative overflow-hidden"
        >
          {/* Subtle button sheen */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-white/15 pointer-events-none" />

          <RotateCw
            size={18}
            className={`transition-transform ${isSpinning ? 'animate-spin' : 'group-hover:rotate-45'}`}
          />
          <span>{isSpinning ? 'Spinning Dial...' : 'Spin Roulette'}</span>

          {/* Desktop Keyboard Shortcut Badge — hidden on mobile */}
          <kbd className="hidden sm:inline-flex items-center ml-2 px-1.5 py-0.5 text-[10px] font-mono bg-black/20 text-white/90 rounded border border-white/20">
            Space
          </kbd>
        </Button>

        {loadingData ? (
          <Skeleton className="h-3.5 w-60 rounded" />
        ) : (
          <p className="font-mono text-[11px] text-on-surface-variant text-center">
            Weighted roulette from <span className="font-semibold text-primary">{eligibleTopics.length}</span> active topics · Distraction-free
          </p>
        )}
      </div>

      {/* ── TOPIC CARD / EDITORIAL RESULT VIEW ── */}
      {loadingData ? (
        <div className="mt-4 w-full journal-card rounded-2xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
            <Skeleton className="h-4 w-36 rounded" />
            <Skeleton className="h-4 w-20 rounded-full" />
          </div>
          <Skeleton className="h-10 w-3/4 rounded-lg" />
          <div className="space-y-2.5 pt-2">
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-5/6 rounded" />
            <Skeleton className="h-4 w-2/3 rounded" />
          </div>
          <div className="pt-6 border-t border-outline-variant/20 flex gap-3">
            <Skeleton className="h-11 flex-1 rounded-xl" />
            <Skeleton className="h-11 w-28 rounded-xl" />
          </div>
        </div>
      ) : eligibleTopics.length === 0 ? (
        <div className="mt-4 w-full journal-card rounded-2xl p-8 text-center flex flex-col items-center justify-center">
          <div className="w-14 h-14 rounded-2xl bg-surface-container flex items-center justify-center mb-3 text-outline">
            <FilterX size={32} strokeWidth={1.5} />
          </div>
          <h3 className="font-display text-xl font-bold text-on-surface">No Topics in Spin Pool</h3>
          <p className="text-xs sm:text-sm text-on-surface-variant max-w-sm mt-1.5 leading-relaxed">
            All categories are currently disabled. Open the Category Filter tab to re-enable topics for the roulette.
          </p>
          <Button
            variant="primary"
            onClick={onNavigateFilter}
            className="mt-4 h-10 px-5 text-xs font-semibold"
          >
            Adjust Filter Settings
          </Button>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {showResult && currentTopic && (
            <motion.article
              key={currentTopic.id}
              initial={{ opacity: 0, y: 22, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
              className="mt-4 w-full journal-card rounded-2xl p-5 sm:p-8 relative transition-all duration-300"
            >
              {/* Category Breadcrumb & Read Time Badge */}
              <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-outline-variant/25 flex-wrap gap-2">
                <div className="flex items-center gap-2 text-xs font-mono font-medium">
                  <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold uppercase tracking-wider text-[10px]">
                    {group}
                  </span>
                  <span className="text-outline">/</span>
                  <span className="text-on-surface font-semibold">{category}</span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {currentTopic?.is_custom && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/25 text-primary font-mono text-[10px] font-bold">
                      <Sparkles size={11} />
                      <span>Custom Upload{currentTopic.source ? ` (${currentTopic.source})` : ''}</span>
                    </span>
                  )}

                  {/* Reading Time Pill */}
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-mono text-[10px]">
                    <Clock size={11} className="text-outline" />
                    <span>~2 min dive</span>
                  </div>

                  {/* Times seen badge */}
                  {timesSeen > 0 && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[10px] font-semibold">
                      <Check size={11} />
                      <span>Reviewed {timesSeen}x</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Topic Headline (Editorial Serif Typography) */}
              <h2 className="editorial-title text-2xl sm:text-3xl lg:text-[2.15rem] font-bold text-on-surface tracking-tight leading-snug sm:leading-[1.25]">
                {currentTopic.title}
              </h2>

              {/* Tags Row */}
              {tags.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap mt-3">
                  {tags.map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-md bg-surface-container text-on-surface-variant font-mono text-[10px] tracking-wide uppercase border border-outline-variant/20"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Topic Description & Deep-Dive Concept Body */}
              <div className="mt-4 pt-3 text-sm sm:text-base text-on-surface/90 leading-relaxed font-normal space-y-3">
                <p className="leading-relaxed">
                  {currentTopic.description || currentTopic.desc}
                </p>
              </div>

              {/* Curated External Resources & References */}
              {resources.length > 0 && (
                <div className="mt-6 pt-5 border-t border-outline-variant/25">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs text-outline uppercase tracking-wider font-bold flex items-center gap-2">
                      <BookOpen size={14} className="text-primary" />
                      <span>Curated Deep Dives &amp; Sources</span>
                    </span>
                    <span className="text-[10px] font-mono text-outline">External links</span>
                  </div>

                  {/* Clean Links Stack */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {resources.map((res, i) => (
                      <a
                        key={i}
                        href={res.url || '#'}
                        rel="noopener noreferrer"
                        target="_blank"
                        className="group flex flex-col justify-between p-3 rounded-xl bg-surface-container/60 hover:bg-surface-container border border-outline-variant/20 hover:border-primary/40 transition-all hover:-translate-y-0.5 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="px-1.5 py-0.5 rounded bg-surface-container-high text-primary font-mono text-[9px] uppercase font-bold tracking-wider">
                            {res.type || 'SOURCE'}
                          </span>
                          <ExternalLink size={14} className="text-outline group-hover:text-primary transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shrink-0" />
                        </div>
                        <div className="mt-2">
                          <span className="text-xs sm:text-sm text-on-surface font-semibold group-hover:text-primary transition-colors line-clamp-1">
                            {res.label || res.title || 'Explore Reference'}
                          </span>
                          {res.desc && (
                            <p className="text-[11px] text-outline line-clamp-2 mt-1 leading-snug">
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
              <div className="mt-7 pt-5 border-t border-outline-variant/25 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                {/* Mark as learned toggle button */}
                <Button
                  variant={isLearned ? 'outline' : 'primary'}
                  onClick={handleMarkLearned}
                  disabled={isMarkingLearned}
                  className={`h-11 px-5 text-sm font-semibold flex-1 shadow-sm ${
                    isLearned ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/15' : ''
                  }`}
                >
                  {isMarkingLearned ? (
                    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  ) : (
                    <Check size={17} className={isLearned ? 'text-emerald-400' : ''} />
                  )}
                  <span>{isLearned ? `Learned (${timesSeen}x)` : 'Mark as Learned'}</span>
                </Button>

                {/* Spin next topic button */}
                <Button
                  variant="ghost"
                  onClick={handleSpin}
                  disabled={isSpinning}
                  className="h-11 px-4 text-sm font-medium border border-outline-variant/30 hover:border-outline-variant/60"
                >
                  <RotateCw size={15} />
                  <span>Spin Again</span>
                </Button>

                {/* Quick Share / Copy Insight */}
                <button
                  type="button"
                  onClick={handleCopySummary}
                  aria-label="Copy topic insight"
                  title="Copy topic insight to clipboard"
                  className="h-11 w-11 rounded-lg border border-outline-variant/30 hover:border-outline-variant/60 flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer shrink-0"
                >
                  <Share2 size={16} />
                </button>
              </div>

            </motion.article>
          )}
        </AnimatePresence>
      )}

      {/* Privacy Guarantee Footer Note */}
      <div className="mt-5 flex items-center justify-center gap-2 text-xs font-mono text-outline">
        <ShieldCheck size={14} className="text-emerald-500" />
        <span>Privacy-First · Zero analytics tracking · 100% Client-Side storage</span>
      </div>

    </div>
  );
};

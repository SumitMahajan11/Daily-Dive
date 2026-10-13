import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { useData } from '../../context/DataContext';
import { AudioController } from '../../lib/audio';
import { createSpinTimeline, SPIN_TOTAL_DURATION_MS } from '../../lib/spinTimeline';
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
  Flame
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Button } from '../UI/Button';
import { Skeleton } from '../UI/Skeleton';
import { requestStoragePersistence } from '../../lib/storage';
import { loadAllBuiltinTopics } from '../../lib/topicLoader';
import { selectReviewQueue } from '../../lib/selectors';
import { starterTopics } from '../../data/starterTopics';

// Visual metadata for categories
const CATEGORY_META = {
  'ai-ml': { icon: Bot, shortLabel: 'AI & Machine Learning', bgBadge: 'bg-primary/20 text-on-surface border-primary/40', accentColor: '#e06841' },
  'cloud-infra': { icon: Cloud, shortLabel: 'Cloud & Infrastructure', bgBadge: 'bg-primary/20 text-on-surface border-primary/40', accentColor: '#d95a32' },
  'data-structures-algorithms': { icon: Binary, shortLabel: 'Algorithms & Data', bgBadge: 'bg-primary/20 text-on-surface border-primary/40', accentColor: '#e87a52' },
  'systems-distributed-computing': { icon: Cpu, shortLabel: 'Distributed Systems', bgBadge: 'bg-primary/20 text-on-surface border-primary/40', accentColor: '#c5532b' },
  'web-dev': { icon: Globe, shortLabel: 'Web Architecture', bgBadge: 'bg-primary/20 text-on-surface border-primary/40', accentColor: '#e87a52' },
  'finance': { icon: Wallet, shortLabel: 'Finance & Capital', bgBadge: 'bg-tertiary/20 text-on-surface border-tertiary/40', accentColor: '#f59e0b' },
  'communication': { icon: MessageSquare, shortLabel: 'Communication', bgBadge: 'bg-secondary/20 text-on-surface border-secondary/40', accentColor: '#94a88f' },
  'philosophy-critical-thinking': { icon: Compass, shortLabel: 'Mental Models', bgBadge: 'bg-secondary/20 text-on-surface border-secondary/40', accentColor: '#a3b89e' },
  'psychology': { icon: Brain, shortLabel: 'Cognitive Psychology', bgBadge: 'bg-secondary/20 text-on-surface border-secondary/40', accentColor: '#84977f' },
  'career-strategy': { icon: Briefcase, shortLabel: 'Career Strategy', bgBadge: 'bg-tertiary/20 text-on-surface border-tertiary/40', accentColor: '#eab308' },
  'science-nature': { icon: Atom, shortLabel: 'Science & Cosmos', bgBadge: 'bg-cyan-500/20 text-on-surface border-cyan-500/40', accentColor: '#06b6d4' },
  'history-innovation': { icon: Landmark, shortLabel: 'History of Ideas', bgBadge: 'bg-amber-500/20 text-on-surface border-amber-500/40', accentColor: '#f59e0b' }
};

const GROUP_SHORT_LABELS = {
  'tech': 'Tech',
  'money-career': 'Money',
  'mind-growth': 'Mind',
  'world-ideas': 'World'
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
const ITEM_WIDTH = 104;
const ITEM_GAP = 10;
const ITEM_STEP = ITEM_WIDTH + ITEM_GAP; // 114px
const SPIN_DURATION_MS = SPIN_TOTAL_DURATION_MS; // 4500ms
const SPIN_EASING = [0.12, 0.98, 0.24, 1.0];

const PrecisionReelCard = ({ item, idx, motionX, containerWidth, isSelectedTarget, isLandingScale }) => {
  const Icon = item.icon;
  const cardCenter = idx * ITEM_STEP + ITEM_WIDTH / 2;

  const scale = useTransform(motionX, (curX) => {
    const dist = Math.abs(curX + cardCenter - containerWidth / 2);
    const t = Math.min(1, dist / (2.2 * ITEM_STEP));
    return 1.0 - (t * 0.12);
  });

  return (
    <motion.div
      style={{ width: `${ITEM_WIDTH}px`, scale }}
      className="shrink-0 flex items-center justify-center select-none"
    >
      <motion.div
        animate={isLandingScale ? { scale: [1, 1.06, 1] } : { scale: 1 }}
        transition={isLandingScale ? { duration: 0.4, ease: 'easeInOut' } : { duration: 0 }}
        className={`w-full h-20 rounded-2xl p-2 flex flex-col justify-between transition-all duration-300 relative overflow-hidden ${
          isSelectedTarget
            ? 'bg-surface-container-high border-2 border-primary ring-2 ring-primary/20 shadow-md'
            : 'bg-surface-container-high border border-outline-variant/40 shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between relative z-10">
          <span className={`text-[9px] font-mono uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-full border ${item.bgBadge}`}>
            {GROUP_SHORT_LABELS[item.group] || item.groupLabel}
          </span>
          <div className={`w-4 h-4 rounded-md flex items-center justify-center bg-surface-container ${isSelectedTarget ? 'text-primary' : 'text-on-surface'}`}>
            <Icon size={11} />
          </div>
        </div>

        <div className="relative z-10">
          <div className="text-[11px] font-semibold text-on-surface truncate leading-tight">
            {item.title || item.shortLabel}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export const SpinScreen = ({ onNavigateLibrary, onNavigateFilter, onNavigateExtract, reviewedTopic, onConsumeReview }) => {
  const navigateToLibrary = onNavigateLibrary || onNavigateFilter || onNavigateExtract;
  const {
    topics,
    eligibleTopics,
    currentTopic,
    setCurrentTopic,
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

  // Determine if user has spun before (returning user vs first-run)
  const hasSpunBefore = useMemo(() => {
    const hasHistory = (history || []).some(h => h.action === 'spin' || h.action === 'learned');
    const hasProgress = Object.values(userProgressMap || {}).some(p => (p.times_seen || 0) > 0);
    if (typeof window !== 'undefined') {
      const storedFlag = localStorage.getItem('daily_dive_has_spun') === 'true';
      return hasHistory || hasProgress || storedFlag;
    }
    return hasHistory || hasProgress;
  }, [history, userProgressMap]);

  // A group pill is ON if any of its subcategories is on
  const isGroupActive = useCallback((groupDef) => {
    const enabledMap = userSettings?.enabled_categories || {};
    return groupDef.categories.some(cat => {
      const fullKey = `${groupDef.group}::${cat.name}`;
      return enabledMap[fullKey] !== false && enabledMap[cat.name] !== false && enabledMap[groupDef.group] !== false;
    });
  }, [userSettings?.enabled_categories]);

  const toggleBroadGroup = (groupKey) => {
    const groupDef = CATEGORY_TREE.find(g => g.group === groupKey);
    if (!groupDef) return;

    const enabledMap = userSettings?.enabled_categories || {};
    const isCurrentlyOn = isGroupActive(groupDef);
    const activeCount = CATEGORY_TREE.filter(g => isGroupActive(g)).length;

    if (isCurrentlyOn && activeCount <= 1) {
      if (showToast) showToast('At least one topic group must remain active.', 'warning');
      return;
    }

    const nextVal = !isCurrentlyOn;
    const currentCategories = { ...enabledMap };
    currentCategories[groupKey] = nextVal;
    groupDef.categories.forEach(cat => {
      currentCategories[`${groupKey}::${cat.name}`] = nextVal;
      currentCategories[cat.name] = nextVal;
    });

    updateSettings({ enabled_categories: currentCategories });
  };

  const activeTopicsPool = useMemo(() => {
    if (eligibleTopics && eligibleTopics.length > 0) return eligibleTopics;
    if (topics && topics.length > 0) return topics;
    return starterTopics;
  }, [eligibleTopics, topics]);

  const mapTopicToCard = useCallback((topic) => {
    if (!topic) return null;
    const catName = topic.category || topic.sub;
    const meta = CATEGORY_META[catName] || {
      icon: Cpu,
      shortLabel: catName || 'Topic',
      bgBadge: 'bg-primary/20 text-on-surface border-primary/40',
      accentColor: '#e06841'
    };
    return {
      id: topic.id,
      title: topic.title,
      group: topic.group || topic.group_name || 'tech',
      groupLabel: GROUP_SHORT_LABELS[topic.group] || topic.group || 'Tech',
      category: catName,
      ...meta
    };
  }, []);

  const BASE_INDEX = 5;
  const TOTAL_STRIP_CARDS = 80;

  const buildStripCards = useCallback((centerTopic, pool, targetIdx = null, targetTopic = null) => {
    const list = [];
    const poolList = (pool && pool.length > 0) ? pool : starterTopics;
    const poolLen = poolList.length;
    for (let i = 0; i < TOTAL_STRIP_CARDS; i++) {
      if (targetIdx !== null && i === targetIdx && targetTopic) {
        list.push(mapTopicToCard(targetTopic));
      } else if (i === BASE_INDEX && centerTopic) {
        list.push(mapTopicToCard(centerTopic));
      } else {
        const offset = i - BASE_INDEX;
        const topic = poolList[((offset % poolLen) + poolLen) % poolLen];
        list.push(mapTopicToCard(topic));
      }
    }
    return list;
  }, [mapTopicToCard]);

  const [stripCards, setStripCards] = useState(() => {
    return buildStripCards(currentTopic || starterTopics[0], starterTopics);
  });

  const [reelIndex, setReelIndex] = useState(BASE_INDEX);

  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(358);
  const [isSpinning, setIsSpinning] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [isLanded, setIsLanded] = useState(false);
  const [showLandingHalo, setShowLandingHalo] = useState(false);
  const [showLandingRing, setShowLandingRing] = useState(false);
  const [isLandingScale, setIsLandingScale] = useState(false);
  const [isReticleFlash, setIsReticleFlash] = useState(false);
  const [activeAccentColor, setActiveAccentColor] = useState('#e06841');

  const cWidth = containerRef.current ? containerRef.current.clientWidth : containerWidth;
  const translateX = (cWidth - ITEM_WIDTH) / 2 - (reelIndex * ITEM_STEP);
  const motionX = useMotionValue(translateX);

  useEffect(() => {
    if (!isSpinning) {
      const currentCWidth = containerRef.current ? containerRef.current.clientWidth : containerWidth;
      motionX.set((currentCWidth - ITEM_WIDTH) / 2 - (reelIndex * ITEM_STEP));
    }
  }, [containerWidth, reelIndex, isSpinning, motionX]);

  const lastFiredIndexRef = useRef(-1);
  const spinStartTimeRef = useRef(0);
  const isSpinningRef = useRef(false);
  const animFrameRef = useRef(null);
  const timersRef = useRef([]);

  const safeSetTimeout = useCallback((fn, delay) => {
    const id = setTimeout(fn, delay);
    timersRef.current.push(id);
    return id;
  }, []);

  useEffect(() => {
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
      AudioController.cancelSpinAudio();
    };
  }, []);

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

  const [isNotFound, setIsNotFound] = useState(false);

  // Check URL deeplink ?topic=<id> or ?t=<slug> on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let isMounted = true;

    async function resolveTopicFromUrl() {
      try {
        const params = new URLSearchParams(window.location.search);
        const pathMatch = window.location.pathname.match(/\/t\/([^/?#]+)/);
        const topicParam = params.get('topic') || params.get('t') || (pathMatch ? decodeURIComponent(pathMatch[1]) : null);
        if (!topicParam) {
          if (isMounted) setIsNotFound(false);
          return;
        }
        const cleanSlug = topicParam.trim().toLowerCase();

        // 1. Check in currently loaded topics
        let matched = topics?.find(t => {
          const idMatch = t.id && t.id.toLowerCase() === cleanSlug;
          const slugMatch = t.slug && t.slug.toLowerCase() === cleanSlug;
          const titleSlug = t.title ? t.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : '';
          return idMatch || slugMatch || titleSlug === cleanSlug;
        });

        // 2. If not found, load all builtin topics
        if (!matched) {
          const allTopics = await loadAllBuiltinTopics();
          matched = allTopics.find(t => {
            const idMatch = t.id && t.id.toLowerCase() === cleanSlug;
            const slugMatch = t.slug && t.slug.toLowerCase() === cleanSlug;
            const titleSlug = t.title ? t.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : '';
            return idMatch || slugMatch || titleSlug === cleanSlug;
          });
        }

        if (matched && isMounted) {
          setCurrentTopic(matched);
          setShowResult(true);
          setIsLanded(true);
          setIsNotFound(false);
        } else if (!matched && isMounted) {
          setIsNotFound(true);
          setShowResult(false);
        }
      } catch (e) {}
    }

    resolveTopicFromUrl();
    return () => { isMounted = false; };
  }, [topics, setCurrentTopic]);

  // Open topic card when a topic is selected for review from Progress screen
  useEffect(() => {
    if (reviewedTopic) {
      setCurrentTopic(reviewedTopic);
      setShowResult(true);
      setIsLanded(true);
      setIsNotFound(false);
      if (onConsumeReview) {
        onConsumeReview();
      }
    }
  }, [reviewedTopic, setCurrentTopic, onConsumeReview]);

  // Synchronize document title and description meta tag at runtime
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const defaultTitle = 'Daily Dive — Micro-learning on Demand';
    const defaultDesc = 'A distraction-free, privacy-first single-page roulette application for daily micro-learning across tech, career, mental models, and world ideas.';

    let descMeta = document.querySelector('meta[name="description"]');
    if (!descMeta) {
      descMeta = document.createElement('meta');
      descMeta.setAttribute('name', 'description');
      document.head.appendChild(descMeta);
    }

    if (isNotFound) {
      document.title = 'Topic not found';
      descMeta.setAttribute('content', defaultDesc);
    } else if (showResult && currentTopic) {
      const topicTitle = currentTopic.title ? `${currentTopic.title} — Daily Dive` : defaultTitle;
      document.title = topicTitle;

      const rawDesc = currentTopic.description || currentTopic.summary || '';
      const match = rawDesc.match(/(.*?[.!?])(?:\s|$)/);
      let sentence = match ? match[1].trim() : rawDesc.trim();
      if (!sentence) sentence = defaultDesc;
      if (sentence.length > 160) sentence = sentence.slice(0, 157) + '...';
      descMeta.setAttribute('content', sentence);
    } else {
      document.title = defaultTitle;
      descMeta.setAttribute('content', defaultDesc);
    }

    return () => {
      document.title = defaultTitle;
      descMeta?.setAttribute('content', defaultDesc);
    };
  }, [showResult, currentTopic, isNotFound]);

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

  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const handleSpin = () => {
    if (isSpinning) return;

    if (eligibleTopics.length === 0) {
      if (showToast) {
        showToast('All topics are currently filtered out. Choose interests in Library to spin.', 'warning');
      }
      if (navigateToLibrary) navigateToLibrary();
      return;
    }

    const isReduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    try {
      localStorage.setItem('daily_dive_has_spun', 'true');
    } catch (e) {}

    AudioController.init();
    if (AudioController.ctx && AudioController.ctx.state === 'suspended') {
      AudioController.ctx.resume().catch(() => {});
    }
    const selected = spinNextTopic();
    requestStoragePersistence().catch(() => {});

    const travelCards = 32;
    const startIdx = BASE_INDEX;
    const targetIdx = startIdx + travelCards; // 37

    // Build strip containing currentTopic at startIdx and selected at targetIdx
    const nextStrip = buildStripCards(currentTopic || selected, activeTopicsPool, targetIdx, selected);
    setStripCards(nextStrip);

    const landedDef = mapTopicToCard(selected);

    if (isReduced) {
      setReelIndex(targetIdx);
      isSpinningRef.current = false;
      setIsSpinning(false);
      setCurrentTopic(selected);
      setShowResult(true);
      setIsLanded(true);
      setIsNotFound(false);
      AudioController.playLanding();
      setActiveAccentColor(landedDef?.accentColor || '#e06841');
      setShowLandingHalo(true);
      safeSetTimeout(() => setShowLandingHalo(false), 400);
      return;
    }

    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    isSpinningRef.current = true;
    spinStartTimeRef.current = Date.now();

    setIsSpinning(true);
    setShowResult(false);
    setIsLanded(false);
    setIsNotFound(false);
    setShowLandingHalo(false);
    setShowLandingRing(false);
    setIsLandingScale(false);
    setIsReticleFlash(false);

    setReelIndex(startIdx);

    const timeline = createSpinTimeline(travelCards);

    const currentCWidth = containerRef.current ? containerRef.current.clientWidth : containerWidth;
    const startX = (currentCWidth - ITEM_WIDTH) / 2 - (startIdx * ITEM_STEP);
    const targetX = (currentCWidth - ITEM_WIDTH) / 2 - (targetIdx * ITEM_STEP);
    motionX.set(startX);

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }

    let startTime = null;

    const step = (now) => {
      if (startTime === null) {
        startTime = now;
        AudioController.playWhoosh(SPIN_DURATION_MS);
        AudioController.scheduleSpinTicks(timeline.tickTimes);
      }
      const elapsed = now - startTime;
      if (elapsed >= SPIN_DURATION_MS) {
        motionX.set(targetX);
        setReelIndex(targetIdx);
        setIsLanded(true);

        // a) playLanding() starts at that moment (not later)
        AudioController.playLanding();
        setActiveAccentColor(landedDef?.accentColor || '#e06841');
        setShowLandingHalo(true);
        safeSetTimeout(() => setShowLandingHalo(false), 800);

        // b, c, d, e: Landing effects (only if reduced motion is off)
        if (!isReduced) {
          // c) A ring of the primary color expands from reticle center and fades out over ~600ms
          setShowLandingRing(true);
          safeSetTimeout(() => setShowLandingRing(false), 650);

          // b) Chosen card scales 1 -> 1.06 -> 1 over ~400ms
          setIsLandingScale(true);
          safeSetTimeout(() => setIsLandingScale(false), 450);

          // d) Reticle diamonds flash brighter for ~300ms
          setIsReticleFlash(true);
          safeSetTimeout(() => setIsReticleFlash(false), 300);

          // e) navigator.vibrate(20), only if navigator.vibrate exists and reduced motion is off
          if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
            try { navigator.vibrate(20); } catch (e) {}
          }
        }

        // Step 3: Settle at the stop over about 300ms
        const settleStartTime = performance.now();
        const settleDuration = 300;
        const travelDir = targetX < startX ? -1 : 1;
        const settleC = 10 / 0.4752; // Peak amplitude exactly 10px

        const settleStep = (settleNow) => {
          const settleElapsed = settleNow - settleStartTime;
          if (settleElapsed >= settleDuration) {
            motionX.set(targetX);
            isSpinningRef.current = false;
            setIsSpinning(false);
            setCurrentTopic(selected);
            setShowResult(true);

            // Confetti and topic card appear after the settle ends
            try {
              confetti({
                particleCount: 40,
                spread: 60,
                origin: { y: 0.6 },
                colors: ['#e06841', '#f59e0b', '#94a88f', '#ff8c69']
              });
            } catch (e) {}
          } else {
            const tau = settleElapsed / settleDuration;
            const delta = settleC * Math.sin(Math.PI * tau) * Math.exp(-1.8 * tau);
            motionX.set(targetX + travelDir * delta);
            animFrameRef.current = requestAnimationFrame(settleStep);
          }
        };

        animFrameRef.current = requestAnimationFrame(settleStep);
      } else {
        const progress = timeline.getProgress(elapsed);
        motionX.set(startX + (targetX - startX) * progress);
        animFrameRef.current = requestAnimationFrame(step);
      }
    };

    animFrameRef.current = requestAnimationFrame(step);
  };

  const handleMarkLearned = async () => {
    await markCurrentTopicLearned();
    const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReducedMotion) {
      try {
        confetti({
          particleCount: 35,
          spread: 50,
          origin: { y: 0.7 },
          colors: ['#e06841', '#f59e0b', '#94a88f']
        });
      } catch (e) {}
    }
    if (showToast) {
      showToast('Topic recorded in your journal!', 'success');
    }
  };

  const handleShareTopic = async () => {
    if (!currentTopic) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://daily-dive.vercel.app';
    const shareUrl = `${origin}/t/${encodeURIComponent(currentTopic.id)}`;
    const shareData = {
      title: `Daily Dive: ${currentTopic.title}`,
      text: `Explore today's concept on Daily Dive: ${currentTopic.title}`,
      url: shareUrl
    };

    if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        if (err.name === 'AbortError') return;
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      if (showToast) {
        showToast('Link copied', 'info');
      }
    } catch (e) {
      if (showToast) showToast('Could not copy link', 'error');
    }
  };

  const streak = (effectiveStreak || userStreaks)?.current_streak || 0;
  
  // Calculate review queue count (only topics whose last_seen local calendar day is before today)
  const toReviewCount = useMemo(() => {
    return selectReviewQueue(topics, userProgressMap, Infinity).length;
  }, [topics, userProgressMap]);

  const topicProgress = currentTopic ? userProgressMap[currentTopic.id] : null;
  const isLearned = topicProgress && topicProgress.times_seen > 0;
  const resources = currentTopic?.resources || currentTopic?.links || [];

  return (
    <div className="flex flex-col w-full max-w-xl mx-auto pb-4">
      
      {/* ── HERO HEADLINE & SUB-LINE (SHOWN WHENEVER NO TOPIC CARD IS ON SCREEN) ── */}
      {!showResult && (
        <div data-testid="spin-hero" className="w-full text-center sm:text-left mb-3">
          <h1 className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-on-surface tracking-tight leading-tight">
            Learn something new, <span className="text-primary italic">one spin at a time.</span>
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-1 leading-relaxed">
            Tech, money, mind and world ideas. Works offline.
          </p>
        </div>
      )}

      {/* ── RETURNING USER SLIM STATUS LINE (ONLY WHEN RETURNING AND HAS STREAK OR REVIEWS) ── */}
      {(hasSpunBefore || showResult) && (streak >= 1 || toReviewCount > 0) && (
        <div
          data-testid="spin-status-line"
          className="flex items-center justify-center gap-2 mb-2.5 text-xs font-medium text-on-surface-variant"
        >
          {streak >= 1 && (
            <span className="inline-flex items-center gap-1 font-semibold text-primary">
              <Flame size={13} className="text-amber-500 fill-amber-500" />
              <span><span className="font-mono">{streak}</span>-day streak</span>
            </span>
          )}
          {streak >= 1 && toReviewCount > 0 && <span>·</span>}
          {toReviewCount > 0 && (
            <span>
              <span className="font-mono font-bold">{toReviewCount}</span> to review today
            </span>
          )}
        </div>
      )}

      {/* ── THE REEL (3 CARDS VISIBLE) ── */}
      <div className="w-full">
        {loadingData ? (
          <div data-testid="reel-skeleton" className="w-full h-24 rounded-2xl bg-surface-container-low border border-outline-variant/30 animate-pulse flex items-center justify-center gap-3 px-4">
            <div className="w-24 h-16 rounded-xl bg-surface-container-high/60" />
            <div className="w-28 h-16 rounded-xl bg-surface-container-high/80" />
            <div className="w-24 h-16 rounded-xl bg-surface-container-high/60" />
          </div>
        ) : (
          <div
            ref={containerRef}
            className="relative w-full h-24 sm:h-28 overflow-hidden rounded-2xl dial-chassis flex items-center select-none shadow-md"
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
            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center justify-between pointer-events-none w-8">
              <div className="flex flex-col items-center -mt-0.5 filter drop-shadow">
                <div className={`w-3 h-3 bg-primary rotate-45 border-2 border-surface transition-all duration-300 ${isReticleFlash ? 'brightness-150 scale-125 shadow-[0_0_16px_rgba(181,80,46,1)]' : 'shadow-[0_0_8px_rgba(var(--color-primary),0.8)]'}`} />
                <div className="w-[1.5px] h-2 bg-primary" />
              </div>

              <div className="relative flex items-center justify-center">
                <div className={`w-3 h-3 rounded-full border border-primary/60 flex items-center justify-center transition-all duration-300 ${isSpinning ? 'scale-125 border-primary shadow-[0_0_8px_rgba(var(--color-primary),0.8)]' : isLanded ? 'scale-110 border-primary ring-2 ring-primary/40' : 'scale-90'}`}>
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                </div>
              </div>

              <div className="flex flex-col items-center -mb-0.5 filter drop-shadow">
                <div className="w-[1.5px] h-2 bg-primary" />
                <div className={`w-3 h-3 bg-primary rotate-45 border-2 border-surface transition-all duration-300 ${isReticleFlash ? 'brightness-150 scale-125 shadow-[0_0_16px_rgba(181,80,46,1)]' : 'shadow-[0_0_8px_rgba(var(--color-primary),0.8)]'}`} />
              </div>
            </div>

            {/* Expanding Landing Ring (Primary Color rgb 181 80 46) */}
            <AnimatePresence>
              {showLandingRing && (
                <motion.div
                  key="landing-ring"
                  data-testid="landing-ring"
                  initial={{ width: 16, height: 16, opacity: 1 }}
                  animate={{ width: 140, height: 140, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  style={{ borderColor: 'rgb(181, 80, 46)' }}
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 pointer-events-none z-25"
                />
              )}
            </AnimatePresence>

            {/* Vignette Edge Gradient Masks */}
            <div className="absolute inset-y-0 left-0 w-8 sm:w-16 bg-gradient-to-r from-surface via-surface/80 to-transparent z-20 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-8 sm:w-16 bg-gradient-to-l from-surface via-surface/80 to-transparent z-20 pointer-events-none" />

            {/* Animated Reel Strip */}
            <motion.div
              className="flex items-center absolute left-0"
              style={{ gap: `${ITEM_GAP}px`, x: motionX }}
            >
              {stripCards.map((item, idx) => (
                <PrecisionReelCard
                  key={`${item.id || item.title || idx}-${idx}`}
                  item={item}
                  idx={idx}
                  motionX={motionX}
                  containerWidth={containerWidth}
                  isSelectedTarget={isLanded && (idx === reelIndex)}
                  isLandingScale={isLandingScale && isLanded && (idx === reelIndex)}
                />
              ))}
            </motion.div>
          </div>
        )}
      </div>

      {/* ── 404 NOT FOUND STATE ── */}
      {isNotFound && !isSpinning && (
        <div className="w-full mt-3" data-testid="topic-not-found-card">
          <div className="w-full rounded-2xl bg-surface-container-high border border-outline-variant/40 p-6 sm:p-8 text-center space-y-3 shadow-sm">
            <h1 className="font-display text-xl sm:text-2xl font-bold text-on-surface">
              Topic not found
            </h1>
            <p className="text-sm text-on-surface-variant max-w-md mx-auto">
              We couldn't find that topic. It may have been removed or the link is wrong.
            </p>
            <div className="pt-2">
              <Button
                variant="primary"
                onClick={() => {
                  setIsNotFound(false);
                  if (typeof window !== 'undefined') {
                    window.location.hash = '#/spin';
                    if (window.history.pushState) {
                      const url = new URL(window.location);
                      url.searchParams.delete('topic');
                      url.searchParams.delete('t');
                      window.history.pushState({}, '', url.pathname + url.search + '#/spin');
                    }
                  }
                }}
                className="px-6 py-2.5 text-xs font-semibold cursor-pointer"
              >
                Back to Spin
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── POST-SPIN TOPIC CARD ── */}
      {showResult && currentTopic && !isSpinning && (
        <div className="w-full mt-3">
          <motion.article
            key={currentTopic.id}
            data-testid="post-spin-topic-card"
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.98 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.25, ease: 'easeOut' }}
            className="w-full journal-card rounded-2xl p-4 sm:p-6 border border-outline-variant/30 relative shadow-sm"
          >
            {/* Category Breadcrumb & Dive Time */}
            <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-outline-variant/20 flex-wrap gap-2">
              <div className="flex items-center gap-1.5 text-xs font-medium">
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-mono font-bold uppercase tracking-wider text-[10px]">
                  {CATEGORY_TREE.find(g => g.group === currentTopic.group)?.label || currentTopic.group || 'Topic'}
                </span>
                <span className="text-outline">/</span>
                <span className="text-on-surface font-semibold">
                  {CATEGORY_META[currentTopic.category]?.shortLabel || currentTopic.category}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {currentTopic?.is_custom && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-semibold">
                    <Sparkles size={11} />
                    <span>Custom</span>
                  </span>
                )}
                {currentTopic?.lesson && (
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-xs">
                    <Clock size={11} className="text-outline" />
                    <span>~2 min dive</span>
                  </div>
                )}
              </div>
            </div>

            {/* Topic Headline */}
            <h2 className="editorial-title text-xl sm:text-2xl lg:text-3xl font-bold text-on-surface tracking-tight leading-snug">
              {currentTopic.title}
            </h2>

            {/* Topic Lesson Blocks or Fallback Description */}
            {currentTopic?.lesson ? (
              <div className="mt-3.5 space-y-3" data-testid="topic-lesson-blocks">
                <div className="rounded-xl p-3 bg-surface-container/50 border border-outline-variant/20">
                  <div className="text-xs font-bold uppercase tracking-wider text-primary mb-1">
                    The idea
                  </div>
                  <p className="text-xs sm:text-sm text-on-surface/90 leading-relaxed font-normal">
                    {currentTopic.lesson.idea}
                  </p>
                </div>

                <div className="rounded-xl p-3 bg-surface-container/50 border border-outline-variant/20">
                  <div className="text-xs font-bold uppercase tracking-wider text-primary mb-1">
                    Why it matters
                  </div>
                  <p className="text-xs sm:text-sm text-on-surface/90 leading-relaxed font-normal">
                    {currentTopic.lesson.why}
                  </p>
                </div>

                <div className="rounded-xl p-3 bg-surface-container/50 border border-outline-variant/20">
                  <div className="text-xs font-bold uppercase tracking-wider text-primary mb-1">
                    Example
                  </div>
                  <p className="text-xs sm:text-sm text-on-surface/90 leading-relaxed font-normal">
                    {currentTopic.lesson.example}
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-2.5 text-sm sm:text-base text-on-surface/90 leading-relaxed font-normal space-y-2">
                <p className="leading-relaxed">
                  {currentTopic.description || currentTopic.desc}
                </p>
              </div>
            )}

            {/* References & Deep Dives */}
            {resources.length > 0 && (() => {
              const firstSource = resources[0];
              const moreSources = resources.slice(1);
              const firstSourceTitle = firstSource.label || firstSource.title || 'Explore Reference';

              return (
                <div className="mt-4 pt-3 border-t border-outline-variant/20 space-y-2.5">
                  {/* First source: full-width solid button */}
                  <a
                    href={firstSource.url || '#'}
                    rel="noopener noreferrer"
                    target="_blank"
                    data-testid="go-deeper-button"
                    className="w-full flex items-center justify-between p-3.5 rounded-xl bg-primary text-on-primary font-medium hover:bg-primary/90 transition-all shadow-xs text-left cursor-pointer group break-words leading-snug gap-2"
                  >
                    <span className="text-xs sm:text-sm font-semibold break-words leading-snug flex-1">
                      {`Go deeper: ${firstSourceTitle}`}
                    </span>
                    <ExternalLink size={15} className="shrink-0 text-on-primary/80 group-hover:text-on-primary transition-colors" />
                  </a>

                  {/* Other sources under "More sources" toggle */}
                  {moreSources.length > 0 && (
                    <details className="text-xs text-on-surface-variant group pt-1">
                      <summary className="cursor-pointer font-medium hover:text-primary transition-colors select-none flex items-center gap-1">
                        <span>More sources ({moreSources.length})</span>
                      </summary>
                      <div className="mt-2 space-y-2">
                        {moreSources.map((res, i) => (
                          <a
                            key={i}
                            href={res.url || '#'}
                            rel="noopener noreferrer"
                            target="_blank"
                            className="group flex flex-col p-2.5 rounded-xl bg-surface-container/60 hover:bg-surface-container border border-outline-variant/30 hover:border-primary/50 transition-all shadow-xs w-full"
                          >
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="px-1.5 py-0.5 rounded bg-surface-container-high text-primary text-[10px] font-mono uppercase font-bold tracking-wider">
                                {res.type || 'SOURCE'}
                              </span>
                              <ExternalLink size={13} className="text-on-surface-variant group-hover:text-primary transition-colors shrink-0" />
                            </div>
                            <span className="text-xs sm:text-sm text-on-surface font-semibold group-hover:text-primary transition-colors break-words leading-snug">
                              {res.label || res.title || 'Explore Reference'}
                            </span>
                            {res.desc && (
                              <p className="text-xs text-on-surface-variant mt-0.5 break-words leading-snug">
                                {res.desc}
                              </p>
                            )}
                          </a>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              );
            })()}

            {/* Action Toolbar: Learned, Spin another, Share in ONE row */}
            <div className="mt-4 pt-3 border-t border-outline-variant/20 flex flex-row items-center justify-between gap-2 w-full">
              <Button
                variant={isLearned ? 'outline' : 'primary'}
                onClick={handleMarkLearned}
                disabled={isMarkingLearned}
                className={`h-10 px-3 text-xs sm:text-sm font-semibold flex-1 shadow-xs cursor-pointer whitespace-nowrap min-w-0 ${
                  isLearned ? 'border-emerald-500/40 text-emerald-500 bg-emerald-500/10' : ''
                }`}
              >
                {isMarkingLearned ? (
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                  <Check size={14} className={isLearned ? 'text-emerald-500' : ''} />
                )}
                <span className="truncate">{isLearned ? 'Learned' : 'Learned'}</span>
              </Button>

              <Button
                variant="ghost"
                onClick={handleSpin}
                disabled={isSpinning}
                aria-label="Spin another topic"
                className="h-10 px-3 text-xs sm:text-sm font-medium border border-outline-variant/30 hover:border-outline-variant/60 focus-visible:ring-2 focus-visible:ring-primary cursor-pointer whitespace-nowrap flex-1 min-w-0"
              >
                <RotateCw size={14} />
                <span className="truncate">Spin another</span>
              </Button>

              <button
                type="button"
                onClick={handleShareTopic}
                aria-label="Share topic"
                title="Share topic link"
                className="h-10 w-10 min-w-[40px] rounded-xl border border-outline-variant/30 hover:border-outline-variant/60 flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors focus-visible:ring-2 focus-visible:ring-primary cursor-pointer shrink-0"
              >
                <Share2 size={15} />
              </button>
            </div>
          </motion.article>
        </div>
      )}

      {/* ── ONE FULL-WIDTH BUTTON LABELLED "SPIN", 56PX TALL ── */}
      <div className="w-full mt-3">
        {loadingData ? (
          <button
            type="button"
            data-testid="primary-spin-button"
            disabled={true}
            className="w-full h-14 min-h-[56px] rounded-2xl bg-primary bg-[linear-gradient(90deg,#ba5c3c,#ab4c2b,#ba5c3c)] text-white font-bold text-base tracking-wide flex items-center justify-center gap-2 opacity-75 cursor-not-allowed"
            style={{
              backgroundColor: '#b5502e',
              backgroundImage: 'linear-gradient(90deg, #ba5c3c, #ab4c2b, #ba5c3c)'
            }}
          >
            <RotateCw size={18} className="animate-spin" />
            <span>Loading...</span>
          </button>
        ) : eligibleTopics.length === 0 ? (
          <button
            type="button"
            data-testid="primary-spin-button"
            onClick={navigateToLibrary}
            className="w-full h-14 min-h-[56px] rounded-2xl bg-surface-container-high border border-outline-variant text-on-surface font-semibold text-sm flex items-center justify-center gap-2 hover:border-primary/50 transition-all cursor-pointer"
          >
            <span>No active topics — Choose interests</span>
          </button>
        ) : (
          <button
            type="button"
            id="spin-button"
            data-testid="primary-spin-button"
            onClick={handleSpin}
            disabled={isSpinning}
            className="w-full h-14 min-h-[56px] rounded-2xl bg-primary bg-[linear-gradient(90deg,#ba5c3c,#ab4c2b,#ba5c3c)] text-white font-bold text-base tracking-wide flex items-center justify-center gap-2 shadow-md hover:brightness-105 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            style={{
              backgroundColor: '#b5502e',
              backgroundImage: 'linear-gradient(90deg, #ba5c3c, #ab4c2b, #ba5c3c)'
            }}
          >
            <RotateCw
              size={18}
              className={`transition-transform ${isSpinning ? 'animate-spin' : ''}`}
            />
            <span>{isSpinning ? 'Spinning...' : 'Spin'}</span>
            <span className="hidden [@media(pointer:fine)]:inline text-xs font-mono font-normal text-white ml-1">
              (Space)
            </span>
          </button>
        )}
      </div>

      {/* ── ONE ROW OF 4 SMALL GROUP TOGGLES (TECH, MONEY, MIND, WORLD) — ALL ON BY DEFAULT ── */}
      <div className="w-full mt-2.5">
        <div className="grid grid-cols-4 gap-1.5 sm:gap-2 w-full">
          {CATEGORY_TREE.map(groupDef => {
            const groupActive = isGroupActive(groupDef);
            const shortLabel = GROUP_SHORT_LABELS[groupDef.group] || groupDef.label;
            return (
              <button
                key={groupDef.group}
                type="button"
                aria-pressed={groupActive ? 'true' : 'false'}
                aria-label={`Toggle ${shortLabel}`}
                data-testid={`spin-group-pill-${groupDef.group}`}
                onClick={() => toggleBroadGroup(groupDef.group)}
                className={`h-9 sm:h-10 rounded-xl px-2 flex items-center justify-center gap-1.5 text-xs transition-all cursor-pointer select-none border focus-visible:ring-2 focus-visible:ring-primary ${
                  groupActive
                    ? 'bg-primary text-white border-primary font-semibold shadow-xs'
                    : 'bg-transparent text-on-surface-variant border border-outline-variant/50 hover:border-outline-variant hover:text-on-surface font-medium'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    groupActive ? 'bg-white' : 'border border-current bg-transparent'
                  }`}
                />
                <span className="truncate">{shortLabel}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── ARIA LIVE REGION FOR SCREEN READERS ── */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {showResult && currentTopic
          ? `Selected concept: ${currentTopic.title} in ${CATEGORY_TREE.find(g => g.group === currentTopic.group)?.label || currentTopic.group || 'Topic Collection'}.`
          : isSpinning
          ? 'Spinning topic reel...'
          : ''}
      </div>

    </div>
  );
};

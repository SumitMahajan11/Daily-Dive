import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Flame,
  CheckCircle2,
  Clock,
  Compass,
  Sparkles,
  RotateCw,
  HardDrive,
  Trash2,
  ShieldCheck,
  Filter,
  Calendar,
  Layers,
  ArrowUpRight,
  TrendingUp,
  Brain,
  Globe,
  UploadCloud,
  Zap,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { Button } from '../UI/Button';
import { Skeleton } from '../UI/Skeleton';
import {
  getLocalCalendarDate,
  reconcileStreakWithActivity,
  MAX_HISTORY_ENTRIES,
  MAX_HISTORY_AGE_DAYS
} from '../../lib/roulette';

// Motion variants for smooth list entrance
const listContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04 }
  }
};

const listItemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.22, ease: 'easeOut' } }
};

export const ProgressScreen = ({ onReviewTopic }) => {
  const {
    topics,
    userProgressMap,
    userStreaks,
    effectiveStreak,
    history = [],
    clearHistory,
    setCurrentTopic,
    loadingData,
    showToast
  } = useData();

  const [historyFilter, setHistoryFilter] = useState('all');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // ── 14-DAY STREAK ACTIVITY STRIP & CANONICAL RECONCILED STREAK ──
  const { streakDays, reconciledStreak } = useMemo(() => {
    const today = new Date();
    const todayStr = getLocalCalendarDate(today);
    const days = [];

    // Map all days with activity from history or progress
    const activeDates = new Set();
    history.forEach(h => {
      if (h.local_date) activeDates.add(h.local_date);
    });
    Object.values(userProgressMap || {}).forEach(p => {
      if (p.last_seen) activeDates.add(p.last_seen.slice(0, 10));
    });
    if (userStreaks?.last_active_date) {
      activeDates.add(userStreaks.last_active_date);
    }

    const DAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = getLocalCalendarDate(d);
      const isToday = dateStr === todayStr;
      const hasActivity = activeDates.has(dateStr);

      days.push({
        dateStr,
        dayName: DAY_NAMES[d.getDay()],
        dayNum: d.getDate(),
        isToday,
        hasActivity
      });
    }

    const reconciled = reconcileStreakWithActivity(userStreaks, activeDates, today);

    return { streakDays: days, reconciledStreak: reconciled };
  }, [history, userProgressMap, userStreaks]);

  // ── CORE METRICS (RECONCILED TO GROUND TRUTH) ──
  const activeStreak = reconciledStreak.current_streak;
  const longestStreak = reconciledStreak.longest_streak;
  const isActiveToday = Boolean(reconciledStreak.is_active_today);
  const isStreakBroken = Boolean(reconciledStreak.is_broken);

  const totalTopics = topics.length || 692;
  const uniqueExploredCount = Object.keys(userProgressMap).filter(id => userProgressMap[id]?.times_seen > 0).length;
  const percentageExplored = Math.round((uniqueExploredCount / totalTopics) * 100);

  const learnedCount = Object.keys(userProgressMap).filter(id => userProgressMap[id]?.learned).length;
  const percentageLearned = Math.round((learnedCount / totalTopics) * 100);

  const totalSpinsCount = useMemo(() => {
    const fromHist = history.filter(h => h.action === 'spin').length;
    const fromProg = Object.values(userProgressMap).reduce((sum, p) => sum + (p.times_seen || 0), 0);
    return Math.max(fromHist, fromProg);
  }, [history, userProgressMap]);

  // ── CATEGORY & SOURCE COVERAGE ──
  const categoryCoverage = useMemo(() => {
    const GROUPS = [
      { id: 'tech', label: 'Tech', color: 'bg-primary', icon: Brain },
      { id: 'money-career', label: 'Money & Career', color: 'bg-tertiary', icon: TrendingUp },
      { id: 'mind-growth', label: 'Mind & Growth', color: 'bg-secondary', icon: Compass },
      { id: 'world-ideas', label: 'World & Ideas', color: 'bg-cyan-500', icon: Globe }
    ];

    const groupStats = GROUPS.map(g => {
      const groupTopics = topics.filter(t => (t.group_name || t.group) === g.id && !t.is_custom);
      const total = groupTopics.length;
      const seen = groupTopics.filter(t => userProgressMap[t.id]?.times_seen > 0).length;
      const learned = groupTopics.filter(t => userProgressMap[t.id]?.learned).length;
      const pct = total > 0 ? Math.round((seen / total) * 100) : 0;
      return { ...g, total, seen, learned, pct };
    });

    // Custom Uploads category if present
    const customTopicsList = topics.filter(t => t.is_custom);
    if (customTopicsList.length > 0) {
      const total = customTopicsList.length;
      const seen = customTopicsList.filter(t => userProgressMap[t.id]?.times_seen > 0).length;
      const learned = customTopicsList.filter(t => userProgressMap[t.id]?.learned).length;
      const pct = total > 0 ? Math.round((seen / total) * 100) : 0;
      groupStats.push({
        id: 'custom',
        label: 'Custom Uploads',
        color: 'bg-amber-500',
        icon: UploadCloud,
        total,
        seen,
        learned,
        pct
      });
    }

    return groupStats;
  }, [topics, userProgressMap]);

  // ── FILTERED HISTORY LOG ──
  const filteredHistory = useMemo(() => {
    const todayStr = getLocalCalendarDate(new Date());
    const weekAgoMs = Date.now() - (7 * 86400000);

    return history.filter(item => {
      if (historyFilter === 'today') {
        return item.local_date === todayStr;
      }
      if (historyFilter === 'week') {
        const itemTime = new Date(item.timestamp).getTime();
        return !isNaN(itemTime) && itemTime >= weekAgoMs;
      }
      if (historyFilter === 'learned') {
        return item.action === 'learned' || userProgressMap[item.topic_id]?.learned;
      }
      if (historyFilter === 'custom') {
        return Boolean(item.is_custom);
      }
      return true;
    });
  }, [history, historyFilter, userProgressMap]);

  // Review Queue (topics seen earlier sorted by oldest last_seen)
  const reviewQueue = useMemo(() => {
    return topics
      .filter(t => userProgressMap[t.id]?.times_seen > 0)
      .sort((a, b) => {
        const aTime = new Date(userProgressMap[a.id]?.last_seen || 0).getTime();
        const bTime = new Date(userProgressMap[b.id]?.last_seen || 0).getTime();
        return aTime - bTime;
      })
      .slice(0, 4);
  }, [topics, userProgressMap]);

  const handleReviewClick = (topic) => {
    setCurrentTopic(topic);
    if (onReviewTopic) onReviewTopic(topic);
    // Smoothly scroll to spin section
    const spinEl = document.getElementById('spin');
    if (spinEl) {
      spinEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleConfirmClear = () => {
    if (clearHistory) clearHistory();
    setShowClearConfirm(false);
  };

  const formatTimestamp = (isoStr) => {
    if (!isoStr) return '';
    try {
      const d = new Date(isoStr);
      const todayStr = getLocalCalendarDate(new Date());
      const itemDateStr = getLocalCalendarDate(d);

      const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      if (itemDateStr === todayStr) {
        return `Today, ${timeStr}`;
      }
      return `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${timeStr}`;
    } catch (e) {
      return isoStr.slice(0, 10);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto pb-10 space-y-6">

      {/* ── 1. HONEST LOCAL STORAGE NOTICE BANNER ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.35 }}
        className="flex items-start gap-3 p-3.5 sm:p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 text-xs text-on-surface-variant shadow-sm"
      >
        <ShieldCheck size={18} className="text-secondary shrink-0 mt-0.5" />
        <div className="flex flex-col space-y-0.5">
          <span className="font-semibold text-on-surface text-[13px]">
            Device-Local Learning Engine · Privacy-First
          </span>
          <p className="leading-relaxed">
            Your streaks, stats, and exploration history are stored <strong>strictly inside this browser</strong> on this device. No account is required, and your study data is never tracked or shared.
          </p>
        </div>
      </motion.div>

      {/* ── 2. ESSENTIAL METRICS GRID ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.4 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      >
        {/* Metric 1: Current Streak */}
        <div className="journal-card p-4 rounded-2xl flex flex-col justify-between space-y-2 border border-outline-variant/20 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] text-on-surface-variant font-medium uppercase tracking-wider">
              Streak
            </span>
            <Flame
              size={18}
              className={isActiveToday ? 'text-amber-500 fill-amber-500 animate-pulse' : 'text-outline/40'}
            />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="font-display text-3xl font-bold text-on-surface">{activeStreak}</span>
              <span className="text-xs text-on-surface-variant font-mono">days</span>
            </div>
            <p className="text-[11px] text-on-surface-variant mt-0.5">
              {isActiveToday ? 'Maintained today 🔥' : isStreakBroken ? 'Streak lapsed' : 'Spin to maintain'}
            </p>
          </div>
          <div className="pt-2 border-t border-outline-variant/15 text-[10px] font-mono text-outline">
            Best: <span className="font-semibold text-on-surface">{longestStreak}d</span>
          </div>
        </div>

        {/* Metric 2: Total Spins / Dives */}
        <div className="journal-card p-4 rounded-2xl flex flex-col justify-between space-y-2 border border-outline-variant/20 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] text-on-surface-variant font-medium uppercase tracking-wider">
              Total Dives
            </span>
            <RotateCw size={17} className="text-primary/70" />
          </div>
          <div>
            <span className="font-display text-3xl font-bold text-on-surface">{totalSpinsCount}</span>
            <p className="text-[11px] text-on-surface-variant mt-0.5">Spins executed</p>
          </div>
          <div className="pt-2 border-t border-outline-variant/15 text-[10px] font-mono text-outline">
            All-time roulette activity
          </div>
        </div>

        {/* Metric 3: Unique Explored */}
        <div className="journal-card p-4 rounded-2xl flex flex-col justify-between space-y-2 border border-outline-variant/20 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] text-on-surface-variant font-medium uppercase tracking-wider">
              Explored
            </span>
            <Compass size={17} className="text-secondary/80" />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="font-display text-3xl font-bold text-on-surface">{uniqueExploredCount}</span>
              <span className="text-xs text-on-surface-variant font-mono">/ {totalTopics}</span>
            </div>
            <p className="text-[11px] text-on-surface-variant mt-0.5">{percentageExplored}% pool coverage</p>
          </div>
          <div className="pt-2 border-t border-outline-variant/15 text-[10px] font-mono text-outline">
            Unique topics seen
          </div>
        </div>

        {/* Metric 4: Mastered / Learned */}
        <div className="journal-card p-4 rounded-2xl flex flex-col justify-between space-y-2 border border-outline-variant/20 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] text-on-surface-variant font-medium uppercase tracking-wider">
              Mastered
            </span>
            <CheckCircle2 size={17} className="text-emerald-500" />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="font-display text-3xl font-bold text-on-surface">{learnedCount}</span>
              <span className="text-xs text-on-surface-variant font-mono">topics</span>
            </div>
            <p className="text-[11px] text-on-surface-variant mt-0.5">{percentageLearned}% confirmed</p>
          </div>
          <div className="pt-2 border-t border-outline-variant/15 text-[10px] font-mono text-outline">
            Marked as learned
          </div>
        </div>
      </motion.div>

      {/* ── 3. 14-DAY STREAK CONTINUITY STRIP ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="journal-card p-5 rounded-2xl border border-outline-variant/20 space-y-3 shadow-sm"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-primary" />
            <h4 className="font-display text-sm font-bold text-on-surface">14-Day Streak Matrix</h4>
          </div>
          <span className="text-[11px] font-mono text-on-surface-variant">
            Basis: Device-Local Calendar Day
          </span>
        </div>

        <div className="grid grid-cols-7 sm:grid-cols-14 gap-1.5 sm:gap-2 pt-1">
          {streakDays.map(day => (
            <div
              key={day.dateStr}
              title={`${day.dateStr}: ${day.hasActivity ? 'Active dive logged' : 'No activity'}`}
              className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all ${
                day.isToday
                  ? 'border-primary ring-1 ring-primary/40 bg-primary/10'
                  : day.hasActivity
                  ? 'border-outline-variant/30 bg-surface-container-high'
                  : 'border-outline-variant/15 bg-surface-container-low opacity-60'
              }`}
            >
              <span className="text-[10px] font-mono text-on-surface-variant font-semibold">
                {day.dayName}
              </span>
              <div
                className={`w-6 h-6 my-1 rounded-full flex items-center justify-center text-xs font-bold transition-transform ${
                  day.hasActivity
                    ? 'bg-gradient-to-tr from-primary to-tertiary text-white shadow-sm scale-105'
                    : 'bg-surface-container-highest text-on-surface-variant'
                }`}
              >
                {day.hasActivity ? '✓' : day.dayNum}
              </div>
              <span className="text-[9px] font-mono text-outline">
                {day.isToday ? 'Today' : day.dayNum}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── 4. CATEGORY & SOURCE COVERAGE BREAKDOWN ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.4, delay: 0.08 }}
        className="journal-card p-5 rounded-2xl border border-outline-variant/20 space-y-4 shadow-sm"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers size={16} className="text-secondary" />
            <h4 className="font-display text-sm font-bold text-on-surface">Knowledge Group Distribution</h4>
          </div>
          <span className="text-[11px] font-mono text-on-surface-variant">
            {totalTopics} total topics spinnable
          </span>
        </div>

        <div className="space-y-3">
          {categoryCoverage.map((cat, idx) => {
            const IconComponent = cat.icon;
            return (
              <div key={cat.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-medium text-on-surface">
                    <IconComponent size={14} className="text-on-surface-variant" />
                    <span>{cat.label}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-on-surface-variant text-[11px]">
                    <span>{cat.seen} of {cat.total} explored ({cat.pct}%)</span>
                    {cat.learned > 0 && (
                      <span className="text-emerald-500 font-semibold">· {cat.learned} mastered</span>
                    )}
                  </div>
                </div>

                <div className="w-full bg-surface-container-high h-2.5 rounded-full overflow-hidden p-0.5 border border-outline-variant/15">
                  <motion.div
                    className={`${cat.color} h-full rounded-full`}
                    initial={{ width: 0 }}
                    animate={{ width: `${cat.pct}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut', delay: idx * 0.05 }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* ── 5. TOPIC EXPLORATION HISTORY LOG ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="journal-card p-5 rounded-2xl border border-outline-variant/20 space-y-4 shadow-sm"
      >
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-tertiary" />
            <h4 className="font-display text-sm font-bold text-on-surface">Exploration History</h4>
            <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-[11px] font-mono text-on-surface-variant">
              {history.length}
            </span>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { id: 'all', label: 'All' },
              { id: 'today', label: 'Today' },
              { id: 'week', label: '7 Days' },
              { id: 'learned', label: 'Learned' },
              { id: 'custom', label: 'Uploads' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setHistoryFilter(tab.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                  historyFilter === tab.id
                    ? 'bg-primary text-white font-semibold shadow-sm'
                    : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface border border-outline-variant/20'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* History Item List */}
        {filteredHistory.length === 0 ? (
          <div className="py-8 text-center text-xs text-on-surface-variant flex flex-col items-center justify-center space-y-2 border border-dashed border-outline-variant/30 rounded-xl bg-surface-container-low/50">
            <BookOpen size={32} className="text-outline/40" />
            <p className="max-w-xs leading-relaxed">
              {historyFilter === 'all'
                ? 'No topics spun yet. Use the roulette above to explore your first dive!'
                : `No history entries match the "${historyFilter}" filter.`}
            </p>
          </div>
        ) : (
          <motion.div
            variants={listContainerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-2 max-h-[380px] overflow-y-auto pr-1"
          >
            {filteredHistory.map(item => {
              const matchedTopic = topics.find(t => t.id === item.topic_id) || item;
              const isLearned = item.action === 'learned' || userProgressMap[item.topic_id]?.learned;

              return (
                <motion.div
                  key={item.id}
                  variants={listItemVariants}
                  className="flex items-center justify-between p-3 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/20 transition-all gap-3"
                >
                  <div className="flex flex-col space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                          isLearned
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                            : 'bg-primary/10 text-primary border border-primary/20'
                        }`}
                      >
                        {isLearned ? 'Learned' : 'Spun'}
                      </span>

                      <span className="text-[11px] font-mono text-outline uppercase">
                        {item.group_name} / {item.category}
                      </span>

                      {item.is_custom && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-mono font-semibold border border-amber-500/25">
                          Custom Upload{item.source ? ` (${item.source})` : ''}
                        </span>
                      )}
                    </div>

                    <h5 className="font-semibold text-sm text-on-surface truncate">
                      {item.title}
                    </h5>

                    <span className="text-[11px] font-mono text-on-surface-variant flex items-center gap-1">
                      <Clock size={11} className="text-outline" />
                      {formatTimestamp(item.timestamp)}
                    </span>
                  </div>

                  <Button
                    variant="ghost"
                    onClick={() => handleReviewClick(matchedTopic)}
                    className="px-3 py-1.5 text-xs bg-surface-container-highest text-on-surface hover:bg-primary-container hover:text-white shrink-0 cursor-pointer"
                  >
                    Dive In
                  </Button>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* History Footer & Retention Policy Notice */}
        <div className="pt-3 border-t border-outline-variant/20 flex items-center justify-between flex-wrap gap-2 text-[11px] font-mono text-on-surface-variant">
          <span>
            Retention: Capped at {MAX_HISTORY_ENTRIES} entries · Pruned after {MAX_HISTORY_AGE_DAYS} days
          </span>

          {history.length > 0 && (
            <div>
              {showClearConfirm ? (
                <div className="flex items-center gap-2">
                  <span className="text-error font-medium">Clear all?</span>
                  <button
                    type="button"
                    onClick={handleConfirmClear}
                    className="px-2 py-0.5 rounded bg-error text-white font-bold text-[10px] cursor-pointer"
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowClearConfirm(false)}
                    className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface text-[10px] cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(true)}
                  className="flex items-center gap-1 text-on-surface-variant hover:text-error transition-colors cursor-pointer"
                >
                  <Trash2 size={12} />
                  <span>Clear History</span>
                </button>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* ── 6. SPACED REPETITION REVIEW QUEUE ── */}
      {reviewQueue.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.4, delay: 0.12 }}
          className="journal-card p-5 rounded-2xl border border-outline-variant/20 space-y-3 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-amber-500" />
              <h4 className="font-display text-sm font-bold text-on-surface">Spaced Repetition Review Queue</h4>
            </div>
            <span className="text-[11px] font-mono text-on-surface-variant">
              Oldest explored topics
            </span>
          </div>

          <div className="space-y-2">
            {reviewQueue.map(topic => {
              const prog = userProgressMap[topic.id];
              const daysAgo = prog?.last_seen 
                ? Math.max(0, Math.floor((Date.now() - new Date(prog.last_seen).getTime()) / 86400000))
                : 0;

              return (
                <div
                  key={topic.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/15 transition-all gap-2"
                >
                  <div className="flex flex-col space-y-0.5 min-w-0 flex-1">
                    <span className="text-sm font-semibold text-on-surface truncate">{topic.title}</span>
                    <span className="text-xs text-on-surface-variant truncate">
                      {topic.group_name || topic.group} / {topic.category || topic.sub} · Explored {daysAgo === 0 ? 'today' : `${daysAgo}d ago`}
                    </span>
                  </div>

                  <Button
                    variant="ghost"
                    onClick={() => handleReviewClick(topic)}
                    className="px-3 py-1.5 text-xs bg-surface-container-highest text-on-surface hover:bg-primary-container hover:text-white shrink-0 cursor-pointer"
                  >
                    Review
                  </Button>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

    </div>
  );
};

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame,
  Check,
  RotateCw,
  Clock,
  Zap,
  Trash2,
  ChevronDown
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { Button } from '../UI/Button';
import { Skeleton } from '../UI/Skeleton';
import {
  getLocalCalendarDate,
  reconcileStreakWithActivity
} from '../../lib/roulette';

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

  // ── 7-DAY STREAK ACTIVITY STRIP ──
  const { streakDays, reconciledStreak } = useMemo(() => {
    const today = new Date();
    const todayStr = getLocalCalendarDate(today);
    const days = [];

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

    // 7 days window
    for (let i = 6; i >= 0; i--) {
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

  const activeStreak = reconciledStreak.current_streak;
  const longestStreak = reconciledStreak.longest_streak;
  const isActiveToday = Boolean(reconciledStreak.is_active_today);

  const learnedCount = Object.keys(userProgressMap).filter(id => userProgressMap[id]?.learned).length;

  // Single Source of Truth derivations
  const totalSpinsCount = useMemo(() => {
    return history.filter(h => h.action === 'spin' || !h.action).length;
  }, [history]);

  const uniqueExploredCount = useMemo(() => {
    return new Set(history.map(h => h.topic_id)).size;
  }, [history]);

  const filteredHistory = useMemo(() => {
    const todayStr = getLocalCalendarDate(new Date());
    const weekAgoMs = Date.now() - (7 * 86400000);

    return history.filter(item => {
      if (historyFilter === 'today') return item.local_date === todayStr;
      if (historyFilter === 'week') {
        const itemTime = new Date(item.timestamp).getTime();
        return !isNaN(itemTime) && itemTime >= weekAgoMs;
      }
      if (historyFilter === 'learned') {
        return item.action === 'learned' || userProgressMap[item.topic_id]?.learned;
      }
      return true;
    });
  }, [history, historyFilter, userProgressMap]);

  // Review Queue: derived strictly from topics present in history log
  const reviewQueue = useMemo(() => {
    const historyTopicIds = new Set(history.map(h => h.topic_id));
    return topics
      .filter(t => historyTopicIds.has(t.id))
      .sort((a, b) => {
        const aTime = new Date(userProgressMap[a.id]?.last_seen || 0).getTime();
        const bTime = new Date(userProgressMap[b.id]?.last_seen || 0).getTime();
        return aTime - bTime;
      })
      .slice(0, 4);
  }, [topics, history, userProgressMap]);

  // 14-day backup reminder logic (dismissible, max once per week)
  const [showBackupNudge, setShowBackupNudge] = useState(() => {
    if (typeof window === 'undefined') return false;
    if (!history || history.length === 0) return false;
    const lastBackupAt = localStorage.getItem('daily_dive_last_backup_at');
    const dismissedAt = localStorage.getItem('daily_dive_backup_nudge_dismissed_at');
    const now = Date.now();

    // Check if dismissed within the last 7 days (max once per week)
    if (dismissedAt) {
      const dismissedMs = new Date(dismissedAt).getTime();
      if (!isNaN(dismissedMs) && (now - dismissedMs) < 7 * 86400000) {
        return false;
      }
    }

    // If never backed up, or last backup was > 14 days ago
    if (!lastBackupAt) return true;
    const backupMs = new Date(lastBackupAt).getTime();
    return isNaN(backupMs) || (now - backupMs) >= 14 * 86400000;
  });

  const handleDismissBackupNudge = () => {
    setShowBackupNudge(false);
    try {
      localStorage.setItem('daily_dive_backup_nudge_dismissed_at', new Date().toISOString());
    } catch (e) {}
  };

  const handleTriggerBackupExport = () => {
    const nowIso = new Date().toISOString();
    try {
      localStorage.setItem('daily_dive_last_backup_at', nowIso);
    } catch (e) {}

    let customTopics = [];
    let expiredTopics = [];
    try {
      const ct = localStorage.getItem('daily_dive_custom_topics');
      if (ct) customTopics = JSON.parse(ct);
      const et = localStorage.getItem('daily_dive_expired_custom_topics');
      if (et) expiredTopics = JSON.parse(et);
    } catch (e) {}

    const backupData = {
      schemaVersion: 2,
      version: '2.1.0',
      exported_at: nowIso,
      last_backup_at: nowIso,
      user_progress: userProgressMap,
      user_streaks: userStreaks,
      user_settings: {
        content_source: 'curated',
        reminder_time: '09:00 AM',
        notifications_enabled: false,
        sound_enabled: false,
        haptics_enabled: false
      },
      history: history,
      custom_topics: customTopics,
      expired_custom_topics: expiredTopics,
      theme: typeof window !== 'undefined' ? localStorage.getItem('daily_dive_theme') || 'dark' : 'dark',
      first_run_dismissed: typeof window !== 'undefined' ? localStorage.getItem('daily_dive_first_run_dismissed') === 'true' : false
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `daily-dive-backup-${nowIso.slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowBackupNudge(false);
    if (showToast) showToast('Backup saved to downloads', 'success');
  };

  const handleReviewClick = (topic) => {
    setCurrentTopic(topic);
    if (onReviewTopic) onReviewTopic();
    if (showToast) showToast(`Loaded "${topic.title}" into Spin View`, 'info');
  };

  const handleConfirmClear = () => {
    clearHistory();
    setShowClearConfirm(false);
  };

  const formatTimestamp = (iso) => {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + ' · ' +
             d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto pb-8 space-y-6">
      
      {/* ── SCREEN H1 HEADER & BACKUP REMINDER ── */}
      <div className="flex flex-col gap-1.5">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
          Progress &amp; Stats
        </h1>
        {showBackupNudge && (
          <div
            data-testid="backup-reminder-line"
            className="flex items-center justify-between text-xs py-1.5 px-3 rounded-lg bg-surface-container-low border border-primary/25 text-on-surface-variant"
          >
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span>It’s been a while since your last backup.</span>
              <button
                type="button"
                onClick={handleTriggerBackupExport}
                className="font-semibold text-primary hover:underline cursor-pointer"
              >
                Back up your progress
              </button>
            </div>
            <button
              type="button"
              onClick={handleDismissBackupNudge}
              className="text-on-surface-variant hover:text-on-surface p-0.5 cursor-pointer"
              aria-label="Dismiss backup reminder"
            >
              ×
            </button>
          </div>
        )}
      </div>

      {/* ── THREE METRIC TILES ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* 1. Streak Tile */}
        <div className="journal-card p-4 sm:p-5 rounded-2xl border border-outline-variant/30 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-on-surface-variant">Daily Streak</span>
            <Flame size={18} className={isActiveToday ? 'text-amber-500 fill-amber-500' : 'text-on-surface-variant'} />
          </div>
          <div className="my-2">
            <span className="font-display text-3xl font-bold text-on-surface">{activeStreak}</span>
            <span className="text-xs text-on-surface-variant ml-1.5 font-medium">days</span>
          </div>
          <p className="text-xs text-on-surface-variant">
            {activeStreak === 0 ? 'Start your streak today' : `Best: ${longestStreak} days`}
          </p>
        </div>

        {/* 2. Spins Tile */}
        <div className="journal-card p-4 sm:p-5 rounded-2xl border border-outline-variant/30 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-on-surface-variant">Total Spins</span>
            <RotateCw size={18} className="text-primary" />
          </div>
          <div className="my-2">
            <span className="font-display text-3xl font-bold text-on-surface">{totalSpinsCount}</span>
          </div>
          <p className="text-xs text-on-surface-variant">
            Concepts explored
          </p>
        </div>

        {/* 3. Learned Tile */}
        <div className="journal-card p-4 sm:p-5 rounded-2xl border border-outline-variant/30 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-on-surface-variant">Learned</span>
            <Check size={18} className="text-emerald-500" />
          </div>
          <div className="my-2">
            <span className="font-display text-3xl font-bold text-on-surface">{learnedCount}</span>
          </div>
          <p className="text-xs text-on-surface-variant">
            Mastered topics
          </p>
        </div>
      </div>

      {/* ── 7-DAY ACTIVITY MATRIX ── */}
      <div className="journal-card p-4 sm:p-5 rounded-2xl border border-outline-variant/30 space-y-3">
        <span className="text-xs font-bold text-on-surface">Recent activity</span>
        <div className="grid grid-cols-7 gap-2">
          {streakDays.map((day) => (
            <div
              key={day.dateStr}
              className={`p-2.5 rounded-xl border flex flex-col items-center justify-center transition-all ${
                day.hasActivity
                  ? 'bg-primary-container/20 border-primary/40 text-on-surface'
                  : 'bg-surface-container-lowest/50 border-outline-variant/20 text-on-surface-variant'
              } ${day.isToday ? 'ring-2 ring-primary/40' : ''}`}
            >
              <span className="text-[11px] font-mono font-medium">{day.dayName}</span>
              <span className="font-bold text-sm mt-0.5">{day.dayNum}</span>
              <div className="mt-1">
                {day.hasActivity ? (
                  <Flame size={12} className="text-amber-500 fill-amber-500" />
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-outline-variant/40" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── SPACED REPETITION REVIEW QUEUE (FULL TITLES & AGES, NO ELLIPSIS) ── */}
      {reviewQueue.length > 0 && (
        <div className="journal-card p-4 sm:p-5 rounded-2xl border border-outline-variant/30 space-y-3">
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-amber-500" />
            <h2 className="font-display text-sm font-bold text-on-surface">Review queue</h2>
          </div>

          <div className="space-y-2">
            {reviewQueue.map(topic => {
              const prog = userProgressMap[topic.id];
              const daysAgo = prog?.last_seen 
                ? Math.max(0, Math.floor((Date.now() - new Date(prog.last_seen).getTime()) / 86400000))
                : 0;

              const ageText = daysAgo === 0 
                ? 'Explored today' 
                : daysAgo === 1 
                ? 'Explored 1 day ago' 
                : `Explored ${daysAgo} days ago`;

              return (
                <div
                  key={topic.id}
                  className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/20 flex items-center justify-between gap-3"
                >
                  <div className="flex flex-col space-y-1 min-w-0 flex-1">
                    <span className="text-sm font-semibold text-on-surface break-words leading-snug">
                      {topic.title}
                    </span>
                    <span className="text-xs text-on-surface-variant break-words">
                      {topic.group_name || topic.group} / {topic.category || topic.sub} · {ageText}
                    </span>
                  </div>

                  <Button
                    variant="ghost"
                    onClick={() => handleReviewClick(topic)}
                    className="px-3 py-1.5 text-xs bg-surface-container text-on-surface hover:bg-primary hover:text-white shrink-0 cursor-pointer"
                  >
                    Review
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── COLLAPSED LEARNING HISTORY SECTION ── */}
      <details className="journal-card rounded-2xl p-4 sm:p-5 border border-outline-variant/30 group">
        <summary className="cursor-pointer font-display font-bold text-sm text-on-surface flex items-center justify-between select-none">
          <span>Learning history ({history.length})</span>
          <ChevronDown size={16} className="text-on-surface-variant group-open:rotate-180 transition-transform" />
        </summary>

        <div className="mt-4 pt-3 border-t border-outline-variant/20 space-y-3">
          {/* History Filters */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              {['all', 'today', 'week', 'learned'].map(filterKey => (
                <button
                  key={filterKey}
                  type="button"
                  onClick={() => setHistoryFilter(filterKey)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize cursor-pointer transition-colors ${
                    historyFilter === filterKey
                      ? 'bg-primary text-white'
                      : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {filterKey}
                </button>
              ))}
            </div>

            {history.length > 0 && (
              <div>
                {showClearConfirm ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-error font-medium">Clear all history?</span>
                    <button
                      type="button"
                      onClick={handleConfirmClear}
                      className="px-2 py-0.5 rounded bg-error text-white font-bold text-xs cursor-pointer"
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowClearConfirm(false)}
                      className="px-2 py-0.5 rounded bg-surface-container text-on-surface text-xs cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowClearConfirm(true)}
                    className="flex items-center gap-1 text-xs text-on-surface-variant hover:text-error transition-colors cursor-pointer"
                  >
                    <Trash2 size={13} />
                    <span>Clear history</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {filteredHistory.length === 0 ? (
            <p className="text-xs text-on-surface-variant py-2">
              No entries match the selected filter.
            </p>
          ) : (
            <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
              {filteredHistory.map(item => {
                const matchedTopic = topics.find(t => t.id === item.topic_id) || item;
                const isLearned = item.action === 'learned' || userProgressMap[item.topic_id]?.learned;

                return (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 flex items-center justify-between gap-2.5"
                  >
                    <div className="flex flex-col space-y-0.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                          isLearned ? 'bg-emerald-500/15 text-emerald-500' : 'bg-primary/10 text-primary'
                        }`}>
                          {isLearned ? 'Learned' : 'Spun'}
                        </span>
                        <span className="text-[11px] font-mono text-on-surface-variant">
                          {formatTimestamp(item.timestamp)}
                        </span>
                      </div>
                      <span className="font-semibold text-xs text-on-surface truncate">
                        {item.title}
                      </span>
                    </div>

                    <Button
                      variant="ghost"
                      onClick={() => handleReviewClick(matchedTopic)}
                      className="px-2.5 py-1 text-xs bg-surface-container text-on-surface hover:bg-primary hover:text-white shrink-0 cursor-pointer"
                    >
                      View
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </details>

    </div>
  );
};

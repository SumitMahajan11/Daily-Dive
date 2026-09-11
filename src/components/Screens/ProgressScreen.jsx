import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { Button } from '../UI/Button';

export const ProgressScreen = ({ onReviewTopic }) => {
  const {
    topics,
    userProgressMap,
    userStreaks,
    setCurrentTopic
  } = useData();

  const learnedCount = Object.keys(userProgressMap).length;
  const totalTopics = topics.length || 1;
  const percentageMastered = Math.round((learnedCount / totalTopics) * 100);
  const currentStreak = userStreaks?.current_streak || 0;
  const longestStreak = userStreaks?.longest_streak || 0;

  // Build 90-day activity heatmap data with relative intensity
  const { heatmapCells, monthLabels } = useMemo(() => {
    const activityCounts = {};
    Object.values(userProgressMap).forEach(prog => {
      if (prog.last_seen) {
        const dateKey = prog.last_seen.slice(0, 10);
        activityCounts[dateKey] = (activityCounts[dateKey] || 0) + 1;
      }
    });

    const rawCells = [];
    const today = new Date();
    let maxCount = 0;

    for (let i = 89; i >= 0; i--) {
      const d = new Date(today.getTime() - i * 86400000);
      const key = d.toISOString().slice(0, 10);
      const count = activityCounts[key] || 0;
      if (count > maxCount) {
        maxCount = count;
      }
      rawCells.push({ key, count });
    }

    const cells = rawCells.map(cell => {
      let colorClass = 'bg-surface-container-high';
      if (maxCount > 0 && cell.count > 0) {
        const ratio = cell.count / maxCount;
        if (ratio >= 0.75) colorClass = 'bg-primary';
        else if (ratio >= 0.4) colorClass = 'bg-primary-container';
        else colorClass = 'bg-secondary-container';
      }
      return { ...cell, colorClass };
    });

    // 90 cells in grid-rows-5 gives 18 columns (weeks)
    // For each column, check first cell's date to determine if it starts a new calendar month
    const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const labels = [];
    const numColumns = Math.ceil(cells.length / 5);

    let prevMonth = null;
    for (let col = 0; col < numColumns; col++) {
      const firstCell = cells[col * 5];
      if (firstCell) {
        const monthNum = parseInt(firstCell.key.split('-')[1], 10) - 1;
        const currentMonth = MONTHS[monthNum];
        if (currentMonth !== prevMonth) {
          labels.push({ col, label: currentMonth });
          prevMonth = currentMonth;
        } else {
          labels.push({ col, label: '' });
        }
      }
    }

    return { heatmapCells: cells, monthLabels: labels };
  }, [userProgressMap]);

  // Category coverage breakdown
  const categoryCoverage = useMemo(() => {
    const groups = [
      { id: 'tech', name: 'Tech', total: 313, barColor: 'bg-primary-container' },
      { id: 'money-career', name: 'Money & Career', total: 68, barColor: 'bg-tertiary-container' },
      { id: 'mind-growth', name: 'Mind & Growth', total: 176, barColor: 'bg-secondary-container' }
    ];

    return groups.map(g => {
      const groupTopics = topics.filter(t => {
        const group = (t.group_name || t.group || '').toLowerCase();
        return group === g.id || group === g.name.toLowerCase();
      });
      const total = groupTopics.length || g.total;
      const learned = groupTopics.filter(t => userProgressMap[t.id]?.times_seen > 0).length;
      const pct = Math.round((learned / total) * 100);
      return { ...g, total, learned, pct };
    });
  }, [topics, userProgressMap]);

  // Review Queue: topics with times_seen > 0 sorted by oldest last_seen
  const reviewQueue = useMemo(() => {
    return topics
      .filter(t => userProgressMap[t.id]?.times_seen > 0)
      .sort((a, b) => {
        const aTime = new Date(userProgressMap[a.id]?.last_seen || 0).getTime();
        const bTime = new Date(userProgressMap[b.id]?.last_seen || 0).getTime();
        return aTime - bTime;
      })
      .slice(0, 5);
  }, [topics, userProgressMap]);

  const handleReviewClick = (topic) => {
    setCurrentTopic(topic);
    if (onReviewTopic) onReviewTopic(topic);
  };

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto pb-8 space-y-6">
      
      {/* Overview Card */}
      <div className="flex flex-col space-y-2 pt-1">
        <span className="font-mono text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
          Overview Metrics
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-surface-container-low p-5 rounded-xl border border-outline-variant/20 shadow-sm">
          <div>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-4xl font-bold text-on-surface tracking-tight">{learnedCount}</span>
              <span className="text-lg text-on-surface-variant font-normal">/ {totalTopics}</span>
            </div>
            <p className="text-xs text-on-surface-variant mt-1">
              Topics completed ({percentageMastered}% mastered)
            </p>
          </div>
          <div className="sm:text-right border-t sm:border-t-0 sm:border-l border-outline-variant/20 pt-3 sm:pt-0 sm:pl-4">
            <span className="text-2xl sm:text-3xl font-bold text-tertiary">
              {currentStreak} {currentStreak === 1 ? 'day' : 'days'}
            </span>
            <p className="text-xs text-on-surface-variant mt-1">
              Current daily streak · Longest: {longestStreak}d
            </p>
          </div>
        </div>
      </div>

      {/* Activity Heatmap (90 Days) */}
      <div className="flex flex-col space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
            Activity (Last 90 Days)
          </span>
          <div className="flex items-center space-x-1.5 text-xs text-on-surface-variant font-mono">
            <span>Less</span>
            <div className="w-2.5 h-2.5 rounded bg-surface-container-high"></div>
            <div className="w-2.5 h-2.5 rounded bg-secondary-container"></div>
            <div className="w-2.5 h-2.5 rounded bg-primary-container"></div>
            <div className="w-2.5 h-2.5 rounded bg-primary"></div>
            <span>More</span>
          </div>
        </div>
        
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/20 overflow-x-auto shadow-sm">
          <div className="flex space-x-2 min-w-[320px]">
            <div className="flex flex-col">
              <div className="h-4 mb-1"></div>
              <div className="flex flex-col justify-between py-1 text-on-surface-variant font-mono text-[10px] h-20 pr-1 select-none">
                <span>Mon</span>
                <span>Wed</span>
                <span>Fri</span>
              </div>
            </div>
            <div className="flex flex-col flex-1">
              {/* Month labels along top of grid */}
              <div className="grid grid-flow-col gap-1.5 h-4 mb-1 select-none">
                {monthLabels.map(({ col, label }) => (
                  <div
                    key={col}
                    className="w-3 text-[10px] font-mono text-on-surface-variant overflow-visible whitespace-nowrap leading-none"
                  >
                    {label}
                  </div>
                ))}
              </div>

              {/* Heatmap cells */}
              <div className="grid grid-flow-col grid-rows-5 gap-1.5 flex-1">
                {heatmapCells.map((cell) => (
                  <div
                    key={cell.key}
                    title={`${cell.key}: ${cell.count} topics learned`}
                    className={`w-3 h-3 rounded-sm ${cell.colorClass} hover:ring-2 ring-primary transition-all cursor-pointer`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Coverage Breakdown */}
      <div className="flex flex-col space-y-3">
        <span className="font-mono text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
          Category Mastery Coverage
        </span>
        <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/20 space-y-3.5">
          {categoryCoverage.map((cat, index) => (
            <div key={cat.name} className="flex flex-col space-y-1">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-on-surface">{cat.name}</span>
                <span className="font-mono text-xs text-on-surface-variant">
                  {cat.learned} / {cat.total} ({cat.pct}%)
                </span>
              </div>
              <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                <motion.div
                  className={`${cat.barColor} h-full rounded-full`}
                  initial={{ width: 0 }}
                  animate={{ width: `${cat.pct}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut', delay: index * 0.05 }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Spaced Repetition / Up Next for Review */}
      <div className="flex flex-col space-y-3">
        <span className="font-mono text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
          Spaced Repetition Review Queue
        </span>
        <div className="flex flex-col space-y-2">
          {reviewQueue.length === 0 ? (
            <div className="p-6 rounded-xl bg-surface-container-low border border-outline-variant/15 text-center text-xs text-on-surface-variant flex flex-col items-center justify-center">
              <BookOpen size={42} className="text-outline/40 mb-2.5" strokeWidth={1.5} />
              <p className="max-w-md leading-relaxed">
                No learned topics yet. Spin the roulette and mark topics as learned to populate your spaced repetition review queue!
              </p>
            </div>
          ) : (
            reviewQueue.map(topic => {
              const prog = userProgressMap[topic.id];
              const daysAgo = prog?.last_seen 
                ? Math.max(0, Math.floor((Date.now() - new Date(prog.last_seen).getTime()) / 86400000))
                : 0;

              return (
                <div
                  key={topic.id}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/15 hover:bg-surface-container transition-colors"
                >
                  <div className="flex flex-col space-y-0.5 min-w-0 pr-3">
                    <span className="text-sm font-semibold text-on-surface truncate">{topic.title}</span>
                    <span className="text-xs text-on-surface-variant truncate">
                      {topic.group_name || topic.group} / {topic.category || topic.sub} · Learned {daysAgo === 0 ? 'today' : `${daysAgo}d ago`}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => handleReviewClick(topic)}
                    className="px-3 py-1.5 text-xs bg-surface-container-highest text-on-surface hover:bg-primary-container hover:text-white shrink-0"
                  >
                    Review
                  </Button>
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
};

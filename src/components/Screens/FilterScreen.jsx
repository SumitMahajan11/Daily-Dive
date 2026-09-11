import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '../../context/DataContext';
import { CATEGORY_TREE } from '../../lib/roulette';
import { RotateCcw, ChevronDown, RotateCw } from 'lucide-react';
import { Toggle } from '../UI/Toggle';
import { Button } from '../UI/Button';
import { Skeleton } from '../UI/Skeleton';

// Motion variants for staggered entrance
const listContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05
    }
  }
};

const listItemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.32, ease: 'easeOut' }
  }
};

export const FilterScreen = ({ onSpinActivePool }) => {
  const {
    topics,
    eligibleTopics,
    userSettings,
    updateSettings,
    loadingData
  } = useData();

  const enabled = userSettings?.enabled_categories || {};

  // Track expanded accordion groups (Tech open by default)
  const [expandedGroups, setExpandedGroups] = useState({
    tech: true,
    'money-career': false,
    'mind-growth': false
  });

  const toggleGroupAccordion = (group) => {
    setExpandedGroups(prev => ({
      ...prev,
      [group]: !prev[group]
    }));
  };

  // Returns true if enabled_categories has any explicit key set (user has customised at least once)
  const hasAnyExplicitSetting = Object.keys(enabled).length > 0;

  const handleGroupToggle = (group, isChecked) => {
    let patch = { ...enabled };

    // If this is the first explicit toggle, seed ALL groups as enabled so
    // the default-allow state is replaced with fully explicit state.
    if (!hasAnyExplicitSetting) {
      CATEGORY_TREE.forEach(g => {
        patch[g.group] = true;
        g.categories.forEach(cat => { patch[`${g.group}::${cat.name}`] = true; });
      });
    }

    patch[group] = isChecked;
    const groupDef = CATEGORY_TREE.find(g => g.group === group);
    if (groupDef) {
      groupDef.categories.forEach(cat => {
        patch[`${group}::${cat.name}`] = isChecked;
      });
    }
    updateSettings({ enabled_categories: patch });
  };

  const handleCategoryToggle = (group, categoryName, isChecked) => {
    let patch = { ...enabled };

    // Same seed logic — first explicit touch locks in all groups explicitly
    if (!hasAnyExplicitSetting) {
      CATEGORY_TREE.forEach(g => {
        patch[g.group] = true;
        g.categories.forEach(cat => { patch[`${g.group}::${cat.name}`] = true; });
      });
    }

    const key = `${group}::${categoryName}`;
    patch[key] = isChecked;
    // If all sub-categories of the group are now disabled, disable the group header too
    const groupDef = CATEGORY_TREE.find(g => g.group === group);
    if (groupDef) {
      const allOff = groupDef.categories.every(cat => patch[`${group}::${cat.name}`] === false);
      if (allOff) patch[group] = false;
      const anyOn = groupDef.categories.some(cat => patch[`${group}::${cat.name}`] !== false);
      if (anyOn) patch[group] = true;
    }
    updateSettings({ enabled_categories: patch });
  };

  const handleMasterToggle = (isChecked) => {
    const patch = {};
    CATEGORY_TREE.forEach(groupDef => {
      patch[groupDef.group] = isChecked;
      groupDef.categories.forEach(cat => {
        patch[`${groupDef.group}::${cat.name}`] = isChecked;
      });
    });
    updateSettings({ enabled_categories: patch });
  };

  const handleResetDefault = () => {
    updateSettings({ enabled_categories: {} });
  };

  const isMasterChecked = eligibleTopics.length > 0;

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto pb-8 space-y-4">
      
      {/* Pool Configuration Card */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span className="font-display text-xs text-on-surface-variant uppercase tracking-wider font-bold">
              Pool Configuration
            </span>
            <span className="font-mono text-[11px] text-outline hidden sm:inline">(auto-saved)</span>
          </div>
          <Button
            variant="ghost"
            onClick={handleResetDefault}
            className="font-mono text-xs hover:text-primary !p-0 !gap-1"
          >
            <RotateCcw size={14} />
            <span>Reset to default</span>
          </Button>
        </div>

        {/* Master Switch Row */}
        <motion.div
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.12 }}
          className="w-full bg-surface-container-low rounded-xl p-4 flex items-center justify-between border border-outline-variant/30"
        >
          <div className="flex flex-col">
            <span className="font-display font-semibold text-base sm:text-lg text-on-surface">Master Topic Switch</span>
            {loadingData ? (
              <Skeleton className="h-3.5 w-44 rounded mt-1" />
            ) : (
              <span className="font-mono text-xs text-on-surface-variant">
                {eligibleTopics.length} active topics across categories
              </span>
            )}
          </div>
          <Toggle
            checked={isMasterChecked}
            onChange={(e) => handleMasterToggle(e.target.checked)}
            size="lg"
            aria-label="Master Topic Switch"
          />
        </motion.div>
      </div>

      {/* Hierarchical Category Trees or Loading Skeletons */}
      {loadingData ? (
        <div className="flex flex-col space-y-3">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className="flex flex-col bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/20 p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-6 h-6 rounded" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-28 rounded" />
                    <Skeleton className="h-4 w-12 rounded-full" />
                  </div>
                </div>
                <Skeleton className="w-9 h-5 rounded-full" />
              </div>
              <div className="mt-3 pt-3 border-t border-outline-variant/10 space-y-2 pl-9 pr-2">
                <Skeleton className="h-3.5 w-3/4 rounded" />
                <Skeleton className="h-3.5 w-1/2 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <motion.div
          variants={listContainerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col space-y-3"
        >
          {CATEGORY_TREE.map(groupDef => {
          const groupName = groupDef.group;
          const isGroupExpanded = Boolean(expandedGroups[groupName]);
          const isGroupEnabled = enabled[groupName] !== false;

          return (
            <motion.div
              key={groupName}
              variants={listItemVariants}
              className="flex flex-col bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/20 shadow-sm"
            >
              {/* Group Header */}
              <motion.div
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.12 }}
                onClick={() => toggleGroupAccordion(groupName)}
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-surface-container-low transition-colors select-none"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    type="button"
                    aria-label={`${isGroupExpanded ? 'Collapse' : 'Expand'} ${groupDef.label || groupName} category group`}
                    aria-expanded={isGroupExpanded}
                    className={`w-6 h-6 flex items-center justify-center text-on-surface-variant transition-transform duration-200 ${
                      isGroupExpanded ? '' : '-rotate-90'
                    }`}
                  >
                    <ChevronDown size={20} />
                  </button>
                  <div className="flex flex-col truncate">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold text-base text-on-surface truncate">{groupDef.label || groupName}</span>
                      <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant text-[10px] font-mono">
                        {groupDef.badge}
                      </span>
                    </div>
                  </div>
                </div>

                <Toggle
                  checked={isGroupEnabled}
                  onChange={(e) => handleGroupToggle(groupName, e.target.checked)}
                  size="md"
                  className="ml-2"
                  onClick={(e) => e.stopPropagation()}
                  aria-label={`Toggle group ${groupDef.label || groupName}`}
                />
              </motion.div>

              {/* Group Categories Body */}
              <AnimatePresence initial={false}>
                {isGroupExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="flex flex-col px-4 pb-3 space-y-2">
                      {groupDef.categories.map(cat => {
                        const key = `${groupName}::${cat.name}`;
                        const isCatEnabled =
                          isGroupEnabled &&
                          enabled[key] !== false &&
                          enabled[cat.name] !== false;

                        return (
                          <motion.div
                            key={cat.name}
                            whileTap={{ scale: 0.98 }}
                            transition={{ duration: 0.12 }}
                            className="flex flex-col bg-surface-container-low/70 rounded-lg p-3 border border-outline-variant/15 select-none"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-on-surface">{cat.label}</span>
                                <span className="font-mono text-xs text-outline">{cat.topicsCount} topics</span>
                              </div>
                              <Toggle
                                checked={isCatEnabled}
                                onChange={(e) => handleCategoryToggle(groupName, cat.name, e.target.checked)}
                                size="sm"
                                aria-label={`Toggle category ${cat.label}`}
                              />
                            </div>

                            {/* Tags Preview */}
                            <div className="flex flex-wrap gap-1.5 mt-2 font-mono text-[11px] text-on-surface-variant">
                              {cat.tags.map(tag => (
                                <span key={tag} className="px-1.5 py-0.5 rounded bg-surface-container">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </motion.div>
      )}

      {/* Direct Spin Shortcut Button */}
      <div className="pt-2">
        <Button
          variant="primary"
          onClick={onSpinActivePool}
          className="w-full h-11 text-sm shadow-sm"
        >
          <RotateCw size={18} />
          <span>Spin Active Pool ({eligibleTopics.length} topics)</span>
        </Button>
      </div>

    </div>
  );
};

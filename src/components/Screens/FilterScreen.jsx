import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '../../context/DataContext';
import { CATEGORY_TREE, isTopicEligible, STARTER_ENABLED_CATEGORIES } from '../../lib/roulette';
import {
  RotateCcw,
  ChevronDown,
  RotateCw,
  Sliders,
  CheckCheck,
  Terminal,
  TrendingUp,
  Compass,
  Layers,
  Sparkles,
  Bot,
  Cloud,
  Binary,
  Cpu,
  Globe,
  Wallet,
  MessageSquare,
  Brain,
  Briefcase,
  Atom,
  Landmark,
  Trash2,
  Edit2,
  Check,
  X
} from 'lucide-react';
import { Toggle } from '../UI/Toggle';
import { Button } from '../UI/Button';
import { Skeleton } from '../UI/Skeleton';

const GROUP_ICONS = {
  'tech': Terminal,
  'money-career': TrendingUp,
  'mind-growth': Compass,
  'world-ideas': Globe,
  'custom': Sparkles
};

const CATEGORY_ICONS = {
  'ai-ml': Bot,
  'cloud-infra': Cloud,
  'data-structures-algorithms': Binary,
  'systems-distributed-computing': Cpu,
  'web-dev': Globe,
  'finance': Wallet,
  'career-strategy': Briefcase,
  'communication': MessageSquare,
  'philosophy-critical-thinking': Compass,
  'psychology': Brain,
  'science-nature': Atom,
  'history-innovation': Landmark,
  'custom-notes': Sparkles
};

export const FilterScreen = ({ onSpinActivePool }) => {
  const {
    topics,
    customTopics,
    eligibleTopics,
    userSettings,
    updateSettings,
    loadingData,
    showToast,
    deleteCustomTopic,
    updateCustomTopic,
    clearCustomTopics
  } = useData();

  const [editingTopicId, setEditingTopicId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');

  const handleStartEdit = (topic) => {
    setEditingTopicId(topic.id);
    setEditTitle(topic.title);
    setEditDesc(topic.description);
  };

  const handleSaveEdit = (topicId) => {
    if (!editTitle.trim()) {
      if (showToast) showToast('Title cannot be empty', 'warning');
      return;
    }
    updateCustomTopic(topicId, {
      title: editTitle.trim(),
      description: editDesc.trim()
    });
    setEditingTopicId(null);
  };

  const handleCancelEdit = () => {
    setEditingTopicId(null);
  };

  const enabled = userSettings?.enabled_categories || {};

  // Track expanded groups
  const [expandedGroups, setExpandedGroups] = useState({
    tech: true,
    'money-career': true,
    'mind-growth': true,
    'world-ideas': true,
    custom: true
  });

  const toggleGroupAccordion = (group) => {
    setExpandedGroups(prev => ({
      ...prev,
      [group]: !prev[group]
    }));
  };

  const hasAnyExplicitSetting = Object.keys(enabled).length > 0;

  const handleGroupToggle = (group, isChecked) => {
    let patch = { ...enabled };
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
    if (!hasAnyExplicitSetting) {
      CATEGORY_TREE.forEach(g => {
        patch[g.group] = true;
        g.categories.forEach(cat => { patch[`${g.group}::${cat.name}`] = true; });
      });
    }

    const key = `${group}::${categoryName}`;
    patch[key] = isChecked;

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
    patch['custom'] = isChecked;
    patch['custom::custom-notes'] = isChecked;
    updateSettings({ enabled_categories: patch });
  };

  // Preset Filters
  const applyPreset = (presetName) => {
    const patch = {};
    if (presetName === 'all') {
      CATEGORY_TREE.forEach(g => {
        patch[g.group] = true;
        g.categories.forEach(c => { patch[`${g.group}::${c.name}`] = true; });
      });
      patch['custom'] = true;
      patch['custom::custom-notes'] = true;
    } else if (presetName === 'tech') {
      CATEGORY_TREE.forEach(g => {
        const isTech = g.group === 'tech';
        patch[g.group] = isTech;
        g.categories.forEach(c => { patch[`${g.group}::${c.name}`] = isTech; });
      });
      patch['custom'] = true;
    } else if (presetName === 'mind-growth') {
      CATEGORY_TREE.forEach(g => {
        const isMindOrMoney = g.group === 'mind-growth' || g.group === 'money-career';
        patch[g.group] = isMindOrMoney;
        g.categories.forEach(c => { patch[`${g.group}::${c.name}`] = isMindOrMoney; });
      });
      patch['custom'] = true;
    } else if (presetName === 'world-ideas') {
      CATEGORY_TREE.forEach(g => {
        const isWorld = g.group === 'world-ideas';
        patch[g.group] = isWorld;
        g.categories.forEach(c => { patch[`${g.group}::${c.name}`] = isWorld; });
      });
      patch['custom'] = true;
    } else if (presetName === 'starter') {
      Object.assign(patch, STARTER_ENABLED_CATEGORIES);
    } else if (presetName === 'custom') {
      CATEGORY_TREE.forEach(g => {
        patch[g.group] = false;
        g.categories.forEach(c => { patch[`${g.group}::${c.name}`] = false; });
      });
      patch['custom'] = true;
      patch['custom::custom-notes'] = true;
      (customTopics || []).forEach(ct => {
        if (ct.category) {
          patch[`custom::${ct.category}`] = true;
          patch[ct.category] = true;
        }
      });
    }
    updateSettings({ enabled_categories: patch });
    if (showToast) showToast(`Preset applied: ${presetName}`, 'info');
  };

  const handleResetDefault = () => {
    updateSettings({ enabled_categories: STARTER_ENABLED_CATEGORIES });
    if (showToast) showToast('Reset filter pool to curated starter focus (~241 topics)', 'info');
  };

  const totalTopicsCount = topics.length || 1;
  const activeTopicsCount = eligibleTopics.length;
  const poolPercentage = Math.round((activeTopicsCount / totalTopicsCount) * 100);
  const isMasterChecked = activeTopicsCount > 0;

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto pb-8 space-y-5">
      
      {/* ── SETTINGS SURFACE INSTRUMENT CARD ── */}
      <div className="w-full journal-card rounded-2xl p-5 sm:p-6 space-y-4">
        
        {/* Top Header & Reset */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Sliders size={16} className="text-primary" />
            <h3 className="font-display font-bold text-base sm:text-lg text-on-surface">
              Curated Spin Pool
            </h3>
            <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-surface-container text-outline">
              Auto-saved locally
            </span>
          </div>

          <button
            type="button"
            onClick={handleResetDefault}
            className="flex items-center gap-1.5 font-mono text-xs text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
          >
            <RotateCcw size={13} />
            <span>Reset Defaults</span>
          </button>
        </div>

        {/* Active Pool Meter Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="text-on-surface-variant">Active Spin Pool:</span>
            {loadingData ? (
              <Skeleton className="h-4 w-16 rounded" />
            ) : (
              <span className="font-semibold text-primary">
                {activeTopicsCount} topics active ({poolPercentage}% of library)
              </span>
            )}
          </div>
          <div className="w-full h-2 rounded-full bg-surface-container-highest overflow-hidden">
            <motion.div
              className={`h-full rounded-full transition-all ${
                activeTopicsCount === 0 ? 'bg-error' : 'bg-gradient-to-r from-primary via-primary-container to-tertiary'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${poolPercentage}%` }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Master Topic Toggle Switch Row */}
        <div className="pt-2 border-t border-outline-variant/20 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-on-surface">Master Topic Switch</span>
            <span className="text-xs text-on-surface-variant font-mono mt-0.5">
              {isMasterChecked ? 'Roulette pool active' : 'All topics paused'}
            </span>
          </div>
          <Toggle
            checked={isMasterChecked}
            onChange={(e) => handleMasterToggle(e.target.checked)}
            size="lg"
            aria-label="Master Topic Switch"
          />
        </div>

        {/* Quick Presets Bar */}
        <div className="pt-3 border-t border-outline-variant/20">
          <div className="text-[11px] font-mono text-outline uppercase tracking-wider mb-2 font-semibold">
            Quick Filter Presets
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => applyPreset('starter')}
              className="px-3 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 border border-primary/30 text-xs font-medium text-primary transition-all cursor-pointer flex items-center gap-1"
            >
              <Sparkles size={11} />
              <span>Starter Focus</span>
            </button>
            <button
              type="button"
              onClick={() => applyPreset('all')}
              className="px-3 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-xs font-medium text-on-surface hover:text-primary transition-all cursor-pointer"
            >
              All Topics ({topics.length})
            </button>
            <button
              type="button"
              onClick={() => applyPreset('tech')}
              className="px-3 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-xs font-medium text-on-surface hover:text-primary transition-all cursor-pointer"
            >
              Tech ({topics.filter(t => (t.group_name || t.group) === 'tech').length})
            </button>
            <button
              type="button"
              onClick={() => applyPreset('mind-growth')}
              className="px-3 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-xs font-medium text-on-surface hover:text-primary transition-all cursor-pointer"
            >
              Mind &amp; Career ({topics.filter(t => ['mind-growth', 'money-career'].includes(t.group_name || t.group)).length})
            </button>
            <button
              type="button"
              onClick={() => applyPreset('world-ideas')}
              className="px-3 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-xs font-medium text-on-surface hover:text-primary transition-all cursor-pointer"
            >
              World &amp; Ideas ({topics.filter(t => (t.group_name || t.group) === 'world-ideas').length})
            </button>
            {customTopics && customTopics.length > 0 && (
              <button
                type="button"
                onClick={() => applyPreset('custom')}
                className="px-3 py-1 rounded-lg bg-primary/15 hover:bg-primary/25 border border-primary/40 text-xs font-medium text-primary transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles size={12} />
                <span>Custom Uploads ({customTopics.length})</span>
              </button>
            )}
          </div>
        </div>

      </div>

      {/* ── HIERARCHICAL CATEGORY GROUPS ── */}
      {loadingData ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="journal-card rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-36 rounded-lg" />
                <Skeleton className="h-5 w-10 rounded-full" />
              </div>
              <Skeleton className="h-4 w-3/4 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {CATEGORY_TREE.map(groupDef => {
            const groupName = groupDef.group;
            const isGroupExpanded = Boolean(expandedGroups[groupName]);
            const isGroupEnabled = enabled[groupName] !== false;
            const GroupIcon = GROUP_ICONS[groupName] || Layers;

            // Compute active subcategories count
            const activeInGroup = groupDef.categories.filter(cat => {
              const key = `${groupName}::${cat.name}`;
              return isGroupEnabled && enabled[key] !== false && enabled[cat.name] !== false;
            }).length;

            return (
              <div
                key={groupName}
                className="journal-card rounded-2xl overflow-hidden transition-all duration-200"
              >
                {/* Group Header Card */}
                <div
                  onClick={() => toggleGroupAccordion(groupName)}
                  className="flex items-center justify-between p-4 sm:p-5 cursor-pointer hover:bg-surface-container-high/40 transition-colors select-none"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      type="button"
                      aria-label={`${isGroupExpanded ? 'Collapse' : 'Expand'} ${groupDef.label} group`}
                      aria-expanded={isGroupExpanded}
                      className={`w-7 h-7 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant transition-transform duration-200 ${
                        isGroupExpanded ? '' : '-rotate-90'
                      }`}
                    >
                      <ChevronDown size={17} />
                    </button>

                    <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-primary/10 text-primary border border-primary/20 shrink-0">
                      <GroupIcon size={17} />
                    </div>

                    <div className="flex flex-col truncate">
                      <div className="flex items-center gap-2">
                        <span className="font-display font-bold text-base text-on-surface truncate">
                          {groupDef.label}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-[10px] font-mono font-medium">
                          {groupDef.badge}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-outline">
                        {activeInGroup} of {groupDef.categories.length} subcategories active
                      </span>
                    </div>
                  </div>

                  <Toggle
                    checked={isGroupEnabled}
                    onChange={(e) => handleGroupToggle(groupName, e.target.checked)}
                    size="md"
                    className="ml-3"
                    onClick={(e) => e.stopPropagation()}
                    aria-label={`Toggle group ${groupDef.label}`}
                  />
                </div>

                {/* Subcategories Accordion Content */}
                <AnimatePresence initial={false}>
                  {isGroupExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-1 space-y-2.5 border-t border-outline-variant/15">
                        {groupDef.categories.map(cat => {
                          const key = `${groupName}::${cat.name}`;
                          const isCatEnabled =
                            isGroupEnabled &&
                            enabled[key] !== false &&
                            enabled[cat.name] !== false;

                          const CatIcon = CATEGORY_ICONS[cat.name] || Terminal;

                          return (
                            <div
                              key={cat.name}
                              className={`flex flex-col p-3 sm:p-3.5 rounded-xl border transition-all duration-200 ${
                                isCatEnabled
                                  ? 'bg-surface-container/70 border-outline-variant/30 hover:border-outline-variant/60 shadow-sm'
                                  : 'bg-surface-container-lowest/40 border-outline-variant/10 opacity-60'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isCatEnabled ? 'bg-primary/10 text-primary' : 'bg-surface-container text-outline'}`}>
                                    <CatIcon size={15} />
                                  </div>
                                  <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs sm:text-sm font-semibold text-on-surface">
                                        {cat.label}
                                      </span>
                                      <span className="font-mono text-[10px] text-outline px-1.5 py-0.2 rounded bg-surface-container">
                                        {cat.topicsCount} topics
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <Toggle
                                  checked={isCatEnabled}
                                  onChange={(e) => handleCategoryToggle(groupName, cat.name, e.target.checked)}
                                  size="sm"
                                  aria-label={`Toggle category ${cat.label}`}
                                />
                              </div>

                              {/* Tags preview */}
                              {cat.tags && (
                                <div className="flex flex-wrap gap-1.5 mt-2.5 pl-9 font-mono text-[10px] text-on-surface-variant">
                                  {cat.tags.map(tag => (
                                    <span
                                      key={tag}
                                      className="px-1.5 py-0.5 rounded bg-surface-container border border-outline-variant/15"
                                    >
                                      #{tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            );
          })}

          {/* Custom Uploads Accordion Card if user has custom topics */}
          {customTopics && customTopics.length > 0 && (
            <div className="journal-card rounded-2xl overflow-hidden transition-all duration-200">
              <div
                onClick={() => toggleGroupAccordion('custom')}
                className="flex items-center justify-between p-4 sm:p-5 cursor-pointer hover:bg-surface-container-high/40 transition-colors select-none"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    type="button"
                    aria-label={`${expandedGroups['custom'] ? 'Collapse' : 'Expand'} Custom Uploads`}
                    aria-expanded={expandedGroups['custom']}
                    className={`w-7 h-7 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant transition-transform duration-200 ${
                      expandedGroups['custom'] ? '' : '-rotate-90'
                    }`}
                  >
                    <ChevronDown size={17} />
                  </button>

                  <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-primary/10 text-primary border border-primary/20 shrink-0">
                    <Sparkles size={17} />
                  </div>

                  <div className="flex flex-col truncate">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold text-base text-on-surface truncate">
                        Custom Uploads
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-[10px] font-mono font-medium">
                        {customTopics.length} topic{customTopics.length > 1 ? 's' : ''}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-outline">
                      {customTopics.filter(t => isTopicEligible(t, enabled)).length} active in pool
                    </span>
                  </div>
                </div>

                <Toggle
                  checked={enabled['custom'] !== false}
                  onChange={(e) => {
                    const isChecked = e.target.checked;
                    let patch = { ...enabled };
                    patch['custom'] = isChecked;
                    patch['custom::custom-notes'] = isChecked;
                    (customTopics || []).forEach(ct => {
                      if (ct.category) {
                        patch[`custom::${ct.category}`] = isChecked;
                      }
                    });
                    updateSettings({ enabled_categories: patch });
                  }}
                  size="md"
                  className="ml-3"
                  onClick={(e) => e.stopPropagation()}
                  aria-label="Toggle Custom Uploads group"
                />
              </div>

              {/* Subcategories / Topics preview */}
              <AnimatePresence initial={false}>
                {expandedGroups['custom'] && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.28, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-1 space-y-3 border-t border-outline-variant/15">
                      <div className="flex items-center justify-between text-xs text-on-surface-variant py-1 font-mono">
                        <span>Uploaded / Extracted Study Topics:</span>
                        <div className="flex items-center gap-3">
                          <span className="text-primary font-semibold">
                            {customTopics.filter(t => isTopicEligible(t, enabled)).length} of {customTopics.length} active
                          </span>
                          {customTopics.length > 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm('Are you sure you want to remove all uploaded custom topics?')) {
                                  clearCustomTopics();
                                }
                              }}
                              className="text-red-500 hover:text-red-600 hover:underline cursor-pointer"
                            >
                              Clear All
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="max-h-96 overflow-y-auto space-y-2 pr-1">
                        {customTopics.map(ct => {
                          const isEligible = isTopicEligible(ct, enabled);
                          const isEditing = editingTopicId === ct.id;

                          if (isEditing) {
                            return (
                              <div
                                key={ct.id}
                                className="p-3.5 rounded-xl bg-surface border border-primary/40 space-y-2.5 shadow-sm"
                              >
                                <div className="space-y-1">
                                  <label className="text-[10px] font-mono text-outline uppercase tracking-wider">
                                    Topic Title
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="Topic Title"
                                    aria-label="Edit Topic Title"
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    className="w-full px-2.5 py-1.5 rounded-lg bg-surface-container border border-outline-variant/30 text-xs text-on-surface font-semibold focus:outline-none focus:border-primary"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-mono text-outline uppercase tracking-wider">
                                    Description (1-2 sentences)
                                  </label>
                                  <textarea
                                    rows={2}
                                    value={editDesc}
                                    onChange={(e) => setEditDesc(e.target.value)}
                                    className="w-full px-2.5 py-1.5 rounded-lg bg-surface-container border border-outline-variant/30 text-xs text-on-surface leading-relaxed focus:outline-none focus:border-primary resize-none"
                                  />
                                </div>
                                <div className="flex items-center justify-end gap-2 pt-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={handleCancelEdit}
                                    className="h-7 px-2.5 text-xs flex items-center gap-1"
                                  >
                                    <X size={12} />
                                    <span>Cancel</span>
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="primary"
                                    onClick={() => handleSaveEdit(ct.id)}
                                    className="h-7 px-2.5 text-xs flex items-center gap-1"
                                  >
                                    <Check size={12} />
                                    <span>Save</span>
                                  </Button>
                                </div>
                              </div>
                            );
                          }

                          return (
                            <div
                              key={ct.id}
                              className={`p-3 rounded-xl border transition-all ${
                                isEligible
                                  ? 'bg-surface-container/60 border-outline-variant/20 hover:border-outline-variant/40'
                                  : 'bg-surface-container-lowest/30 border-outline-variant/10 opacity-50'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap mb-1">
                                    <h4 className="font-semibold text-xs text-on-surface">
                                      {ct.title}
                                    </h4>
                                    <span className="px-1.5 py-0.2 rounded bg-primary/10 text-primary font-mono text-[9px]">
                                      {ct.category || 'custom'}
                                    </span>
                                    {isEligible ? (
                                      <span className="text-[9px] font-mono text-emerald-500">Active</span>
                                    ) : (
                                      <span className="text-[9px] font-mono text-outline">Paused</span>
                                    )}
                                  </div>
                                  <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
                                    {ct.description}
                                  </p>
                                  <div className="text-[10px] font-mono text-outline mt-1.5">
                                    Source: {ct.source || 'Upload'}
                                  </div>
                                </div>

                                <div className="flex items-center gap-1 shrink-0 pt-0.5">
                                  <button
                                    type="button"
                                    onClick={() => handleStartEdit(ct)}
                                    className="p-1 rounded text-outline hover:text-primary transition-colors cursor-pointer"
                                    title="Edit topic"
                                    aria-label={`Edit ${ct.title}`}
                                  >
                                    <Edit2 size={13} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => deleteCustomTopic(ct.id)}
                                    className="p-1 rounded text-outline hover:text-red-500 transition-colors cursor-pointer"
                                    title="Delete topic"
                                    aria-label={`Delete ${ct.title}`}
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      )}

      {/* ── FAST ACTION TO SPIN ACTIVE POOL ── */}
      <div className="pt-2">
        <Button
          variant="primary"
          onClick={onSpinActivePool}
          className="w-full h-12 text-sm font-semibold shadow-lg shadow-primary/20"
        >
          <RotateCw size={17} />
          <span>Spin Active Pool ({eligibleTopics.length} Topics Ready)</span>
        </Button>
      </div>

    </div>
  );
};

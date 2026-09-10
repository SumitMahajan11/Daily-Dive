import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { CATEGORY_TREE } from '../../lib/roulette';
import { RotateCcw, ChevronDown, RotateCw } from 'lucide-react';

export const FilterScreen = ({ onSpinActivePool }) => {
  const {
    topics,
    eligibleTopics,
    userSettings,
    updateSettings
  } = useData();

  const enabled = userSettings?.enabled_categories || {};

  // Track expanded accordion groups (Tech open by default)
  const [expandedGroups, setExpandedGroups] = useState({
    Tech: true,
    'Money & Career': false,
    'Mind & Growth': false,
    'World & Ideas': false
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
            <span className="font-mono text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
              Pool Configuration
            </span>
            <span className="font-mono text-[11px] text-outline hidden sm:inline">(auto-saved)</span>
          </div>
          <button
            type="button"
            onClick={handleResetDefault}
            className="font-mono text-xs text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw size={14} />
            <span>Reset to default</span>
          </button>
        </div>

        {/* Master Switch Row */}
        <div className="w-full bg-surface-container-low rounded-xl p-4 flex items-center justify-between border border-outline-variant/30">
          <div className="flex flex-col">
            <span className="font-medium text-sm sm:text-base text-on-surface">Master Topic Switch</span>
            <span className="font-mono text-xs text-on-surface-variant">
              {eligibleTopics.length} active topics across categories
            </span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isMasterChecked}
              onChange={(e) => handleMasterToggle(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container"></div>
          </label>
        </div>
      </div>

      {/* Hierarchical Category Trees */}
      <div className="flex flex-col space-y-3">
        {CATEGORY_TREE.map(groupDef => {
          const groupName = groupDef.group;
          const isGroupExpanded = Boolean(expandedGroups[groupName]);
          const isGroupEnabled = enabled[groupName] !== false;

          return (
            <div
              key={groupName}
              className="flex flex-col bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/20"
            >
              {/* Group Header */}
              <div
                onClick={() => toggleGroupAccordion(groupName)}
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-surface-container-low transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    type="button"
                    className={`w-6 h-6 flex items-center justify-center text-on-surface-variant transition-transform duration-200 ${
                      isGroupExpanded ? '' : '-rotate-90'
                    }`}
                  >
                    <ChevronDown size={20} />
                  </button>
                  <div className="flex flex-col truncate">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-base text-on-surface truncate">{groupName}</span>
                      <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant text-[10px] font-mono">
                        {groupDef.badge}
                      </span>
                    </div>
                  </div>
                </div>

                <label
                  className="relative inline-flex items-center cursor-pointer ml-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    checked={isGroupEnabled}
                    onChange={(e) => handleGroupToggle(groupName, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-surface-container-highest rounded-full peer peer-checked:after:translate-x-4 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-container"></div>
                </label>
              </div>

              {/* Group Categories Body */}
              {isGroupExpanded && (
                <div className="flex flex-col px-4 pb-3 space-y-2">
                  {groupDef.categories.map(cat => {
                    const key = `${groupName}::${cat.name}`;
                    const isCatEnabled =
                      isGroupEnabled &&
                      enabled[key] !== false &&
                      enabled[cat.name] !== false;

                    return (
                      <div
                        key={cat.name}
                        className="flex flex-col bg-surface-container-low/70 rounded-lg p-3 border border-outline-variant/15"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-on-surface">{cat.label}</span>
                            <span className="font-mono text-xs text-outline">{cat.topicsCount} topics</span>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isCatEnabled}
                              onChange={(e) => handleCategoryToggle(groupName, cat.name, e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-8 h-4 bg-surface-container-highest rounded-full peer peer-checked:after:translate-x-3.5 after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-primary-container"></div>
                          </label>
                        </div>

                        {/* Tags Preview */}
                        <div className="flex flex-wrap gap-1.5 mt-2 font-mono text-[11px] text-on-surface-variant">
                          {cat.tags.map(tag => (
                            <span key={tag} className="px-1.5 py-0.5 rounded bg-surface-container">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Direct Spin Shortcut Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onSpinActivePool}
          className="w-full h-11 bg-primary-container hover:bg-primary-container/90 active:scale-[0.98] text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
        >
          <RotateCw size={18} />
          <span>Spin Active Pool ({eligibleTopics.length} topics)</span>
        </button>
      </div>

    </div>
  );
};

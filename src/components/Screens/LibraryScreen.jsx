import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '../../context/DataContext';
import { CATEGORY_TREE, isTopicEligible, STARTER_ENABLED_CATEGORIES } from '../../lib/roulette';
import { extractTopicsLocally, extractTopicsWithGemini, scoreCandidateTitle, CONFIDENCE_THRESHOLD } from '../../lib/topicExtractor';
import {
  Terminal,
  TrendingUp,
  Compass,
  Globe,
  Sparkles,
  Bot,
  Cloud,
  Binary,
  Cpu,
  Wallet,
  Briefcase,
  MessageSquare,
  Brain,
  Atom,
  Landmark,
  ChevronDown,
  ChevronUp,
  FileText,
  UploadCloud,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Clock,
  Pin,
  AlertTriangle,
  CheckCircle2,
  Key,
  ShieldCheck,
  RotateCw,
  Layers,
  FileUp
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

const DOMAIN_OPTIONS = [
  { value: 'general', label: 'General / Miscellaneous' },
  { value: 'AI & Machine Learning', label: 'AI & Machine Learning' },
  { value: 'Cloud & Infrastructure', label: 'Cloud & Infrastructure' },
  { value: 'Systems & Computing', label: 'Systems & Computing' },
  { value: 'Web Architecture', label: 'Web Architecture & Performance' },
  { value: 'Data Structures & Algorithms', label: 'Data Structures & Algorithms' },
  { value: 'Finance & Wealth Strategy', label: 'Finance & Wealth Strategy' },
  { value: 'Career Strategy & Leadership', label: 'Career Strategy & Leadership' },
  { value: 'Communication & Rhetoric', label: 'Communication & Rhetoric' },
  { value: 'Philosophy & Critical Thinking', label: 'Philosophy & Critical Thinking' },
  { value: 'Psychology & Decisions', label: 'Psychology & Decision Making' },
  { value: 'Science & Natural World', label: 'Science & Natural World' },
  { value: 'History of Innovation', label: 'History of Innovation' }
];

export const LibraryScreen = ({ onSpinActivePool }) => {
  const {
    topics,
    customTopics,
    eligibleTopics,
    userSettings,
    updateSettings,
    addCustomTopics,
    loadingData,
    showToast,
    deleteCustomTopic,
    updateCustomTopic,
    clearCustomTopics,
    convertTopicLifecycle
  } = useData();

  // ── SECTION 1: INTERESTS STATE ──
  const enabled = userSettings?.enabled_categories || {};
  const hasAnyExplicitSetting = Object.keys(enabled).length > 0;

  const [expandedGroups, setExpandedGroups] = useState(() => {
    const defaultState = {
      tech: false,
      'money-career': false,
      'mind-growth': false,
      'world-ideas': false,
      custom: false
    };
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('daily_dive_expanded_groups');
        if (saved) return { ...defaultState, ...JSON.parse(saved) };
      } catch (e) {}
    }
    return defaultState;
  });

  const toggleGroupAccordion = (group) => {
    setExpandedGroups(prev => {
      const next = { ...prev, [group]: !prev[group] };
      try {
        localStorage.setItem('daily_dive_expanded_groups', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  const handleGroupToggle = (group, isChecked) => {
    const checkedVal = typeof isChecked === 'boolean' ? isChecked : Boolean(isChecked?.target?.checked);
    let patch = { ...STARTER_ENABLED_CATEGORIES, ...enabled };

    patch[group] = checkedVal;
    if (group === 'custom') {
      patch['custom'] = checkedVal;
      patch['custom::custom-notes'] = checkedVal;
      (customTopics || []).forEach(ct => {
        if (ct.category) {
          patch[`custom::${ct.category}`] = checkedVal;
          patch[ct.category] = checkedVal;
        }
      });
    } else {
      const groupDef = CATEGORY_TREE.find(g => g.group === group);
      if (groupDef) {
        groupDef.categories.forEach(cat => {
          patch[`${group}::${cat.name}`] = checkedVal;
          patch[cat.name] = checkedVal;
        });
      }
    }
    updateSettings({ enabled_categories: patch });
  };

  const handleCategoryToggle = (group, categoryName, isChecked) => {
    const checkedVal = typeof isChecked === 'boolean' ? isChecked : Boolean(isChecked?.target?.checked);
    let patch = { ...STARTER_ENABLED_CATEGORIES, ...enabled };

    const key = `${group}::${categoryName}`;
    patch[key] = checkedVal;
    patch[categoryName] = checkedVal;

    const groupDef = CATEGORY_TREE.find(g => g.group === group);
    if (groupDef) {
      const allOff = groupDef.categories.every(cat => patch[`${group}::${cat.name}`] === false);
      if (allOff) patch[group] = false;
      const anyOn = groupDef.categories.some(cat => patch[`${group}::${cat.name}`] !== false);
      if (anyOn) patch[group] = true;
    }
    updateSettings({ enabled_categories: patch });
  };

  const handleSelectAll = () => {
    let patch = { ...STARTER_ENABLED_CATEGORIES, ...enabled };
    CATEGORY_TREE.forEach(groupDef => {
      patch[groupDef.group] = true;
      groupDef.categories.forEach(cat => {
        patch[`${groupDef.group}::${cat.name}`] = true;
        patch[cat.name] = true;
      });
    });
    patch['custom'] = true;
    patch['custom::custom-notes'] = true;
    (customTopics || []).forEach(ct => {
      if (ct.category) {
        patch[`custom::${ct.category}`] = true;
        patch[ct.category] = true;
      }
    });
    updateSettings({ enabled_categories: patch });
    if (showToast) showToast('Enabled all topic categories', 'info');
  };

  const handleResetDefaults = () => {
    updateSettings({ enabled_categories: STARTER_ENABLED_CATEGORIES });
    if (showToast) showToast('Reset categories to default', 'info');
  };

  // ── SECTION 2: YOUR NOTES (CUSTOM TOPICS) STATE ──
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

  const permanentTopics = (customTopics || []).filter(t => t.lifecycle === 'permanent');
  const temporaryTopics = (customTopics || []).filter(t => t.lifecycle !== 'permanent');

  const getExpiryLabel = (expiresAt) => {
    if (!expiresAt) return '14 days';
    const diffMs = new Date(expiresAt).getTime() - Date.now();
    if (diffMs <= 0) return 'Expired today';
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 24) return `${Math.max(1, diffHours)}h left`;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return `${diffDays}d left`;
  };

  // ── SECTION 3: ADD NOTES & EXTRACTION STATE ──
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [processingState, setProcessingState] = useState('idle'); // 'idle' | 'extracting' | 'review' | 'error'
  const [progress, setProgress] = useState({ stage: '', percent: 0, detail: '' });
  const [errorMessage, setErrorMessage] = useState('');
  const [candidateTopics, setCandidateTopics] = useState([]);
  const [selectedTopicIds, setSelectedTopicIds] = useState(new Set());
  const [addedNotice, setAddedNotice] = useState(null);

  // BYOK State
  const [geminiApiKey, setGeminiApiKey] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('daily_dive_gemini_key') || '';
    }
    return '';
  });
  const [useByok, setUseByok] = useState(() => Boolean(geminiApiKey));

  const handleSaveKey = (e) => {
    e?.preventDefault();
    try {
      localStorage.setItem('daily_dive_gemini_key', geminiApiKey.trim());
      if (geminiApiKey.trim()) setUseByok(true);
      if (showToast) showToast('Gemini API key saved locally', 'success');
    } catch (e) {}
  };

  const handleClearKey = () => {
    setGeminiApiKey('');
    setUseByok(false);
    try {
      localStorage.removeItem('daily_dive_gemini_key');
      if (showToast) showToast('Gemini key removed', 'info');
    } catch (e) {}
  };

  // Lifecycle for batch review
  const [reviewBatchLifecycle, setReviewBatchLifecycle] = useState('temporary');

  // Manual Add Form State
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualTitle, setManualTitle] = useState('');
  const [manualLifecycle, setManualLifecycle] = useState('temporary');
  const [manualDomain, setManualDomain] = useState('general');
  const [manualDescription, setManualDescription] = useState('');
  const [manualTags, setManualTags] = useState('');

  // Drag & drop fine pointer detection
  const [isFinePointer, setIsFinePointer] = useState(true);
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      setIsFinePointer(window.matchMedia('(pointer: fine)').matches);
    }
  }, []);

  const handleCreateManualTopic = (e) => {
    e?.preventDefault();
    if (!manualTitle.trim()) {
      if (showToast) showToast('Please enter a topic title', 'warning');
      return;
    }
    if (!manualDescription.trim()) {
      if (showToast) showToast('Please enter a brief topic description', 'warning');
      return;
    }

    const tagsList = manualTags.trim() 
      ? manualTags.split(',').map(t => t.trim()).filter(Boolean) 
      : [];

    if (manualDomain && manualDomain !== 'general' && !tagsList.includes(manualDomain)) {
      tagsList.unshift(manualDomain);
    }
    if (tagsList.length === 0) {
      tagsList.push('Custom');
    }

    const isPermanent = manualLifecycle === 'permanent';
    const now = Date.now();
    const createdAt = new Date().toISOString();
    const expiresAt = isPermanent ? null : new Date(now + 14 * 86400000).toISOString();

    const newTopic = {
      id: `manual_${now}_${Math.random().toString(36).substr(2, 6)}`,
      title: manualTitle.trim(),
      category: 'custom-notes',
      group_name: 'custom',
      description: manualDescription.trim(),
      source: 'Manual Entry',
      tags: tagsList,
      difficulty: 'intermediate',
      read_time_minutes: 3,
      is_custom: true,
      lifecycle: isPermanent ? 'permanent' : 'temporary',
      created_at: createdAt,
      expires_at: expiresAt,
      expiry_rule: isPermanent ? null : '14_days'
    };

    if (processingState === 'review') {
      setCandidateTopics(prev => [newTopic, ...prev]);
      setSelectedTopicIds(prev => new Set([newTopic.id, ...prev]));
      if (showToast) showToast(`Added "${newTopic.title}" to review candidates`, 'success');
    } else {
      addCustomTopics([newTopic]);
      if (showToast) {
        showToast(
          isPermanent
            ? `Added "${newTopic.title}" to permanent collection!`
            : `Added "${newTopic.title}" (expires in 14 days)`,
          'success'
        );
      }
    }

    setManualTitle('');
    setManualDescription('');
    setManualTags('');
    setShowManualForm(false);
  };

  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (file) processUploadedFile(file);
  };

  const processUploadedFile = async (file) => {
    setSelectedFile(file);
    setProcessingState('extracting');
    setErrorMessage('');
    setProgress({ stage: 'Reading document', percent: 15, detail: file.name });

    try {
      let rawText = '';
      const ext = file.name.split('.').pop().toLowerCase();

      if (ext === 'pdf') {
        const { extractFromPdf } = await import('../../lib/extractors/pdfExtractor');
        rawText = await extractFromPdf(file, (p) => setProgress(p));
      } else if (ext === 'pptx') {
        const { extractFromPptx } = await import('../../lib/extractors/pptxExtractor');
        rawText = await extractFromPptx(file, (p) => setProgress(p));
      } else if (['png', 'jpg', 'jpeg', 'webp'].includes(ext)) {
        const { extractFromImage } = await import('../../lib/extractors/imageExtractor');
        rawText = await extractFromImage(file, (p) => setProgress(p));
      } else if (['mp4', 'webm', 'mov'].includes(ext)) {
        const { extractFromVideo } = await import('../../lib/extractors/videoExtractor');
        rawText = await extractFromVideo(file, (p) => setProgress(p));
      } else if (['txt', 'md'].includes(ext)) {
        rawText = await file.text();
      } else {
        throw new Error(`Unsupported file format .${ext}. Please upload a PDF, PPTX, image, or markdown note.`);
      }

      if (!rawText || rawText.trim().length < 20) {
        throw new Error('No legible text could be found in the document.');
      }

      setProgress({ stage: 'Generating micro-topics', percent: 75, detail: 'Synthesizing bite-sized concepts...' });

      let candidates = [];
      if (useByok && geminiApiKey.trim()) {
        try {
          candidates = await extractTopicsWithGemini(rawText, geminiApiKey.trim(), file.name);
        } catch (geminiErr) {
          console.warn('Gemini extraction failed, falling back to local extractor:', geminiErr);
          const msg = geminiErr.message || 'Gemini extraction unavailable.';
          if (typeof showToast === 'function') {
            showToast(`${msg} Falling back to local offline extraction.`, 'info');
          }
          candidates = await extractTopicsLocally(rawText, [], file.name);
        }
      } else {
        candidates = await extractTopicsLocally(rawText, [], file.name);
      }

      if (!candidates || candidates.length === 0) {
        throw new Error('Could not identify clear concepts in this document.');
      }

      const scored = candidates.map(t => {
        return {
          ...t,
          id: t.id || `ext_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          confidence: typeof t.confidence === 'number' ? t.confidence : 75,
          needs_review: Boolean(t.needs_review),
          review_reasons: t.review_reasons || [],
          lifecycle: 'temporary'
        };
      });

      const autoAcceptedIds = new Set(scored.filter(t => !t.needs_review).map(t => t.id));
      if (autoAcceptedIds.size === 0 && scored.length > 0) {
        autoAcceptedIds.add(scored[0].id);
      }

      setCandidateTopics(scored);
      setSelectedTopicIds(autoAcceptedIds);
      setProcessingState('review');
    } catch (err) {
      setProcessingState('error');
      setErrorMessage(err.message || 'An error occurred during extraction.');
    }
  };

  const handleSaveReviewedCandidates = () => {
    const selected = candidateTopics.filter(t => selectedTopicIds.has(t.id));
    if (selected.length === 0) {
      if (showToast) showToast('Please select at least one topic to import', 'warning');
      return;
    }

    const isPermanent = reviewBatchLifecycle === 'permanent';
    const now = Date.now();
    const finalized = selected.map(t => ({
      ...t,
      lifecycle: isPermanent ? 'permanent' : 'temporary',
      expires_at: isPermanent ? null : new Date(now + 14 * 86400000).toISOString(),
      expiry_rule: isPermanent ? null : '14_days'
    }));

    addCustomTopics(finalized);
    setAddedNotice({
      count: finalized.length,
      lifecycle: isPermanent ? 'permanent' : 'temporary'
    });
    setProcessingState('idle');
    setCandidateTopics([]);
    setSelectedTopicIds(new Set());
    setSelectedFile(null);
  };

  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto pb-8 space-y-8">
      
      {/* ── HEADER & POOL STATUS LINE ── */}
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
          Library
        </h1>
        {loadingData ? (
          <Skeleton className="h-4 w-44 rounded" />
        ) : eligibleTopics.length === 0 ? (
          <p className="text-xs font-semibold text-error">
            0 topics in your pool — enable at least one category or add notes to spin.
          </p>
        ) : (
          <p className="text-xs font-mono text-on-surface-variant">
            {eligibleTopics.length} topics in your pool
          </p>
        )}
      </div>

      {/* ── SECTION 1: YOUR INTERESTS ── */}
      <section className="journal-card rounded-2xl p-5 sm:p-6 border border-outline-variant/30 space-y-4">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h2 className="font-display text-base sm:text-lg font-bold text-on-surface">
            Your interests
          </h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSelectAll}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors cursor-pointer border border-outline-variant/30"
            >
              All
            </button>
            <button
              type="button"
              onClick={handleResetDefaults}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer border border-outline-variant/30"
            >
              Reset
            </button>
          </div>
        </div>

        {/* 4 Group Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {CATEGORY_TREE.map(groupDef => {
            const GroupIcon = GROUP_ICONS[groupDef.group] || Sparkles;
            const isGroupOn = enabled[groupDef.group] !== false;
            const isExpanded = expandedGroups[groupDef.group];
            const totalGroupTopics = groupDef.categories.reduce((sum, c) => sum + (c.topicsCount || 0), 0);
            const activeCatsCount = groupDef.categories.filter(c => enabled[`${groupDef.group}::${c.name}`] !== false && enabled[c.name] !== false).length;

            return (
              <div
                key={groupDef.group}
                className="rounded-xl border border-outline-variant/30 bg-surface-container-low overflow-hidden"
              >
                {/* Group Card Header */}
                <div className="p-3.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-surface-container text-primary shrink-0">
                      <GroupIcon size={16} />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="font-semibold text-sm text-on-surface leading-tight break-words">
                        {groupDef.label}
                      </span>
                      <span className="text-[11px] text-on-surface-variant font-mono mt-0.5 leading-tight">
                        {totalGroupTopics} topics · {activeCatsCount} of {groupDef.categories.length} on
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Toggle
                      checked={isGroupOn}
                      onChange={(chk) => handleGroupToggle(groupDef.group, chk)}
                      ariaLabel={`Toggle ${groupDef.label}`}
                    />
                    <button
                      type="button"
                      onClick={() => toggleGroupAccordion(groupDef.group)}
                      aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${groupDef.label}`}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
                    >
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>

                {/* Subcategories (Accordion Dropdown) */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-outline-variant/20 bg-surface-container-lowest/50 divide-y divide-outline-variant/15"
                    >
                      {groupDef.categories.map(cat => {
                        const CatIcon = CATEGORY_ICONS[cat.name] || Bot;
                        const isCatOn = enabled[`${groupDef.group}::${cat.name}`] !== false && enabled[cat.name] !== false;

                        return (
                          <div
                            key={cat.name}
                            className="px-4 py-2.5 flex items-center justify-between gap-2 hover:bg-surface-container/40 transition-colors"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <CatIcon size={14} className="text-on-surface-variant shrink-0" />
                              <span className="text-xs font-medium text-on-surface truncate">
                                {cat.label}
                              </span>
                            </div>
                            <Toggle
                              checked={isCatOn}
                              onChange={(chk) => handleCategoryToggle(groupDef.group, cat.name, chk)}
                              ariaLabel={`Toggle ${cat.label}`}
                            />
                          </div>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── SECTION 2: YOUR NOTES ── */}
      <section className="journal-card rounded-2xl p-5 sm:p-6 border border-outline-variant/30 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-display text-base sm:text-lg font-bold text-on-surface">
              Your notes
            </h2>
            {customTopics?.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-mono font-semibold">
                {customTopics.length}
              </span>
            )}
          </div>

          {customTopics?.length > 0 && (
            <button
              type="button"
              onClick={clearCustomTopics}
              className="text-xs text-on-surface-variant hover:text-error transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Trash2 size={13} />
              <span>Clear all</span>
            </button>
          )}
        </div>

        {customTopics?.length === 0 ? (
          <p className="text-xs text-on-surface-variant">
            No custom notes added yet. Add notes or upload slides below.
          </p>
        ) : (
          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {customTopics.map(topic => {
              const isPermanent = topic.lifecycle === 'permanent';
              const isEditing = editingTopicId === topic.id;

              return (
                <div
                  key={topic.id}
                  className="p-3.5 rounded-xl border border-outline-variant/30 bg-surface-container-low flex flex-col gap-2"
                >
                  {isEditing ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-surface border border-outline-variant/40 text-sm font-semibold text-on-surface"
                      />
                      <textarea
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        rows={2}
                        className="w-full px-3 py-1.5 rounded-lg bg-surface border border-outline-variant/40 text-xs text-on-surface resize-none"
                      />
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(topic.id)}
                          className="px-3 py-1 rounded-md bg-primary text-white text-xs font-semibold cursor-pointer"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="px-3 py-1 rounded-md bg-surface-container text-on-surface text-xs cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                            isPermanent
                              ? 'bg-amber-500/15 text-amber-500 border border-amber-500/30'
                              : 'bg-primary/10 text-primary border border-primary/20'
                          }`}>
                            {isPermanent ? 'Permanent' : 'Temporary'}
                          </span>
                          {!isPermanent && (
                            <span className="text-[11px] font-mono text-on-surface-variant">
                              {getExpiryLabel(topic.expires_at)}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => convertTopicLifecycle(topic.id, isPermanent ? 'temporary' : 'permanent')}
                            className="p-1 text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                            title={isPermanent ? 'Make temporary' : 'Make permanent'}
                          >
                            <Pin size={14} className={isPermanent ? 'text-amber-500 fill-amber-500' : ''} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStartEdit(topic)}
                            className="p-1 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                            title="Edit topic"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteCustomTopic(topic.id)}
                            className="p-1 text-on-surface-variant hover:text-error transition-colors cursor-pointer"
                            title="Delete topic"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      <h3 className="font-semibold text-sm text-on-surface leading-snug">
                        {topic.title}
                      </h3>
                      <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
                        {topic.description}
                      </p>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── SECTION 3: ADD NOTES ── */}
      <section className="journal-card rounded-2xl p-5 sm:p-6 border border-outline-variant/30 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="font-display text-base sm:text-lg font-bold text-on-surface">
              Add your own notes
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowManualForm(!showManualForm)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-outline-variant/30 bg-surface-container text-xs font-semibold text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer whitespace-nowrap"
            >
              <Plus size={14} className="shrink-0" />
              <span>Add Manually</span>
            </button>
          </div>
        </div>

        {/* Post-Add Confirmation Notice */}
        {addedNotice && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <CheckCircle2 size={16} className="shrink-0" />
              <span>
                Added {addedNotice.count} topic{addedNotice.count > 1 ? 's' : ''} to your spin pool (Blended Mode active).
              </span>
            </div>
            {onSpinActivePool && (
              <button
                type="button"
                onClick={onSpinActivePool}
                className="px-2.5 py-1 rounded-md bg-primary text-white text-xs font-semibold shrink-0 cursor-pointer"
              >
                Spin now
              </button>
            )}
          </div>
        )}

        {/* Manual Add Form */}
        <AnimatePresence>
          {showManualForm && (
            <motion.form
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              onSubmit={handleCreateManualTopic}
              className="p-4 rounded-xl border border-primary/30 bg-surface-container-lowest/60 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-primary">New Note Entry</span>
                <button
                  type="button"
                  onClick={() => setShowManualForm(false)}
                  className="text-on-surface-variant hover:text-on-surface p-1"
                >
                  <X size={14} />
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-on-surface mb-1">Topic Title</label>
                <input
                  type="text"
                  placeholder="e.g. Distributed Consensus with Raft"
                  value={manualTitle}
                  onChange={(e) => setManualTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-outline-variant/40 text-sm text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-on-surface mb-1">Concept Summary</label>
                <textarea
                  rows={2}
                  placeholder="Summarize the core insight..."
                  value={manualDescription}
                  onChange={(e) => setManualDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-outline-variant/40 text-xs text-on-surface resize-none focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-on-surface mb-1">Domain</label>
                  <select
                    value={manualDomain}
                    onChange={(e) => setManualDomain(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-surface border border-outline-variant/40 text-xs text-on-surface"
                  >
                    {DOMAIN_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-on-surface mb-1">Retention</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setManualLifecycle('temporary')}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border ${
                        manualLifecycle === 'temporary'
                          ? 'bg-primary-container/20 border-primary text-primary'
                          : 'bg-surface border-outline-variant/30 text-on-surface-variant'
                      }`}
                    >
                      14 days
                    </button>
                    <button
                      type="button"
                      onClick={() => setManualLifecycle('permanent')}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border ${
                        manualLifecycle === 'permanent'
                          ? 'bg-amber-500/15 border-amber-500 text-amber-500'
                          : 'bg-surface border-outline-variant/30 text-on-surface-variant'
                      }`}
                    >
                      Permanent
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button variant="primary" type="submit" className="h-9 px-4 text-xs font-semibold">
                  Add to library
                </Button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* File Drop & Upload Tray */}
        {processingState === 'idle' && (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
              const file = e.dataTransfer.files?.[0];
              if (file) processUploadedFile(file);
            }}
            className={`p-6 sm:p-8 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center transition-all ${
              dragActive
                ? 'border-primary bg-primary-container/10'
                : 'border-outline-variant/40 bg-surface-container-low hover:border-outline-variant/70'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".pdf,.pptx,.png,.jpg,.jpeg,.webp,.mp4,.webm,.mov,.txt,.md"
              className="hidden"
            />
            <div className="w-12 h-12 rounded-2xl bg-surface-container flex items-center justify-center text-primary mb-3">
              <UploadCloud size={24} />
            </div>

            <p className="text-sm font-semibold text-on-surface">
              Drop notes or slides here<span className="hidden [@media(pointer:fine)]:inline">, or position documents directly onto the collection tray</span>
            </p>
            <p className="text-xs text-on-surface-variant mt-1 whitespace-nowrap">
              PDF, slides, images, video
            </p>

            <Button
              variant="primary"
              onClick={() => fileInputRef.current?.click()}
              className="mt-4 h-10 px-5 text-xs font-semibold cursor-pointer"
            >
              Upload notes
            </Button>
          </div>
        )}

        {/* Extraction Progress State */}
        {processingState === 'extracting' && (
          <div className="p-6 rounded-2xl border border-outline-variant/30 bg-surface-container-low text-center space-y-3">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
            <h3 className="text-sm font-bold text-on-surface">{progress.stage}</h3>
            <p className="text-xs text-on-surface-variant">{progress.detail}</p>
            <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden max-w-xs mx-auto">
              <div
                className="bg-primary h-full transition-all duration-300"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
          </div>
        )}

        {/* Error State */}
        {processingState === 'error' && (
          <div className="p-5 rounded-2xl border border-error/30 bg-error/10 space-y-3">
            <div className="flex items-center gap-2 text-error text-sm font-bold">
              <AlertTriangle size={16} />
              <span>Extraction Failed</span>
            </div>
            <p className="text-xs text-on-surface-variant">{errorMessage}</p>
            <Button
              variant="ghost"
              onClick={() => setProcessingState('idle')}
              className="h-8 px-3 text-xs"
            >
              Try another file
            </Button>
          </div>
        )}

        {/* Candidate Review Flow */}
        {processingState === 'review' && (
          <div className="p-5 rounded-2xl border border-primary/30 bg-surface-container-low space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-on-surface">Review Extracted Topics</h3>
                <p className="text-xs text-on-surface-variant">
                  Select topics to add to your personal spin pool
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setReviewBatchLifecycle('temporary')}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${
                    reviewBatchLifecycle === 'temporary'
                      ? 'bg-primary text-white border-primary'
                      : 'bg-surface border-outline-variant/30 text-on-surface-variant'
                  }`}
                >
                  14 days
                </button>
                <button
                  type="button"
                  onClick={() => setReviewBatchLifecycle('permanent')}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${
                    reviewBatchLifecycle === 'permanent'
                      ? 'bg-amber-500 text-white border-amber-500'
                      : 'bg-surface border-outline-variant/30 text-on-surface-variant'
                  }`}
                >
                  Permanent
                </button>
              </div>
            </div>

            <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
              {candidateTopics.map(topic => {
                const isSelected = selectedTopicIds.has(topic.id);
                return (
                  <div
                    key={topic.id}
                    role="button"
                    tabIndex={0}
                    aria-pressed={isSelected}
                    onClick={() => {
                      const next = new Set(selectedTopicIds);
                      if (next.has(topic.id)) next.delete(topic.id);
                      else next.add(topic.id);
                      setSelectedTopicIds(next);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === ' ' || e.key === 'Enter') {
                        e.preventDefault();
                        const next = new Set(selectedTopicIds);
                        if (next.has(topic.id)) next.delete(topic.id);
                        else next.add(topic.id);
                        setSelectedTopicIds(next);
                      }
                    }}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-primary bg-primary-container/15'
                        : 'border-outline-variant/30 bg-surface hover:border-outline-variant/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-bold text-on-surface">{topic.title}</h4>
                      <div
                        aria-hidden="true"
                        className={`w-4 h-4 rounded-md flex items-center justify-center text-xs font-bold ${
                          isSelected ? 'bg-primary text-white' : 'border border-outline-variant'
                        }`}
                      >
                        {isSelected ? '✓' : ''}
                      </div>
                    </div>
                    <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                      {topic.description}
                    </p>
                    {topic.needs_review && (
                      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30">
                          Needs review
                        </span>
                        {topic.review_reasons?.length > 0 && (
                          <span className="text-[10px] text-on-surface-variant/80 truncate">
                            {topic.review_reasons.join(' · ')}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-outline-variant/20">
              <button
                type="button"
                onClick={() => setProcessingState('idle')}
                className="text-xs text-on-surface-variant hover:text-on-surface"
              >
                Cancel
              </button>
              <Button
                variant="primary"
                onClick={handleSaveReviewedCandidates}
                className="h-9 px-4 text-xs font-semibold"
              >
                Save {selectedTopicIds.size} topics
              </Button>
            </div>
          </div>
        )}

        {/* Engine Notice & Privacy */}
        <div className="pt-2 border-t border-outline-variant/20 text-xs text-on-surface-variant">
          <p>Files are read on your device. If you add a Gemini key, extracted text is sent to Google.</p>
        </div>

        {/* Improve Results (Optional) Disclosure */}
        <details className="text-xs text-on-surface-variant group pt-1">
          <summary className="cursor-pointer font-medium hover:text-primary transition-colors select-none">
            Improve results (optional)
          </summary>
          <div className="mt-3 p-3.5 rounded-xl bg-surface-container border border-outline-variant/30 space-y-2.5">
            <p className="text-xs text-on-surface leading-relaxed">
              Add your Google Gemini API key to enable enhanced topic structuring for complex manuscripts.
            </p>
            <div className="flex items-center gap-2">
              <input
                type="password"
                placeholder="AIzaSy..."
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-lg bg-surface border border-outline-variant/40 text-xs text-on-surface font-mono"
              />
              <button
                type="button"
                onClick={handleSaveKey}
                className="px-3 py-1.5 rounded-lg bg-primary text-white font-semibold text-xs cursor-pointer"
              >
                Save
              </button>
              {geminiApiKey && (
                <button
                  type="button"
                  onClick={handleClearKey}
                  className="px-2.5 py-1.5 rounded-lg bg-surface-container-high text-on-surface text-xs cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
            <p className="text-[11px] text-on-surface-variant/80">Stored only on this device.</p>
          </div>
        </details>

      </section>

    </div>
  );
};

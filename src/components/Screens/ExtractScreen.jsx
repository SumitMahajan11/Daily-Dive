import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Presentation,
  Image as ImageIcon,
  Video,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Key,
  ShieldCheck,
  Plus,
  Trash2,
  Edit2,
  RotateCw,
  X,
  FileCheck,
  Tag,
  BookOpen,
  ArrowRight,
  FolderOpen,
  FileUp,
  Clock,
  Pin,
  Layers,
  Check
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { extractFromPdf } from '../../lib/extractors/pdfExtractor';
import { extractFromPptx } from '../../lib/extractors/pptxExtractor';
import { extractFromImage } from '../../lib/extractors/imageExtractor';
import { extractFromVideo } from '../../lib/extractors/videoExtractor';
import { extractTopicsLocally, extractTopicsWithGemini, scoreCandidateTitle, CONFIDENCE_THRESHOLD } from '../../lib/topicExtractor';
import { Button } from '../UI/Button';

export const ExtractScreen = ({ onNavigateSpin, onNavigateFilter }) => {
  const { addCustomTopics, customTopics, deleteCustomTopic, showToast } = useData();

  // State
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [processingState, setProcessingState] = useState('idle'); // 'idle' | 'extracting' | 'review' | 'error'
  const [progress, setProgress] = useState({ stage: '', percent: 0, detail: '' });
  const [errorMessage, setErrorMessage] = useState('');
  const [extractedRawText, setExtractedRawText] = useState('');
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
  const [useByok, setUseByok] = useState(false);
  const [showByokSettings, setShowByokSettings] = useState(false);

  // Candidate Batch Retention Lifecycle
  const [reviewBatchLifecycle, setReviewBatchLifecycle] = useState('temporary'); // 'temporary' | 'permanent'

  // Manual Add Topic State
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualTitle, setManualTitle] = useState('');
  const [manualLifecycle, setManualLifecycle] = useState('temporary'); // 'temporary' | 'permanent'
  const [manualDomain, setManualDomain] = useState('general');
  const [manualDescription, setManualDescription] = useState('');
  const [manualTags, setManualTags] = useState('');

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

  const handleCreateManualTopic = (e) => {
    e?.preventDefault();
    if (!manualTitle.trim()) {
      showToast('Please enter a topic title', 'warning');
      return;
    }
    if (!manualDescription.trim()) {
      showToast('Please enter a brief topic description', 'warning');
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
      // Append to candidate list and auto-select
      setCandidateTopics(prev => [newTopic, ...prev]);
      setSelectedTopicIds(prev => new Set([newTopic.id, ...prev]));
      showToast(`Added "${newTopic.title}" to review candidates`, 'success');
    } else {
      // Direct add to personal spin pool
      addCustomTopics([newTopic]);
      showToast(
        isPermanent
          ? `Added "${newTopic.title}" to permanent collection!`
          : `Added "${newTopic.title}" (expires in 14 days)`,
        'success'
      );
    }

    // Reset form
    setManualTitle('');
    setManualDescription('');
    setManualTags('');
    setManualDomain('general');
    setManualLifecycle('temporary');
    setShowManualForm(false);
  };

  const fileInputRef = useRef(null);

  // Save BYOK Key
  const handleSaveApiKey = (key) => {
    setGeminiApiKey(key);
    if (typeof window !== 'undefined') {
      if (key.trim()) {
        localStorage.setItem('daily_dive_gemini_key', key.trim());
        showToast('Gemini API key saved to your browser', 'success');
      } else {
        localStorage.removeItem('daily_dive_gemini_key');
        showToast('Gemini API key removed', 'info');
      }
    }
  };

  // Drag and drop handlers
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // Main file processing pipeline
  const processFile = async (file) => {
    setSelectedFile(file);
    setProcessingState('extracting');
    setErrorMessage('');
    setProgress({ stage: 'Validating file format', percent: 5, detail: file.name });

    try {
      const fileName = file.name.toLowerCase();
      let extractionResult;

      // 1. Route to appropriate client-side extractor
      if (fileName.endsWith('.pdf') || file.type === 'application/pdf') {
        extractionResult = await extractFromPdf(file, setProgress);
      } else if (fileName.endsWith('.pptx') || file.type.includes('presentationml')) {
        extractionResult = await extractFromPptx(file, setProgress);
      } else if (file.type.startsWith('image/')) {
        extractionResult = await extractFromImage(file, setProgress);
      } else if (file.type.startsWith('video/') || fileName.endsWith('.mp4') || fileName.endsWith('.webm')) {
        extractionResult = await extractFromVideo(file, setProgress);
      } else if (fileName.endsWith('.txt') || fileName.endsWith('.md')) {
        const text = await file.text();
        const rawSections = text
          .split(/\n\s*---+\s*\n|\n(?=#{1,3}\s)/m)
          .map(s => s.trim())
          .filter(s => s.length > 20);
        extractionResult = { text, rawSections: rawSections.length > 0 ? rawSections : [text], title: file.name.replace(/\.[^/.]+$/, '') };
      } else {
        throw new Error(
          'Unsupported file format. Please upload a PDF (.pdf), PowerPoint (.pptx), Text/Markdown (.txt, .md), Image (.png, .jpg), or Video (.mp4).'
        );
      }

      setExtractedRawText(extractionResult.text);

      // 2. Synthesize Discrete Topics
      setProgress({
        stage: useByok && geminiApiKey ? 'Synthesizing topics with Gemini AI' : 'Extracting topics with local NLP',
        percent: 92,
        detail: 'Structuring micro-learning cards...'
      });

      let topics = [];
      if (useByok && geminiApiKey.trim()) {
        try {
          topics = await extractTopicsWithGemini(extractionResult.text, geminiApiKey, file.name);
          topics = topics.map(t => {
            const sc = scoreCandidateTitle(t.title);
            return {
              ...t,
              confidence: sc.confidence,
              confidence_rating: sc.confidence_rating,
              needs_review: sc.needsReview,
              is_confirmed: !sc.needsReview,
              review_reasons: sc.reviewReasons
            };
          });
        } catch (byokErr) {
          console.warn('BYOK Gemini failed, falling back to local NLP:', byokErr);
          showToast(`Gemini API failed (${byokErr.message}). Using local NLP engine.`, 'warning');
          topics = extractTopicsLocally(
            extractionResult.text,
            extractionResult.rawSections || extractionResult.rawPages || extractionResult.rawSlides || extractionResult.rawFrames,
            file.name,
            { slideMetadata: extractionResult.slideMetadata }
          );
        }
      } else {
        topics = extractTopicsLocally(
          extractionResult.text,
          extractionResult.rawSections || extractionResult.rawPages || extractionResult.rawSlides || extractionResult.rawFrames,
          file.name,
          { slideMetadata: extractionResult.slideMetadata }
        );
      }

      if (topics.length === 0) {
        throw new Error('No discrete study topics could be identified from the extracted content.');
      }

      setCandidateTopics(topics);
      // Select all candidate topics by default so user can review and deselect
      setSelectedTopicIds(new Set(topics.map(t => t.id)));
      setProcessingState('review');
      setProgress({ stage: 'Completed', percent: 100, detail: `Found ${topics.length} topics` });

    } catch (err) {
      console.error('Extraction error:', err);
      setErrorMessage(err.message || 'An unexpected error occurred during extraction.');
      setProcessingState('error');
    }
  };

  // Toggle candidate topic selection
  const toggleTopicSelection = (id) => {
    setSelectedTopicIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    setSelectedTopicIds(new Set(candidateTopics.map(t => t.id)));
  };

  const handleDeselectAll = () => {
    setSelectedTopicIds(new Set());
  };

  // Confirm single flagged topic
  const handleConfirmTopic = (id) => {
    setCandidateTopics(prev => prev.map(t => {
      if (t.id !== id) return t;
      return { ...t, is_confirmed: true, needs_review: false };
    }));
    showToast('Topic title confirmed!', 'success');
  };

  // Confirm all flagged topics at once
  const handleConfirmAllFlagged = () => {
    setCandidateTopics(prev => prev.map(t => ({
      ...t,
      is_confirmed: true,
      needs_review: false
    })));
    showToast('All flagged topics confirmed!', 'success');
  };

  // Live title change with dynamic re-scoring
  const handleTitleChange = (id, newTitle) => {
    const scoreResult = scoreCandidateTitle(newTitle);
    setCandidateTopics(prev => prev.map(t => {
      if (t.id !== id) return t;
      return {
        ...t,
        title: newTitle,
        confidence: scoreResult.confidence,
        confidence_rating: scoreResult.confidence_rating,
        needs_review: scoreResult.needsReview,
        is_confirmed: !scoreResult.needsReview,
        review_reasons: scoreResult.reviewReasons
      };
    }));
  };

  // Edit candidate topic fields inline
  const updateCandidateTopic = (id, field, value) => {
    setCandidateTopics(prev => prev.map(t => {
      if (t.id !== id) return t;
      return { ...t, [field]: value };
    }));
  };

  // Add selected candidate topics to user's spin pool
  const handleAddToSpinPool = () => {
    const rawSelected = candidateTopics.filter(t => selectedTopicIds.has(t.id));
    if (rawSelected.length === 0) {
      showToast('Please select at least one topic to add to your spin pool', 'warning');
      return;
    }

    // Requirement 3: Enforce confirmation of any topic flagged below the confidence threshold
    const unconfirmed = rawSelected.filter(t => t.needs_review && !t.is_confirmed);
    if (unconfirmed.length > 0) {
      showToast(
        `Action Required: ${unconfirmed.length} topic${unconfirmed.length > 1 ? 's' : ''} flagged with "Needs review" must be confirmed or edited before entering the spin pool.`,
        'warning'
      );
      return;
    }

    const now = Date.now();
    const approvedTopics = rawSelected.map(t => {
      const topicLifecycle = t.lifecycle || reviewBatchLifecycle || 'temporary';
      const isPermanent = topicLifecycle === 'permanent';
      return {
        ...t,
        is_custom: true,
        group_name: 'custom',
        category: 'custom-notes',
        lifecycle: isPermanent ? 'permanent' : 'temporary',
        created_at: t.created_at || new Date().toISOString(),
        expires_at: isPermanent ? null : (t.expires_at || new Date(now + 14 * 86400000).toISOString()),
        expiry_rule: isPermanent ? null : '14_days'
      };
    });

    addCustomTopics(approvedTopics);
    const permCount = approvedTopics.filter(t => t.lifecycle === 'permanent').length;
    const tempCount = approvedTopics.length - permCount;

    setAddedNotice({
      count: approvedTopics.length,
      permCount,
      tempCount
    });
    // Reset back to idle
    setProcessingState('idle');
    setSelectedFile(null);
    setCandidateTopics([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleReset = () => {
    setProcessingState('idle');
    setSelectedFile(null);
    setCandidateTopics([]);
    setErrorMessage('');
    setAddedNotice(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-8">
      {/* ── Header & Privacy Banner ── */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-on-surface">
              Upload & Extract Topics
            </h1>
            <p className="text-sm text-on-surface-variant mt-1 max-w-xl">
              Turn your lecture slides, class notes, research PDFs, or presentation recordings directly into spinnable micro-learning cards.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-xs font-mono shrink-0 self-start sm:self-auto shadow-sm">
            <ShieldCheck size={16} />
            <span>100% Client-Side Privacy</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 text-xs text-on-surface-variant flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-primary shrink-0" />
            <span>Files are processed inside your browser memory. Nothing is uploaded to any server.</span>
          </div>
          <button
            type="button"
            onClick={() => setShowByokSettings(!showByokSettings)}
            className="text-primary hover:underline font-mono text-[11px] shrink-0 cursor-pointer flex items-center gap-1"
          >
            <Key size={13} />
            {geminiApiKey ? 'Gemini Key Configured' : 'Optional BYOK Upgrade'}
          </button>
        </div>
      </div>

      {/* ── Optional BYOK Key Accordion ── */}
      <AnimatePresence>
        {showByokSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 sm:p-5 rounded-2xl bg-surface-container-low border border-primary/25 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display text-sm font-bold text-on-surface flex items-center gap-2">
                    <Key size={16} className="text-primary" />
                    Bring Your Own Gemini API Key (Optional Upgrade)
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-1 max-w-2xl leading-relaxed">
                    Daily Dive's built-in local NLP extractor works completely free without any API key or external service.
                    If you want higher-fidelity summarization, enter a Gemini API key. Only the extracted text is sent to Google's API, never your uploaded files.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowByokSettings(false)}
                  className="text-outline hover:text-on-surface p-1 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="password"
                  placeholder="AIzaSy..."
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  className="flex-1 px-3.5 py-2 rounded-xl bg-surface border border-outline-variant/40 text-on-surface text-sm font-mono focus:outline-none focus:border-primary"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => handleSaveApiKey(geminiApiKey)}
                  >
                    Save Key
                  </Button>
                  {geminiApiKey && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleSaveApiKey('')}
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <label className="flex items-center gap-2 text-xs text-on-surface-variant cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useByok}
                    disabled={!geminiApiKey}
                    onChange={(e) => setUseByok(e.target.checked)}
                    className="rounded border-outline-variant text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                  />
                  <span>Enable Gemini BYOK for next extraction</span>
                </label>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── State: IDLE (Upload Dropzone) ── */}
      {processingState === 'idle' && (
        <div className="space-y-6">
          {/* Post-add confirmation banner */}
          {addedNotice && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 sm:p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <h4 className="font-display text-sm font-bold text-on-surface">
                    {addedNotice.count} topic{addedNotice.count !== 1 ? 's' : ''} added to your active spin pool!
                  </h4>
                  <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">
                    {addedNotice.permCount > 0 && `${addedNotice.permCount} permanent`}
                    {addedNotice.permCount > 0 && addedNotice.tempCount > 0 && ' · '}
                    {addedNotice.tempCount > 0 && `${addedNotice.tempCount} temporary (auto-expires in 14 days)`}.
                    {' '}Manage them anytime in <span className="font-semibold text-on-surface">Category Filter → Custom Uploads</span>.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {onNavigateFilter && (
                  <Button size="sm" variant="secondary" onClick={onNavigateFilter} className="text-xs">
                    Category Filter
                  </Button>
                )}
                {onNavigateSpin && (
                  <Button size="sm" variant="primary" onClick={onNavigateSpin} className="text-xs flex items-center gap-1.5">
                    <span>Spin Now</span>
                    <ArrowRight size={13} />
                  </Button>
                )}
              </div>
            </motion.div>
          )}

          {/* ── BESPOKE MANUSCRIPT INTAKE TRAY (Fix 3) ── */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`journal-card relative rounded-3xl p-8 sm:p-12 text-center transition-all duration-300 cursor-pointer flex flex-col items-center justify-center gap-5 overflow-hidden group select-none ${
              dragActive
                ? 'border-primary bg-primary/5 scale-[1.015] shadow-2xl shadow-primary/20 ring-2 ring-primary/25'
                : 'border border-outline-variant/35 bg-gradient-to-b from-surface-container-low/90 via-surface-container/50 to-surface-container-low/90 hover:border-primary/50 hover:shadow-lg'
            }`}
          >
            {/* Archival Docket Register Corner Crosshairs */}
            <div className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-primary/30 rounded-tl-sm pointer-events-none group-hover:border-primary/60 transition-colors" />
            <div className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-primary/30 rounded-tr-sm pointer-events-none group-hover:border-primary/60 transition-colors" />
            <div className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-primary/30 rounded-bl-sm pointer-events-none group-hover:border-primary/60 transition-colors" />
            <div className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-primary/30 rounded-br-sm pointer-events-none group-hover:border-primary/60 transition-colors" />

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.pptx,.txt,.md,.png,.jpg,.jpeg,.webp,.mp4,.webm"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Archival Intake Instrument Emblem */}
            <div className="relative">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border shadow-sm transition-all duration-300 ${
                dragActive
                  ? 'bg-primary text-on-primary border-primary scale-110 shadow-lg shadow-primary/30 animate-pulse'
                  : 'bg-primary/10 text-primary border-primary/25 group-hover:scale-105 group-hover:border-primary/50 group-hover:bg-primary/15'
              }`}>
                <FileUp size={30} className="stroke-[1.8]" />
              </div>
              <div className={`absolute -inset-2 rounded-3xl border border-primary/20 pointer-events-none transition-opacity duration-300 ${
                dragActive ? 'opacity-100 scale-105' : 'opacity-0 group-hover:opacity-40'
              }`} />
            </div>

            {/* Typography & Intake Prompt */}
            <div className="space-y-2 max-w-md">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container border border-outline-variant/30 text-[10px] font-mono uppercase tracking-wider text-outline">
                <span>Curator's Intake Desk</span>
              </div>
              <h3 className="font-display text-lg sm:text-xl font-bold text-on-surface tracking-tight">
                {dragActive ? 'Release Source Material to Begin Synthesis' : 'Deposit Study Manuscripts & Research Notes'}
              </h3>
              <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                Feed research papers, lecture slide decks, annotated diagrams, or recorded presentations onto the collection tray to distill discrete, high-yield study cards.
              </p>
            </div>

            {/* Tactile Ingestion Button */}
            <div className="pt-1 flex flex-col items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="font-mono text-xs px-4 py-2 border border-outline-variant/40 hover:border-primary flex items-center gap-2 shadow-sm"
              >
                <FolderOpen size={14} className="text-primary" />
                <span>Select Manuscript from Storage</span>
              </Button>
              <span className="text-[11px] font-mono text-outline">
                or position documents directly onto the collection tray
              </span>
            </div>

            {/* Archival Specification Chips */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-container/80 border border-outline-variant/30 text-xs font-mono text-on-surface-variant">
                <FileText size={13} className="text-red-400" /> PDF · Scholarly Texts
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-container/80 border border-outline-variant/30 text-xs font-mono text-on-surface-variant">
                <Presentation size={13} className="text-amber-400" /> PPTX · Slide Decks
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-container/80 border border-outline-variant/30 text-xs font-mono text-on-surface-variant">
                <ImageIcon size={13} className="text-blue-400" /> Image · Notes & Handouts
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-container/80 border border-outline-variant/30 text-xs font-mono text-on-surface-variant">
                <Video size={13} className="text-purple-400" /> Video · Presentations
              </span>
            </div>
          </div>

          {/* Local NLP Quality Notice & BYOK Recommendation */}
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-xs text-on-surface-variant">
            <Sparkles size={16} className="text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-on-surface">
                Local NLP Engine Notice:
              </p>
              <p className="leading-relaxed">
                Topic synthesis runs 100% on-device inside your browser using heuristic phrase extraction. For dense research papers or unstructured slides, extraction results improve significantly with your own free Gemini API key configured above.
              </p>
            </div>
          </div>

          {/* Manual Add Topic Section */}
          <div className="p-5 sm:p-6 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Plus size={18} />
                </div>
                <div>
                  <h3 className="font-display text-sm font-bold text-on-surface">
                    Manually Add a Topic
                  </h3>
                  <p className="text-xs text-on-surface-variant">
                    Add custom study cards directly into your roulette spin pool without uploading a file.
                  </p>
                </div>
              </div>

              <Button
                variant={showManualForm ? "ghost" : "secondary"}
                size="sm"
                onClick={() => setShowManualForm(!showManualForm)}
                className="flex items-center gap-1.5"
              >
                {showManualForm ? (
                  <>
                    <X size={14} />
                    <span>Cancel</span>
                  </>
                ) : (
                  <>
                    <Plus size={14} />
                    <span>Add Manually</span>
                  </>
                )}
              </Button>
            </div>

            {/* Expandable Manual Topic Form */}
            <AnimatePresence>
              {showManualForm && (
                <motion.form
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  onSubmit={handleCreateManualTopic}
                  className="space-y-3 pt-3 border-t border-outline-variant/20 overflow-hidden"
                >
                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-outline uppercase tracking-wider">
                      Topic Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Paxos Consensus Protocol"
                      value={manualTitle}
                      onChange={(e) => setManualTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-surface border border-outline-variant/40 text-on-surface text-sm focus:outline-none focus:border-primary"
                    />
                  </div>

                  {/* Retention Lifecycle Selection (Fix 1) */}
                  <div className="space-y-1.5 pt-1">
                    <label className="text-[11px] font-mono text-outline uppercase tracking-wider flex items-center justify-between">
                      <span>Retention Policy *</span>
                      <span className="text-[10px] text-primary lowercase font-mono">
                        {manualLifecycle === 'temporary' ? '14-day auto-expiry' : 'permanent storage'}
                      </span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setManualLifecycle('temporary')}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                          manualLifecycle === 'temporary'
                            ? 'bg-primary/10 border-primary shadow-sm'
                            : 'bg-surface border-outline-variant/30 hover:border-outline-variant/60'
                        }`}
                      >
                        <div className={`p-1.5 rounded-lg shrink-0 ${manualLifecycle === 'temporary' ? 'bg-primary text-on-primary' : 'bg-surface-container text-outline'}`}>
                          <Clock size={14} />
                        </div>
                        <div className="space-y-0.5 min-w-0">
                          <div className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                            <span>Temporary</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400">14 Days</span>
                          </div>
                          <p className="text-[11px] text-on-surface-variant leading-tight">
                            Auto-retires in 14 days without cluttering library. Soft-deleted with 1-click undo.
                          </p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setManualLifecycle('permanent')}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                          manualLifecycle === 'permanent'
                            ? 'bg-primary/10 border-primary shadow-sm'
                            : 'bg-surface border-outline-variant/30 hover:border-outline-variant/60'
                        }`}
                      >
                        <div className={`p-1.5 rounded-lg shrink-0 ${manualLifecycle === 'permanent' ? 'bg-primary text-on-primary' : 'bg-surface-container text-outline'}`}>
                          <Pin size={14} />
                        </div>
                        <div className="space-y-0.5 min-w-0">
                          <div className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                            <span>Permanent</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">Indefinite</span>
                          </div>
                          <p className="text-[11px] text-on-surface-variant leading-tight">
                            Retained indefinitely in your roulette pool until you manually delete it.
                          </p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Related Field / Domain Flavor */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-outline uppercase tracking-wider">
                      Related Domain (Informational Tag)
                    </label>
                    <select
                      value={manualDomain}
                      onChange={(e) => setManualDomain(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-surface border border-outline-variant/40 text-on-surface text-sm focus:outline-none focus:border-primary"
                    >
                      {DOMAIN_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-mono text-outline uppercase tracking-wider">
                        Card Description (1–2 sentences) *
                      </label>
                      <span className="text-[10px] font-mono text-outline">
                        {manualDescription.length} / 165 chars recommended
                      </span>
                    </div>
                    <textarea
                      required
                      rows={2}
                      maxLength={280}
                      placeholder="e.g., A distributed consensus algorithm that ensures multiple nodes agree on a single data value even in the presence of node failures and network delays."
                      value={manualDescription}
                      onChange={(e) => setManualDescription(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-surface border border-outline-variant/40 text-on-surface text-xs leading-relaxed focus:outline-none focus:border-primary resize-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-outline uppercase tracking-wider">
                      Tags (optional, comma-separated)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., consensus, replication, fault-tolerance"
                      value={manualTags}
                      onChange={(e) => setManualTags(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-surface border border-outline-variant/40 text-on-surface text-xs focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowManualForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      className="flex items-center gap-1.5"
                    >
                      <Plus size={14} />
                      <span>Add to Spin Pool</span>
                    </Button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* ── State: EXTRACTING (Progress Bar & Status) ── */}
      {processingState === 'extracting' && (
        <div className="p-8 sm:p-10 rounded-3xl bg-surface-container-low border border-outline-variant/30 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 animate-pulse">
                <RotateCw size={20} className="animate-spin" />
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-on-surface">
                  {progress.stage || 'Processing file...'}
                </h3>
                <p className="text-xs font-mono text-on-surface-variant mt-0.5">
                  {selectedFile?.name} ({((selectedFile?.size || 0) / (1024 * 1024)).toFixed(2)} MB)
                </p>
              </div>
            </div>
            <span className="font-mono text-lg font-bold text-primary">
              {progress.percent}%
            </span>
          </div>

          {/* Progress Track */}
          <div className="w-full bg-surface-container-highest h-2.5 rounded-full overflow-hidden">
            <motion.div
              className="bg-primary-container h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress.percent}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-outline font-mono">
            <span>{progress.detail || 'Extracting content directly in browser...'}</span>
            <span>No data leaves your device</span>
          </div>
        </div>
      )}

      {/* ── State: ERROR (User-Facing Failure Handling) ── */}
      {processingState === 'error' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-red-500/10 border border-red-500/30 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-500 flex items-center justify-center shrink-0">
              <AlertTriangle size={22} />
            </div>
            <div className="space-y-1">
              <h3 className="font-display text-base font-bold text-red-600 dark:text-red-400">
                Extraction Failed
              </h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                {errorMessage}
              </p>
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <Button variant="primary" size="sm" onClick={handleReset}>
              Try Another File
            </Button>
            {selectedFile && (
              <Button variant="secondary" size="sm" onClick={() => processFile(selectedFile)}>
                Retry
              </Button>
            )}
          </div>
        </div>
      )}

      {/* ── State: REVIEW (Show Candidate Topics with Checkboxes & Inline Edit) ── */}
      {processingState === 'review' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30">
            <div>
              <h3 className="font-display text-base font-bold text-on-surface flex items-center gap-2">
                <FileCheck size={18} className="text-emerald-500" />
                Review Extracted Topics ({selectedTopicIds.size} of {candidateTopics.length} selected)
              </h3>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <span className="inline-flex items-center gap-1 text-xs font-mono font-medium text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 size={13} />
                  {candidateTopics.filter(t => !t.needs_review || t.is_confirmed).length} Verified (High Confidence)
                </span>
                {candidateTopics.some(t => t.needs_review && !t.is_confirmed) && (
                  <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/30">
                    <AlertTriangle size={13} className="text-amber-500" />
                    {candidateTopics.filter(t => t.needs_review && !t.is_confirmed).length} Needs Review (Low Confidence)
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
              {candidateTopics.some(t => t.needs_review && !t.is_confirmed) && (
                <button
                  type="button"
                  onClick={handleConfirmAllFlagged}
                  className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs flex items-center gap-1 cursor-pointer transition-all shadow-xs"
                >
                  <Check size={12} />
                  <span>Confirm All Flagged</span>
                </button>
              )}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowManualForm(!showManualForm)}
                className="flex items-center gap-1.5 text-xs"
              >
                <Plus size={14} />
                <span>Add Missing</span>
              </Button>
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-xs text-primary hover:underline font-mono px-2 py-1 cursor-pointer"
              >
                Select All
              </button>
              <span className="text-outline-variant">|</span>
              <button
                type="button"
                onClick={handleDeselectAll}
                className="text-xs text-on-surface-variant hover:underline font-mono px-2 py-1 cursor-pointer"
              >
                Deselect All
              </button>
            </div>
          </div>

          {/* Batch Retention Policy Selection Bar (Fix 1) */}
          <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-xs font-mono font-semibold text-on-surface uppercase tracking-wider flex items-center gap-1.5">
                <Clock size={13} className="text-primary" />
                <span>Default Retention Policy</span>
              </span>
              <p className="text-[11px] text-on-surface-variant">
                Temporary topics auto-expire in 14 days (with 1-click undo). Permanent topics remain indefinitely.
              </p>
            </div>
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-surface-container border border-outline-variant/30 shrink-0 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => {
                  setReviewBatchLifecycle('temporary');
                  setCandidateTopics(prev => prev.map(t => ({ ...t, lifecycle: 'temporary' })));
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  reviewBatchLifecycle === 'temporary'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <Clock size={12} />
                <span>Temporary (14d Expiry)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setReviewBatchLifecycle('permanent');
                  setCandidateTopics(prev => prev.map(t => ({ ...t, lifecycle: 'permanent' })));
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  reviewBatchLifecycle === 'permanent'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <Pin size={12} />
                <span>Permanent Collection</span>
              </button>
            </div>
          </div>

          {/* Optional Inline Manual Topic Add in Review */}
          <AnimatePresence>
            {showManualForm && (
              <motion.form
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                onSubmit={handleCreateManualTopic}
                className="p-5 rounded-2xl bg-surface-container-low border border-primary/30 space-y-3 overflow-hidden shadow-sm"
              >
                <div className="flex items-center justify-between pb-1">
                  <h4 className="font-display text-sm font-bold text-on-surface flex items-center gap-1.5">
                    <Plus size={16} className="text-primary" />
                    Add a Topic Missed by the Extractor
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowManualForm(false)}
                    className="text-outline hover:text-on-surface p-1 cursor-pointer"
                  >
                    <X size={15} />
                  </button>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-outline uppercase tracking-wider">
                    Topic Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Multi-Tenancy Isolation Patterns"
                    value={manualTitle}
                    onChange={(e) => setManualTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-outline-variant/40 text-on-surface text-sm focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1.5 pt-1">
                  <label className="text-[11px] font-mono text-outline uppercase tracking-wider flex items-center justify-between">
                    <span>Retention Policy *</span>
                    <span className="text-[10px] text-primary lowercase font-mono">
                      {manualLifecycle === 'temporary' ? '14-day auto-expiry' : 'permanent storage'}
                    </span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setManualLifecycle('temporary')}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                        manualLifecycle === 'temporary'
                          ? 'bg-primary/10 border-primary shadow-sm'
                          : 'bg-surface border-outline-variant/30 hover:border-outline-variant/60'
                      }`}
                    >
                      <Clock size={14} className="text-primary shrink-0" />
                      <div className="text-xs font-bold text-on-surface">
                        Temporary (14 Days)
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setManualLifecycle('permanent')}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                        manualLifecycle === 'permanent'
                          ? 'bg-primary/10 border-primary shadow-sm'
                          : 'bg-surface border-outline-variant/30 hover:border-outline-variant/60'
                      }`}
                    >
                      <Pin size={14} className="text-primary shrink-0" />
                      <div className="text-xs font-bold text-on-surface">
                        Permanent Collection
                      </div>
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-outline uppercase tracking-wider">
                    Related Domain (Informational Tag)
                  </label>
                  <select
                    value={manualDomain}
                    onChange={(e) => setManualDomain(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-outline-variant/40 text-on-surface text-sm focus:outline-none focus:border-primary"
                  >
                    {DOMAIN_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-outline uppercase tracking-wider">
                    Description *
                  </label>
                  <textarea
                    required
                    rows={2}
                    maxLength={280}
                    placeholder="Short 1–2 sentence explanation of the concept..."
                    value={manualDescription}
                    onChange={(e) => setManualDescription(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-outline-variant/40 text-on-surface text-xs leading-relaxed focus:outline-none focus:border-primary resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowManualForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    className="flex items-center gap-1.5"
                  >
                    <Plus size={14} />
                    <span>Add to Candidate List</span>
                  </Button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Candidate Topic Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {candidateTopics.map((topic) => {
              const isSelected = selectedTopicIds.has(topic.id);
              const currentLifecycle = topic.lifecycle || reviewBatchLifecycle || 'temporary';
              const needsReview = topic.needs_review && !topic.is_confirmed;

              return (
                <div
                  key={topic.id}
                  className={`candidate-topic-card p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between gap-3 ${
                    needsReview
                      ? 'bg-amber-500/[0.04] border-amber-500/60 shadow-md ring-1 ring-amber-500/30'
                      : isSelected
                      ? 'bg-surface-container border-primary/40 shadow-sm'
                      : 'bg-surface-container-lowest/50 border-outline-variant/20 opacity-60'
                  }`}
                >
                  <div className="space-y-2.5">
                    {/* Header Row: Checkbox + Status Badge + Lifecycle Pill + Source */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleTopicSelection(topic.id)}
                            className="rounded border-outline-variant text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                          />
                          <span className="text-xs font-mono font-semibold text-primary uppercase tracking-wider">
                            {topic.tags?.[0] || 'custom'}
                          </span>
                        </label>

                        {/* Visible Confidence Status Badge (Requirement 3) */}
                        {needsReview ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40 shadow-xs animate-pulse">
                            <AlertTriangle size={11} className="text-amber-500" />
                            Needs review ({topic.confidence || 0}%)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 size={11} className="text-emerald-500" />
                            Verified ({topic.confidence || 95}%)
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Interactive Lifecycle Pill */}
                        <button
                          type="button"
                          onClick={() => updateCandidateTopic(topic.id, 'lifecycle', currentLifecycle === 'permanent' ? 'temporary' : 'permanent')}
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold border transition-all cursor-pointer ${
                            currentLifecycle === 'permanent'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                          }`}
                          title="Click to toggle between Temporary (14 days) and Permanent"
                        >
                          {currentLifecycle === 'permanent' ? (
                            <>
                              <Pin size={10} />
                              <span>Permanent</span>
                            </>
                          ) : (
                            <>
                              <Clock size={10} />
                              <span>Temporary (14d)</span>
                            </>
                          )}
                        </button>
                        <span className="text-[10px] font-mono text-outline truncate max-w-[100px]">
                          {topic.source}
                        </span>
                      </div>
                    </div>

                    {/* Needs Review Alert & Confirm Bar */}
                    {needsReview && (
                      <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-900 dark:text-amber-100 flex items-center justify-between gap-2">
                        <div className="space-y-0.5 min-w-0">
                          <div className="font-bold flex items-center gap-1 text-amber-600 dark:text-amber-400">
                            <AlertTriangle size={12} className="shrink-0" />
                            <span>Action Required: Low Confidence Title</span>
                          </div>
                          {topic.review_reasons && topic.review_reasons.length > 0 && (
                            <p className="text-[10px] text-amber-700 dark:text-amber-300 font-mono truncate">
                              Deductions: {topic.review_reasons.join(' · ')}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleConfirmTopic(topic.id)}
                          className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs flex items-center gap-1 cursor-pointer transition-all shadow-xs shrink-0"
                          title="Accept title as valid"
                        >
                          <Check size={12} />
                          <span>Confirm</span>
                        </button>
                      </div>
                    )}

                    {/* Editable Title with Dynamic Re-scoring */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-outline uppercase tracking-wider flex items-center justify-between">
                        <span>Topic Title</span>
                        {needsReview && (
                          <span className="text-amber-600 dark:text-amber-400 lowercase">
                            edit to re-score or confirm
                          </span>
                        )}
                      </label>
                      <input
                        type="text"
                        value={topic.title}
                        onChange={(e) => handleTitleChange(topic.id, e.target.value)}
                        placeholder="Topic Title"
                        className="w-full font-display font-bold text-base text-on-surface bg-surface/40 border border-outline-variant/30 rounded-xl px-3 py-1.5 hover:border-outline-variant/60 focus:border-primary focus:outline-none"
                      />
                    </div>

                    {/* Editable Description */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-outline uppercase tracking-wider">
                        Description & Takeaways
                      </label>
                      <textarea
                        rows={3}
                        value={topic.description}
                        onChange={(e) => updateCandidateTopic(topic.id, 'description', e.target.value)}
                        placeholder="Topic explanation and key takeaways..."
                        className="w-full text-xs text-on-surface-variant bg-surface/50 border border-outline-variant/30 rounded-xl p-2.5 resize-none focus:outline-none focus:border-primary leading-relaxed"
                      />
                    </div>

                    {/* Tags preview */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {topic.tags?.map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-container-high text-on-surface-variant font-mono text-[10px] border border-outline-variant/20"
                        >
                          <Tag size={10} />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-outline-variant/20">
            <Button variant="ghost" size="md" onClick={handleReset}>
              Discard & Upload Another
            </Button>

            <Button
              variant="primary"
              size="lg"
              onClick={handleAddToSpinPool}
              disabled={selectedTopicIds.size === 0}
              className="w-full sm:w-auto flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={18} />
              Add {selectedTopicIds.size} Topic{selectedTopicIds.size !== 1 ? 's' : ''} to Spin Pool
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

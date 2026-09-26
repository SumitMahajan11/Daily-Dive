import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UploadCloud,
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
  ArrowRight
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { extractFromPdf } from '../../lib/extractors/pdfExtractor';
import { extractFromPptx } from '../../lib/extractors/pptxExtractor';
import { extractFromImage } from '../../lib/extractors/imageExtractor';
import { extractFromVideo } from '../../lib/extractors/videoExtractor';
import { extractTopicsLocally, extractTopicsWithGemini } from '../../lib/topicExtractor';
import { Button } from '../UI/Button';

export const ExtractScreen = ({ onNavigateSpin }) => {
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
  
  // BYOK State
  const [geminiApiKey, setGeminiApiKey] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('daily_dive_gemini_key') || '';
    }
    return '';
  });
  const [useByok, setUseByok] = useState(false);
  const [showByokSettings, setShowByokSettings] = useState(false);

  // Manual Add Topic State
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualTitle, setManualTitle] = useState('');
  const [manualCategory, setManualCategory] = useState('cloud-infra');
  const [manualCustomCategory, setManualCustomCategory] = useState('');
  const [manualDescription, setManualDescription] = useState('');
  const [manualTags, setManualTags] = useState('');

  const CATEGORY_OPTIONS = [
    { value: 'cloud-infra', label: 'Cloud & Infrastructure (Tech)', group: 'tech' },
    { value: 'systems-distributed-computing', label: 'Systems & Distributed Computing (Tech)', group: 'tech' },
    { value: 'ai-ml', label: 'AI & Machine Learning (Tech)', group: 'tech' },
    { value: 'data-structures-algorithms', label: 'Data Structures & Algorithms (Tech)', group: 'tech' },
    { value: 'web-dev', label: 'Web Architecture & Performance (Tech)', group: 'tech' },
    { value: 'finance', label: 'Finance & Wealth Strategy (Money & Career)', group: 'money-career' },
    { value: 'career-strategy', label: 'Career Strategy & Leadership (Money & Career)', group: 'money-career' },
    { value: 'communication', label: 'Communication & Rhetoric (Mind & Growth)', group: 'mind-growth' },
    { value: 'philosophy-critical-thinking', label: 'Philosophy & Critical Thinking (Mind & Growth)', group: 'mind-growth' },
    { value: 'psychology', label: 'Psychology & Decision Making (Mind & Growth)', group: 'mind-growth' },
    { value: 'science-nature', label: 'Science & Natural World (World & Ideas)', group: 'world-ideas' },
    { value: 'history-innovation', label: 'History of Innovation (World & Ideas)', group: 'world-ideas' },
    { value: 'custom', label: 'Custom Category...', group: 'custom' },
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

    const selectedOption = CATEGORY_OPTIONS.find(c => c.value === manualCategory);
    const finalCategory = manualCategory === 'custom' 
      ? (manualCustomCategory.trim() || 'custom-notes') 
      : manualCategory;
    const finalGroup = selectedOption ? selectedOption.group : 'custom';

    const tagsList = manualTags.trim() 
      ? manualTags.split(',').map(t => t.trim()).filter(Boolean) 
      : ['Custom', finalCategory];

    const newTopic = {
      id: `manual_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      title: manualTitle.trim(),
      category: finalCategory,
      group_name: finalGroup,
      description: manualDescription.trim(),
      source: 'Manual Entry',
      tags: tagsList,
      difficulty: 'intermediate',
      read_time_minutes: 3,
      is_custom: true
    };

    if (processingState === 'review') {
      // Append to candidate list and auto-select
      setCandidateTopics(prev => [newTopic, ...prev]);
      setSelectedTopicIds(prev => new Set([newTopic.id, ...prev]));
      showToast(`Added "${newTopic.title}" to review list`, 'success');
    } else {
      // Direct add to personal spin pool
      addCustomTopics([newTopic]);
      showToast(`Added "${newTopic.title}" directly to your spin pool!`, 'success');
    }

    // Reset form
    setManualTitle('');
    setManualDescription('');
    setManualTags('');
    setManualCustomCategory('');
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
      } else {
        throw new Error(
          'Unsupported file format. Please upload a PDF (.pdf), PowerPoint (.pptx), Image (.png, .jpg), or Video (.mp4).'
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
        } catch (byokErr) {
          console.warn('BYOK Gemini failed, falling back to local NLP:', byokErr);
          showToast(`Gemini API failed (${byokErr.message}). Using local NLP engine.`, 'warning');
          topics = extractTopicsLocally(extractionResult.text, extractionResult.rawPages || extractionResult.rawSlides || extractionResult.rawFrames, file.name);
        }
      } else {
        topics = extractTopicsLocally(
          extractionResult.text,
          extractionResult.rawPages || extractionResult.rawSlides || extractionResult.rawFrames,
          file.name
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

  // Edit candidate topic fields inline
  const updateCandidateTopic = (id, field, value) => {
    setCandidateTopics(prev => prev.map(t => {
      if (t.id !== id) return t;
      return { ...t, [field]: value };
    }));
  };

  // Add selected candidate topics to user's spin pool
  const handleAddToSpinPool = () => {
    const approvedTopics = candidateTopics.filter(t => selectedTopicIds.has(t.id));
    if (approvedTopics.length === 0) {
      showToast('Please select at least one topic to add to your spin pool', 'warning');
      return;
    }

    addCustomTopics(approvedTopics);
    // Reset back to idle
    setProcessingState('idle');
    setSelectedFile(null);
    setCandidateTopics([]);
    if (onNavigateSpin) {
      onNavigateSpin();
    }
  };

  const handleReset = () => {
    setProcessingState('idle');
    setSelectedFile(null);
    setCandidateTopics([]);
    setErrorMessage('');
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
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-4 ${
              dragActive
                ? 'border-primary bg-primary/5 scale-[1.01]'
                : 'border-outline-variant/40 hover:border-primary/60 bg-surface-container-low/50 hover:bg-surface-container-low'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.pptx,.png,.jpg,.jpeg,.webp,.mp4,.webm"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shadow-sm">
              <UploadCloud size={32} />
            </div>

            <div className="space-y-1.5 max-w-md">
              <p className="font-display text-base sm:text-lg font-bold text-on-surface">
                Drag and drop study files here, or <span className="text-primary underline underline-offset-4">browse</span>
              </p>
              <p className="text-xs sm:text-sm text-outline">
                Supports PDF, PPTX slides, images (notes/handouts), and video presentations (up to 100MB).
              </p>
            </div>

            {/* Supported Formats Badges */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-container border border-outline-variant/30 text-xs font-mono text-on-surface-variant">
                <FileText size={14} className="text-red-400" /> PDF (Text & Scanned)
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-container border border-outline-variant/30 text-xs font-mono text-on-surface-variant">
                <Presentation size={14} className="text-amber-400" /> PPTX (Slides)
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-container border border-outline-variant/30 text-xs font-mono text-on-surface-variant">
                <ImageIcon size={14} className="text-blue-400" /> Images (Notes OCR)
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-container border border-outline-variant/30 text-xs font-mono text-on-surface-variant">
                <Video size={14} className="text-purple-400" /> Video (Lecture Slides)
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

                    <div className="space-y-1">
                      <label className="text-[11px] font-mono text-outline uppercase tracking-wider">
                        Category *
                      </label>
                      <select
                        value={manualCategory}
                        onChange={(e) => setManualCategory(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-surface border border-outline-variant/40 text-on-surface text-sm focus:outline-none focus:border-primary"
                      >
                        {CATEGORY_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {manualCategory === 'custom' && (
                    <div className="space-y-1">
                      <label className="text-[11px] font-mono text-outline uppercase tracking-wider">
                        Custom Category Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., Distributed Databases"
                        value={manualCustomCategory}
                        onChange={(e) => setManualCustomCategory(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-surface border border-outline-variant/40 text-on-surface text-sm focus:outline-none focus:border-primary"
                      />
                    </div>
                  )}

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
              <p className="text-xs text-on-surface-variant mt-0.5">
                Deselect any irrelevant topics or refine titles and descriptions before adding to your roulette wheel.
              </p>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowManualForm(!showManualForm)}
                className="flex items-center gap-1.5 text-xs"
              >
                <Plus size={14} />
                <span>Add Missing Topic</span>
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-outline uppercase tracking-wider">
                      Category *
                    </label>
                    <select
                      value={manualCategory}
                      onChange={(e) => setManualCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-surface border border-outline-variant/40 text-on-surface text-sm focus:outline-none focus:border-primary"
                    >
                      {CATEGORY_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {manualCategory === 'custom' && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-outline uppercase tracking-wider">
                      Custom Category Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Cloud Architecture"
                      value={manualCustomCategory}
                      onChange={(e) => setManualCustomCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-surface border border-outline-variant/40 text-on-surface text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                )}

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
              return (
                <div
                  key={topic.id}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between gap-3 ${
                    isSelected
                      ? 'bg-surface-container border-primary/40 shadow-sm'
                      : 'bg-surface-container-lowest/50 border-outline-variant/20 opacity-60'
                  }`}
                >
                  <div className="space-y-2.5">
                    {/* Header Row: Checkbox + Category + Source */}
                    <div className="flex items-center justify-between gap-2">
                      <label className="flex items-center gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleTopicSelection(topic.id)}
                          className="rounded border-outline-variant text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                        />
                        <span className="text-xs font-mono font-semibold text-primary uppercase tracking-wider">
                          {topic.category || 'custom'}
                        </span>
                      </label>
                      <span className="text-[10px] font-mono text-outline truncate max-w-[140px]">
                        {topic.source}
                      </span>
                    </div>

                    {/* Editable Title */}
                    <input
                      type="text"
                      value={topic.title}
                      onChange={(e) => updateCandidateTopic(topic.id, 'title', e.target.value)}
                      placeholder="Topic Title"
                      className="w-full font-display font-bold text-base text-on-surface bg-transparent border-b border-transparent hover:border-outline-variant/50 focus:border-primary focus:outline-none py-0.5"
                    />

                    {/* Editable Description */}
                    <textarea
                      rows={3}
                      value={topic.description}
                      onChange={(e) => updateCandidateTopic(topic.id, 'description', e.target.value)}
                      placeholder="Topic explanation and key takeaways..."
                      className="w-full text-xs text-on-surface-variant bg-surface/50 border border-outline-variant/30 rounded-xl p-2.5 resize-none focus:outline-none focus:border-primary leading-relaxed"
                    />

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

      {/* ── Active Custom Topics in Personal Spin Pool ── */}
      {customTopics && customTopics.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-outline-variant/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen size={18} className="text-primary" />
              <h3 className="font-display text-base font-bold text-on-surface">
                Your Personal Spin Pool ({customTopics.length} custom topic{customTopics.length !== 1 ? 's' : ''})
              </h3>
            </div>
            {onNavigateSpin && (
              <Button size="sm" variant="secondary" onClick={onNavigateSpin} className="flex items-center gap-1.5">
                <span>Spin Now</span>
                <ArrowRight size={14} />
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {customTopics.map((topic) => (
              <div
                key={topic.id}
                className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col justify-between gap-2.5"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-outline mb-1">
                    <span className="text-primary font-semibold uppercase">{topic.category}</span>
                    <button
                      type="button"
                      onClick={() => deleteCustomTopic(topic.id)}
                      className="text-outline hover:text-red-500 transition-colors p-1 cursor-pointer"
                      title="Remove from spin pool"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <h4 className="font-display text-sm font-bold text-on-surface line-clamp-1">
                    {topic.title}
                  </h4>
                  <p className="text-xs text-on-surface-variant line-clamp-2 mt-1 leading-relaxed">
                    {topic.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-outline-variant/15 text-[10px] font-mono text-outline">
                  <span>Source: {topic.source || 'Notes'}</span>
                  <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary">Custom</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

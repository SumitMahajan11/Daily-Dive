import React, { useState, useEffect, useRef } from 'react';
import { useData } from '../../context/DataContext';
import { AudioController } from '../../lib/audio';
import { RotateCw, Check, BookOpen, ExternalLink, Cloud } from 'lucide-react';
import confetti from 'canvas-confetti';

export const SpinScreen = ({ onNavigateFilter }) => {
  const {
    topics,
    eligibleTopics,
    currentTopic,
    userProgressMap,
    userSettings,
    spinNextTopic,
    markCurrentTopicLearned,
    isMarkingLearned
  } = useData();

  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [tickerText, setTickerText] = useState(`Ready to spin · ${eligibleTopics.length} topics active in pool`);
  const [tickerActive, setTickerActive] = useState(false);

  const wheelRef = useRef(null);

  // Keyboard shortcut listener (Spacebar to spin)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && (e.target === document.body || e.target.tagName === 'MAIN')) {
        e.preventDefault();
        handleSpin();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSpinning, eligibleTopics]);

  const handleSpin = () => {
    if (isSpinning) return;

    if (eligibleTopics.length === 0) {
      alert("All topics are currently filtered out! Please enable at least one category in the Filter tab.");
      if (onNavigateFilter) onNavigateFilter();
      return;
    }

    setIsSpinning(true);
    setTickerActive(true);
    setTickerText("DECELERATING READOUT...");
    AudioController.init();

    const selected = spinNextTopic();

    // 4 to 6 full spins + random offset
    const spinRounds = 4 + Math.floor(Math.random() * 3);
    const spinDegrees = spinRounds * 360 + Math.floor(Math.random() * 360);
    const nextRotation = rotation + spinDegrees;
    setRotation(nextRotation);

    // Play ticking sound with progressive deceleration
    let tickInterval = 60;
    let elapsed = 0;
    const playNextTick = () => {
      if (elapsed < 2400) {
        AudioController.playTick();
        elapsed += tickInterval;
        tickInterval += 18;
        setTimeout(playNextTick, tickInterval);
      }
    };
    playNextTick();

    setTimeout(() => {
      setIsSpinning(false);
      setTickerActive(false);

      const groupName = (selected?.group_name || selected?.group || 'TOPIC').toUpperCase();
      setTickerText(`SETTLED — ${groupName}`);

      AudioController.playSuccess();

      if (userSettings?.haptics_enabled && navigator.vibrate) {
        try { navigator.vibrate([40, 60, 80]); } catch (e) {}
      }
    }, 2600);
  };

  const handleMarkLearned = async () => {
    await markCurrentTopicLearned();
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#5e6ad2', '#bdc2ff', '#ffb867']
      });
    } catch (e) {}
  };

  const topicProgress = currentTopic ? userProgressMap[currentTopic.id] : null;
  const isLearned = topicProgress && topicProgress.times_seen > 0;
  const group = currentTopic?.group_name || currentTopic?.group || 'General';
  const category = currentTopic?.category || currentTopic?.sub || '';
  const tags = currentTopic?.tags || [];
  const resources = currentTopic?.resources || currentTopic?.links || [];

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto pb-6">
      
      {/* Minimalist Precision Wheel Dial */}
      <div className="flex flex-col items-center justify-center py-2 relative">
        
        {/* Top Indigo Indicator Needle */}
        <div className="z-20 mb-[-8px] flex flex-col items-center drop-shadow-md">
          <div className="w-2 h-2 bg-primary-container rotate-45 mb-0.5 shadow-sm border border-primary/50"></div>
          <div className="w-1 h-3 bg-primary-container rounded-full"></div>
        </div>

        {/* Dial Ring Container */}
        <div className="relative w-52 h-52 sm:w-60 sm:h-60 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-outline-variant/40 shadow-[0_0_20px_rgba(94,106,210,0.1)]"></div>
          
          {/* Segmented Wheel SVG */}
          <svg
            ref={wheelRef}
            onClick={handleSpin}
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: isSpinning ? 'transform 2.6s cubic-bezier(0.12, 0.9, 0.2, 1)' : 'none'
            }}
            className="w-48 h-48 sm:w-56 sm:h-56 select-none cursor-pointer"
            viewBox="0 0 160 160"
          >
            <circle cx="80" cy="80" fill="#0d0f17" r="74" stroke="#1d1f28" strokeWidth="1.5"></circle>
            
            {/* Quadrant 1: TECH (Top Right) */}
            <path d="M 80,6 A 74,74 0 0,1 154,80 L 80,80 Z" fill="#1b1e2f" opacity="0.95"></path>
            {/* Quadrant 2: MONEY & CAREER (Bottom Right) */}
            <path d="M 154,80 A 74,74 0 0,1 80,154 L 80,80 Z" fill="#121522" opacity="0.75"></path>
            {/* Quadrant 3: MIND & GROWTH (Bottom Left) */}
            <path d="M 80,154 A 74,74 0 0,1 6,80 L 80,80 Z" fill="#1b1e2f" opacity="0.55"></path>
            {/* Quadrant 4: WORLD & IDEAS (Top Left) */}
            <path d="M 6,80 A 74,74 0 0,1 80,6 L 80,80 Z" fill="#121522" opacity="0.85"></path>

            {/* Dividers */}
            <line stroke="#2b2f44" strokeWidth="1" x1="80" x2="80" y1="6" y2="154"></line>
            <line stroke="#2b2f44" strokeWidth="1" x1="6" x2="154" y1="80" y2="80"></line>

            {/* Labels */}
            <text fill="#bdc2ff" fontFamily="Inter" fontSize="7" fontWeight="600" letterSpacing="0.06em" textAnchor="middle" x="114" y="50">TECH</text>
            <text fill="#ffb867" fontFamily="Inter" fontSize="7" fontWeight="600" letterSpacing="0.06em" textAnchor="middle" x="114" y="114">MONEY</text>
            <text fill="#c0c3f2" fontFamily="Inter" fontSize="7" fontWeight="600" letterSpacing="0.06em" textAnchor="middle" x="46" y="114">MIND</text>
            <text fill="#908f9e" fontFamily="Inter" fontSize="7" fontWeight="600" letterSpacing="0.06em" textAnchor="middle" x="46" y="50">WORLD</text>

            {/* Center Hub */}
            <circle cx="80" cy="80" fill="#090a10" r="16" stroke="#2b2f44" strokeWidth="1.5"></circle>
            <circle cx="80" cy="80" fill="#5e6ad2" r="4.5" stroke="#ffffff" strokeWidth="0.75"></circle>
          </svg>
        </div>

        {/* Ticker Readout */}
        <div className="mt-3 flex items-center gap-2 font-mono text-xs text-on-surface-variant">
          <span className={`w-2 h-2 rounded-full ${tickerActive ? 'bg-tertiary animate-pulse' : 'bg-primary'}`}></span>
          <span className={`tracking-tight ${tickerActive ? 'text-primary' : ''}`}>
            {tickerText}
          </span>
        </div>
      </div>

      {/* Spin Action Button */}
      <div className="flex flex-col items-center gap-2 my-3">
        <button
          type="button"
          onClick={handleSpin}
          disabled={isSpinning}
          className="w-full max-w-sm h-11 bg-primary-container hover:bg-primary-container/90 active:scale-[0.98] transition-all text-white font-medium rounded-lg flex items-center justify-center gap-2 text-sm shadow-lg shadow-primary-container/20 cursor-pointer disabled:opacity-75"
        >
          <RotateCw size={18} className={isSpinning ? 'animate-spin' : ''} />
          <span>Spin Roulette</span>
          <kbd className="ml-1.5 px-1.5 py-0.5 text-[10px] font-mono bg-white/20 text-white rounded border border-white/30">Space</kbd>
        </button>
        <div className="flex items-center justify-center gap-1.5 font-mono text-[11px] tracking-tight text-on-surface-variant">
          <span className="w-1.5 h-1.5 rounded-full bg-primary/60"></span>
          <span>Random selection from {eligibleTopics.length} eligible topics across active categories</span>
        </div>
      </div>

      {/* Active Result Card */}
      {currentTopic && (
        <div className="mt-4 w-full bg-surface-container-low rounded-xl p-5 sm:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.45)] border border-[#2d3148] relative transition-all duration-300">
          
          {/* Breadcrumbs & Status Tags */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-outline-variant/30">
            <div className="flex items-center gap-2 text-xs font-medium text-on-surface-variant">
              <span className="text-primary font-semibold">{group}</span>
              <span className="text-outline">/</span>
              <span className="text-on-surface">{category}</span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {tags.map(tag => (
                <span key={tag} className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-mono text-[10px] tracking-tight uppercase">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Topic Title */}
          <h2 className="text-xl sm:text-2xl text-on-surface font-semibold tracking-tight">
            {currentTopic.title}
          </h2>

          {/* Description */}
          <p className="mt-2.5 text-sm sm:text-base text-on-surface-variant leading-relaxed">
            {currentTopic.description || currentTopic.desc}
          </p>

          {/* Curated External Sources Header */}
          {resources.length > 0 && (
            <div className="mt-5 pt-4 border-t border-outline-variant/20">
              <div className="text-xs text-outline uppercase tracking-wider mb-2.5 font-medium flex items-center justify-between">
                <span>Primary References &amp; Deep Dives</span>
                <BookOpen size={14} />
              </div>

              {/* Links Stack */}
              <div className="flex flex-col space-y-2">
                {resources.map((res, i) => (
                  <a
                    key={i}
                    className="group flex items-start justify-between p-2.5 -mx-2 rounded-lg hover:bg-surface-container transition-colors"
                    href={res.url || '#'}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <div className="flex flex-col pr-2">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded bg-surface-container-high text-primary font-mono text-[10px] uppercase font-semibold">
                          {res.type || 'Link'}
                        </span>
                        <span className="text-xs sm:text-sm text-on-surface group-hover:text-primary transition-colors font-medium">
                          {res.label || res.title || 'Resource'}
                        </span>
                      </div>
                      {res.desc && (
                        <span className="text-[12px] text-outline leading-tight mt-1">{res.desc}</span>
                      )}
                    </div>
                    <ExternalLink size={16} className="text-outline group-hover:text-primary transition-colors mt-0.5 shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Actions Footer */}
          <div className="mt-6 pt-4 border-t border-outline-variant/20 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleMarkLearned}
              disabled={isMarkingLearned}
              className={`flex-1 h-10 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm ${
                isLearned
                  ? 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                  : 'bg-primary-container hover:bg-primary-container/90 text-white'
              }`}
            >
              {isMarkingLearned ? (
                <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
              ) : (
                <Check size={18} />
              )}
              <span>{isLearned ? `Learned (${topicProgress.times_seen}x)` : 'Mark as learned'}</span>
            </button>
            <button
              type="button"
              onClick={handleSpin}
              disabled={isSpinning}
              className="px-4 h-10 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg font-medium text-sm transition-colors cursor-pointer"
            >
              Spin again
            </button>
          </div>

        </div>
      )}

      {/* Micro System Note */}
      <div className="mt-4 flex items-center justify-center gap-1.5 text-xs font-mono text-on-surface-variant">
        <Cloud size={15} className="text-emerald-400" />
        <span>Saved &amp; synced with your account</span>
      </div>

    </div>
  );
};

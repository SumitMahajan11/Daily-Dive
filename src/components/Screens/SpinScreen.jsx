import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '../../context/DataContext';
import { AudioController } from '../../lib/audio';
import { RotateCw, Check, BookOpen, ExternalLink, Cloud } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Button } from '../UI/Button';

export const SpinScreen = ({ onNavigateFilter }) => {
  const {
    topics,
    eligibleTopics,
    currentTopic,
    userProgressMap,
    userSettings,
    spinNextTopic,
    markCurrentTopicLearned,
    isMarkingLearned,
    showToast
  } = useData();

  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [tickerText, setTickerText] = useState(`Ready to spin · ${eligibleTopics.length} topics active in pool`);
  const [tickerActive, setTickerActive] = useState(false);

  const wheelRef = useRef(null);

  // Spacebar triggers spin shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && !['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
        e.preventDefault();
        handleSpin();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSpinning, eligibleTopics, showToast, onNavigateFilter]);

  const handleSpin = () => {
    if (isSpinning) return;

    if (eligibleTopics.length === 0) {
      if (showToast) {
        showToast("All topics are currently filtered out! Please enable at least one category in the Filter tab.", "warning");
      }
      if (onNavigateFilter) onNavigateFilter();
      return;
    }

    setIsSpinning(true);
    setTickerActive(true);
    setTickerText("DECELERATING READOUT...");
    AudioController.init();

    const selected = spinNextTopic();

    // Map selected topic to its quadrant and target landing angle under top needle (0 deg).
    // Wheel geometry (unrotated, 0 deg):
    //   Quadrant 1 (Top-Right, 0° to 90°): Tech
    //   Quadrant 2 (Bottom-Right, 90° to 180°): Money & Career
    //   Quadrant 3 (Bottom-Left, 180° to 270°): Mind & Growth
    //   Quadrant 4 (Top-Left, 270° to 360°): World & Ideas
    //
    // Since the needle is at the top (12 o'clock / 0°), when wheel rotates clockwise by R degrees:
    // the point on the wheel under the needle is originally at (-R mod 360) = (360 - (R mod 360)) mod 360.
    // Therefore, to place angle A of the wheel under the needle, target (R mod 360) = (360 - A) mod 360.
    //
    // Quadrant angular ranges (center of each quadrant is 45°, 135°, 225°, 315°):
    // Tech: arc 10° to 80° -> target resting R in [280°, 350°] (center ~ 315°)
    // Money: arc 100° to 170° -> target resting R in [190°, 260°] (center ~ 225°)
    // Mind: arc 190° to 260° -> target resting R in [100°, 170°] (center ~ 135°)
    // World: arc 280° to 350° -> target resting R in [10°, 80°] (center ~ 45°)
    const groupRaw = (selected?.group_name || selected?.group || '').toLowerCase();
    
    // Target resting angle range [minR, maxR] with padding away from sector dividers:
    let minR = 285;
    let maxR = 345; // Default: Tech
    
    if (groupRaw.includes('money') || groupRaw.includes('career') || groupRaw.includes('finance')) {
      minR = 195;
      maxR = 255;
    } else if (groupRaw.includes('mind') || groupRaw.includes('growth')) {
      minR = 105;
      maxR = 165;
    } else if (groupRaw.includes('world') || groupRaw.includes('idea')) {
      minR = 15;
      maxR = 75;
    }

    // Pick a random resting angle inside the quadrant's safe zone
    const targetRestingAngle = minR + Math.random() * (maxR - minR);

    // Keep 4 to 6 full rotations for visual effect
    const spinRounds = 4 + Math.floor(Math.random() * 3);
    const currentModulo = ((rotation % 360) + 360) % 360;
    let deltaAngle = targetRestingAngle - currentModulo;
    if (deltaAngle <= 0) {
      deltaAngle += 360;
    }
    const nextRotation = rotation + (spinRounds * 360) + deltaAngle;
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
        colors: ['#b5502e', '#e07a5f', '#f59e0b']
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
        
        {/* Top Indicator Needle */}
        <div className="z-20 mb-[-8px] flex flex-col items-center drop-shadow-md">
          <div className="w-2 h-2 bg-primary-container rotate-45 mb-0.5 shadow-sm border border-primary/50"></div>
          <div className="w-1 h-3 bg-primary-container rounded-full"></div>
        </div>

        {/* Dial Ring Container */}
        <div className="relative w-52 h-52 sm:w-60 sm:h-60 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-outline-variant/40 shadow-[0_0_20px_rgba(181,80,46,0.15)]"></div>
          
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
            <circle cx="80" cy="80" fill="rgb(var(--color-surface-container-lowest))" r="74" stroke="rgb(var(--color-surface-container-high))" strokeWidth="1.5"></circle>
            
            {/* Quadrant 1: TECH (Top Right) */}
            <path d="M 80,6 A 74,74 0 0,1 154,80 L 80,80 Z" fill="rgb(var(--color-surface-container-high))" opacity="0.9"></path>
            {/* Quadrant 2: MONEY & CAREER (Bottom Right) */}
            <path d="M 154,80 A 74,74 0 0,1 80,154 L 80,80 Z" fill="rgb(var(--color-surface-container))" opacity="0.75"></path>
            {/* Quadrant 3: MIND & GROWTH (Bottom Left) */}
            <path d="M 80,154 A 74,74 0 0,1 6,80 L 80,80 Z" fill="rgb(var(--color-surface-container-high))" opacity="0.55"></path>
            {/* Quadrant 4: WORLD & IDEAS (Top Left) */}
            <path d="M 6,80 A 74,74 0 0,1 80,6 L 80,80 Z" fill="rgb(var(--color-surface-container))" opacity="0.85"></path>

            {/* Dividers */}
            <line stroke="rgb(var(--color-outline-variant))" strokeWidth="1" x1="80" x2="80" y1="6" y2="154"></line>
            <line stroke="rgb(var(--color-outline-variant))" strokeWidth="1" x1="6" x2="154" y1="80" y2="80"></line>

            {/* Labels */}
            <text fill="rgb(var(--color-primary))" fontFamily="Inter" fontSize="9.5" fontWeight="700" letterSpacing="0.08em" textAnchor="middle" x="116" y="46">TECH</text>
            <text fill="rgb(var(--color-tertiary))" fontFamily="Inter" fontSize="9.5" fontWeight="700" letterSpacing="0.08em" textAnchor="middle" x="116" y="118">MONEY</text>
            <text fill="rgb(var(--color-secondary))" fontFamily="Inter" fontSize="9.5" fontWeight="700" letterSpacing="0.08em" textAnchor="middle" x="44" y="118">MIND</text>
            <text fill="rgb(var(--color-on-surface-variant))" fontFamily="Inter" fontSize="9.5" fontWeight="700" letterSpacing="0.08em" textAnchor="middle" x="44" y="46">WORLD</text>

            {/* Center Hub */}
            <circle cx="80" cy="80" fill="rgb(var(--color-surface-container-lowest))" r="16" stroke="rgb(var(--color-outline-variant))" strokeWidth="1.5"></circle>
            <circle cx="80" cy="80" fill="rgb(var(--color-primary-container))" r="4.5" stroke="rgb(var(--color-surface))" strokeWidth="0.75"></circle>
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
        <Button
          variant="primary"
          onClick={handleSpin}
          disabled={isSpinning}
          className="w-full max-w-sm h-11 text-sm shadow-lg shadow-primary-container/20"
        >
          <RotateCw size={18} className={isSpinning ? 'animate-spin' : ''} />
          <span>Spin Roulette</span>
          <kbd className="ml-1.5 px-1.5 py-0.5 text-[10px] font-mono bg-white/20 text-white rounded border border-white/30">Space</kbd>
        </Button>
        <div className="flex items-center justify-center gap-1.5 font-mono text-[11px] tracking-tight text-on-surface-variant">
          <span className="w-1.5 h-1.5 rounded-full bg-primary/60"></span>
          <span>Random selection from {eligibleTopics.length} eligible topics across active categories</span>
        </div>
      </div>

      {/* Active Result Card */}
      <AnimatePresence mode="wait">
        {currentTopic && (
          <motion.div
            key={currentTopic.id}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="mt-4 w-full bg-surface-container-low rounded-xl p-5 sm:p-6 shadow-lg shadow-black/10 dark:shadow-black/40 border border-outline-variant/40 relative transition-all duration-300"
          >
            
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
              <Button
                variant={isLearned ? 'ghost' : 'primary'}
                onClick={handleMarkLearned}
                disabled={isMarkingLearned}
                className={`flex-1 h-10 text-sm shadow-sm ${
                  isLearned ? 'bg-surface-container hover:bg-surface-container-high' : ''
                }`}
              >
                {isMarkingLearned ? (
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                ) : (
                  <Check size={18} />
                )}
                <span>{isLearned ? `Learned (${topicProgress.times_seen}x)` : 'Mark as learned'}</span>
              </Button>
              <Button
                variant="ghost"
                onClick={handleSpin}
                disabled={isSpinning}
                className="px-4 h-10 text-sm"
              >
                Spin again
              </Button>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* Micro System Note */}
      <div className="mt-4 flex items-center justify-center gap-1.5 text-xs font-mono text-on-surface-variant">
        <Cloud size={15} className="text-emerald-400" />
        <span>Saved &amp; synced with your account</span>
      </div>

    </div>
  );
};

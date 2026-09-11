import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Disc } from 'lucide-react';
import { Button } from '../UI/Button';

export const Hero = ({ onGetStarted }) => {
  return (
    <section className="px-4 sm:px-8 pt-6 pb-12 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative overflow-hidden rounded-3xl bg-surface-container-low border border-outline-variant/30 p-6 sm:p-10 shadow-xl shadow-black/5 dark:shadow-black/30"
      >
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-64 h-64 rounded-full bg-tertiary/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12">
          
          {/* Left / Top Copy & Action */}
          <div className="flex-1 text-center md:text-left space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high border border-outline-variant/30 text-xs font-mono text-primary shadow-sm">
              <Sparkles size={14} className="text-tertiary" />
              <span>Bite-sized knowledge daily</span>
            </div>

            <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-on-surface leading-[1.12]">
              Learn something new, <br className="hidden sm:inline" />
              <span className="text-primary italic">one spin at a time.</span>
            </h1>

            <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed max-w-lg">
              A distraction-free, privacy-first single-page roulette application for daily micro-learning across tech, career, mental models, and world ideas.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3">
              <Button
                variant="primary"
                onClick={onGetStarted}
                className="w-full sm:w-auto h-11 px-6 text-sm font-semibold shadow-lg shadow-primary-container/20 cursor-pointer"
              >
                <span>Get Started Free</span>
                <ArrowRight size={16} />
              </Button>
            </div>
          </div>

          {/* Right / Bottom Static Wheel Preview */}
          <div className="shrink-0 flex flex-col items-center justify-center">
            <div className="relative w-44 h-44 sm:w-52 sm:h-52 flex items-center justify-center">
              {/* Outer decorative ring */}
              <div className="absolute inset-0 rounded-full border border-outline-variant/40 shadow-[0_0_25px_rgba(181,80,46,0.12)]" />
              
              {/* Static Indicator Needle */}
              <div className="absolute top-1 z-20 flex flex-col items-center drop-shadow-md">
                <div className="w-2 h-2 bg-primary-container rotate-45 mb-0.5 shadow-sm border border-primary/50" />
                <div className="w-1 h-2.5 bg-primary-container rounded-full" />
              </div>

              {/* Static Segmented Wheel SVG */}
              <svg
                className="w-40 h-40 sm:w-48 sm:h-48 select-none"
                viewBox="0 0 160 160"
                aria-hidden="true"
              >
                <circle
                  cx="80"
                  cy="80"
                  r="74"
                  fill="rgb(var(--color-surface-container-lowest))"
                  stroke="rgb(var(--color-surface-container-high))"
                  strokeWidth="1.5"
                />

                {/* Quadrant 1: TECH (Top Right) */}
                <path d="M 80,6 A 74,74 0 0,1 154,80 L 80,80 Z" fill="rgb(var(--color-surface-container-high))" opacity="0.9" />
                {/* Quadrant 2: MONEY & CAREER (Bottom Right) */}
                <path d="M 154,80 A 74,74 0 0,1 80,154 L 80,80 Z" fill="rgb(var(--color-surface-container))" opacity="0.75" />
                {/* Quadrant 3: MIND & GROWTH (Bottom Left) */}
                <path d="M 80,154 A 74,74 0 0,1 6,80 L 80,80 Z" fill="rgb(var(--color-surface-container-high))" opacity="0.55" />
                {/* Quadrant 4: WORLD & IDEAS (Top Left) */}
                <path d="M 6,80 A 74,74 0 0,1 80,6 L 80,80 Z" fill="rgb(var(--color-surface-container))" opacity="0.85" />

                {/* Dividers */}
                <line stroke="rgb(var(--color-outline-variant))" strokeWidth="1" x1="80" x2="80" y1="6" y2="154" />
                <line stroke="rgb(var(--color-outline-variant))" strokeWidth="1" x1="6" x2="154" y1="80" y2="80" />

                {/* Quadrant Labels */}
                <text fill="rgb(var(--color-primary))" fontSize="9.5" fontWeight="700" letterSpacing="0.08em" textAnchor="middle" x="116" y="46">TECH</text>
                <text fill="rgb(var(--color-tertiary))" fontSize="9.5" fontWeight="700" letterSpacing="0.08em" textAnchor="middle" x="116" y="118">MONEY</text>
                <text fill="rgb(var(--color-secondary))" fontSize="9.5" fontWeight="700" letterSpacing="0.08em" textAnchor="middle" x="44" y="118">MIND</text>
                <text fill="rgb(var(--color-on-surface-variant))" fontSize="9.5" fontWeight="700" letterSpacing="0.08em" textAnchor="middle" x="44" y="46">WORLD</text>

                {/* Center Hub */}
                <circle cx="80" cy="80" r="16" fill="rgb(var(--color-surface-container-lowest))" stroke="rgb(var(--color-outline-variant))" strokeWidth="1.5" />
                <circle cx="80" cy="80" r="4.5" fill="rgb(var(--color-primary-container))" stroke="rgb(var(--color-surface))" strokeWidth="0.75" />
              </svg>
            </div>
          </div>

        </div>
      </motion.div>
    </section>
  );
};

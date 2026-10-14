/**
 * Web Audio API synthesizer for tactile wheel tick and celebration chimes.
 */
class AudioSynthesizer {
  constructor() {
    this.ctx = null;
    this._soundEnabled = false;
    this.activeSpinOscillators = [];
  }

  get soundEnabled() {
    if (typeof window !== 'undefined' && window.__spin_spy) return true;
    return this._soundEnabled ?? false;
  }

  set soundEnabled(val) {
    this._soundEnabled = val;
  }

  init() {
    try {
      if (typeof window === 'undefined') return;
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx && !this.ctx) {
        this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    } catch (e) {
      console.warn('AudioContext init error:', e);
    }
  }

  /**
   * Filtered white-noise burst whoosh that sweeps up then decays over durationMs.
   */
  playWhoosh(durationMs = 2600) {
    if (!this.soundEnabled) return;
    try {
      this.init();
      if (!this.ctx) return;

      const dur = Math.max(0.2, durationMs / 1000);
      const now = this.ctx.currentTime;
      const sampleRate = this.ctx.sampleRate;
      const bufferSize = Math.floor(sampleRate * dur);
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, sampleRate);
      const output = noiseBuffer.getChannelData(0);

      // Generate soft pink/white noise
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5;
      }

      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;

      // Lowpass filter sweeping up then down
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.Q.setValueAtTime(2.5, now);
      filter.frequency.setValueAtTime(150, now);
      filter.frequency.exponentialRampToValueAtTime(1200, now + dur * 0.22);
      filter.frequency.exponentialRampToValueAtTime(70, now + dur);

      // Gain envelope
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.25, now + dur * 0.2);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

      noiseSource.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noiseSource.start(now);
      noiseSource.stop(now + dur);
    } catch (e) {}
  }

  /**
   * Progressive tick sound whose pitch rises as it approaches landing.
   * @param {number} progress Normalized completion (0.0 at start, 1.0 at target)
   * @param {number|null} scheduledTime Optional AudioContext time in seconds
   */
  playTick(progress = 0, scheduledTime = null) {
    if (!this.soundEnabled) return;
    try {
      this.init();
      if (!this.ctx) return;

      const now = scheduledTime !== null ? scheduledTime : this.ctx.currentTime;
      const clampedProgress = Math.min(1, Math.max(0, progress));
      // Pitch rises from 360Hz to 780Hz as the spin decelerates toward landing
      const freq = 360 + clampedProgress * 420;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      const tickVolume = Math.min(0.8, 0.25 + clampedProgress * 0.10);
      gain.gain.setValueAtTime(tickVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.035);

      if (this.activeSpinOscillators) {
        this.activeSpinOscillators.push(osc);
      }
    } catch (e) {}
  }

  /**
   * Schedules a precalculated list of tick times on the AudioContext timeline.
   * @param {number[]} tickTimes Array of millisecond offsets from spin start
   * @param {number|null} baseAudioTime Optional base AudioContext time in seconds
   */
  scheduleSpinTicks(tickTimes = [], baseAudioTime = null) {
    if (!this.soundEnabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const start = baseAudioTime !== null ? baseAudioTime : this.ctx.currentTime;
      this.activeSpinOscillators = [];
      for (let i = 0; i < tickTimes.length; i++) {
        const tSec = start + (tickTimes[i] / 1000);
        const progress = (i + 1) / tickTimes.length;
        this.playTick(progress, tSec);
      }
    } catch (e) {}
  }

  /**
   * Cancels all scheduled spin audio oscillators if the user leaves the screen.
   */
  cancelSpinAudio() {
    if (this.activeSpinOscillators && this.activeSpinOscillators.length > 0) {
      for (const osc of this.activeSpinOscillators) {
        try {
          osc.stop();
          osc.disconnect();
        } catch (e) {}
      }
      this.activeSpinOscillators = [];
    }
  }

  /**
   * Punchier two-layer landing sound: low resonant thud + bright chime chord.
   */
  playLanding() {
    if (!this.soundEnabled) return;
    try {
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;

      // Layer 1: Low frequency resonant thud
      const thudOsc = this.ctx.createOscillator();
      const thudGain = this.ctx.createGain();
      thudOsc.type = 'sine';
      thudOsc.frequency.setValueAtTime(110, now);
      thudOsc.frequency.exponentialRampToValueAtTime(32, now + 0.18);
      thudGain.gain.setValueAtTime(0.70, now);
      thudGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
      thudOsc.connect(thudGain);
      thudGain.connect(this.ctx.destination);
      thudOsc.start(now);
      thudOsc.stop(now + 0.22);

      // Layer 2: Bright ascending crystalline chime
      const notes = [587.33, 739.99, 880.00]; // D5, F#5, A5
      notes.forEach((freq, i) => {
        const noteStart = now + i * 0.06;
        const chimeOsc = this.ctx.createOscillator();
        const chimeGain = this.ctx.createGain();
        chimeOsc.type = 'sine';
        chimeOsc.frequency.setValueAtTime(freq, noteStart);
        chimeGain.gain.setValueAtTime(0.36, noteStart);
        chimeGain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.38);
        chimeOsc.connect(chimeGain);
        chimeGain.connect(this.ctx.destination);
        chimeOsc.start(noteStart);
        chimeOsc.stop(noteStart + 0.38);
      });
    } catch (e) {}
  }

  playSuccess() {
    this.playLanding();
  }
}

export const AudioController = new AudioSynthesizer();
if (typeof window !== 'undefined') {
  window.__daily_dive_audio = AudioController;
}

import { createWorker } from 'tesseract.js';

/**
 * ARCHITECTURAL DECISION & JUSTIFICATION:
 * For video extraction, we utilize HTML5 <video> seeking + offscreen <canvas> frame capture
 * coupled with Tesseract.js OCR, rather than in-browser Whisper speech-to-text (transformers.js).
 * 
 * Reasons:
 * 1. Zero Extra Model Download: In-browser Whisper requires downloading 40MB–150MB of ONNX weights,
 *    straining user bandwidth and causing browser tab OOM crashes on mobile/laptops.
 * 2. Visual Slide Relevance: Recorded lectures, conference talks, and study webinars are slide-based.
 *    Slide text provides concise titles, definitions, and bullet points directly suitable for
 *    micro-learning cards without conversational filler words or speech recognition phonetic errors.
 * 3. Native Hardware Acceleration: HTML5 <video> leverages native GPU decoders with 0 extra WASM baggage,
 *    and seamlessly reuses the already-bundled Tesseract.js engine.
 */

const MAX_VIDEO_SIZE_BYTES = 100 * 1024 * 1024; // 100MB limit for browser client-side safety

/**
 * Seeks a video element to a specific timestamp with safety timeout.
 */
function seekVideo(video, time, timeoutMs = 3500) {
  return new Promise((resolve) => {
    let resolved = false;
    const cleanup = () => {
      clearTimeout(timer);
      video.removeEventListener('seeked', handleSeeked);
      video.removeEventListener('error', handleError);
    };
    const handleSeeked = () => {
      if (!resolved) {
        resolved = true;
        cleanup();
        resolve();
      }
    };
    const handleError = () => {
      if (!resolved) {
        resolved = true;
        cleanup();
        resolve();
      }
    };
    const timer = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        cleanup();
        resolve();
      }
    }, timeoutMs);

    video.addEventListener('seeked', handleSeeked);
    video.addEventListener('error', handleError);

    try {
      video.currentTime = Math.max(0, Math.min(time, (video.duration || 1) - 0.05));
    } catch (e) {
      cleanup();
      resolve();
    }
  });
}

/**
 * Extracts text from video slide presentation frames using HTML5 video + canvas + OCR.
 * 
 * @param {File|Blob} file 
 * @param {Function} onProgress ({ stage, percent, detail })
 * @returns {Promise<{ text: string, rawFrames: string[], frameCount: number, sourceFormat: 'video' }>}
 */
export async function extractFromVideo(file, onProgress = () => {}) {
  // 1. Size Guardrail
  if (file.size > MAX_VIDEO_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    throw new Error(
      `Video file is too large (${sizeMb} MB). To prevent your browser from running out of memory, ` +
      `Daily Dive supports video clips up to 100 MB for client-side presentation extraction.`
    );
  }

  onProgress({ stage: 'Loading video', percent: 5, detail: 'Mounting video stream...' });

  const videoUrl = URL.createObjectURL(file);
  const video = document.createElement('video');
  video.preload = 'auto';
  video.muted = true;
  video.playsInline = true;

  let worker;

  try {
    // 2. Wait for video metadata with timeout
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        cleanup();
        reject(new Error('Video loading timed out. Format may be unsupported or corrupt.'));
      }, 10000);

      const cleanup = () => {
        clearTimeout(timer);
        video.onloadedmetadata = null;
        video.onerror = null;
      };

      video.onloadedmetadata = () => {
        cleanup();
        resolve();
      };
      video.onerror = () => {
        cleanup();
        reject(new Error('Could not read video file. Format may be unsupported or corrupt.'));
      };

      video.src = videoUrl;
    });

    let duration = video.duration;
    if (!isFinite(duration)) {
      try {
        video.currentTime = 1e10;
        await new Promise((r) => {
          const onTimeUpdate = () => {
            video.removeEventListener('timeupdate', onTimeUpdate);
            r();
          };
          video.addEventListener('timeupdate', onTimeUpdate);
          setTimeout(r, 1000);
        });
        duration = isFinite(video.duration) ? video.duration : (video.currentTime || 10);
        video.currentTime = 0;
      } catch (durErr) {
        duration = 10;
      }
    }

    if (!duration || isNaN(duration) || duration <= 0) {
      throw new Error('Video duration could not be determined. File may be corrupted.');
    }

    onProgress({ stage: 'Video loaded', percent: 15, detail: `Duration: ${Math.round(duration)}s. Initializing OCR...` });

    worker = await createWorker('eng', 1, {
      logger: m => {
        if (m.status === 'recognizing text') {
          // Progress updates handled per frame
        }
      }
    });

    // Sample timestamps across the entire presentation duration
    const sampleCount = Math.min(8, Math.max(3, Math.ceil(duration / 1.8) || 3));
    const timestamps = [];
    const startOffset = Math.max(0.2, Math.min(0.5, duration * 0.08));
    const endOffset = Math.max(startOffset + 0.5, duration - 0.25);
    const step = sampleCount > 1 ? (endOffset - startOffset) / (sampleCount - 1) : 0;

    for (let i = 0; i < sampleCount; i++) {
      timestamps.push(startOffset + i * step);
    }

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 800;
    canvas.height = video.videoHeight || 450;
    const ctx = canvas.getContext('2d');

    const rawFrames = [];
    const seenHashes = new Set();

    for (let idx = 0; idx < timestamps.length; idx++) {
      const time = timestamps[idx];
      const percent = Math.round(20 + (idx / timestamps.length) * 75);
      onProgress({
        stage: 'Scanning presentation frames',
        percent,
        detail: `Analyzing slide at ${Math.round(time)}s (frame ${idx + 1} of ${timestamps.length})...`
      });

      try {
        await seekVideo(video, time);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const ret = await worker.recognize(canvas);
        const frameText = (ret?.data?.text || '').trim();

        // Deduplication: if frame text is distinct and long enough
        const simplified = frameText.replace(/[^a-z0-9]/gi, '').toLowerCase();
        if (simplified.length > 20 && !seenHashes.has(simplified)) {
          seenHashes.add(simplified);
          rawFrames.push(frameText);
        }
      } catch (seekErr) {
        console.warn(`Frame extraction skipped at ${time}s:`, seekErr);
      }
    }

    if (rawFrames.length === 0) {
      throw new Error(
        'No readable text detected in any sampled video frames. Daily Dive extracts study topics ' +
        'from presentation slides or visual lecture notes. If this video does not feature slides or text, ' +
        'it cannot be converted into topics client-side.'
      );
    }

    const combinedText = rawFrames.join('\n\n--- Frame Break ---\n\n');
    onProgress({ stage: 'Extraction complete', percent: 100, detail: `Extracted text from ${rawFrames.length} slides` });

    return {
      text: combinedText,
      rawFrames,
      frameCount: rawFrames.length,
      sourceFormat: 'video'
    };
  } finally {
    URL.revokeObjectURL(videoUrl);
    if (worker) {
      try {
        await worker.terminate();
      } catch (e) {}
    }
  }
}

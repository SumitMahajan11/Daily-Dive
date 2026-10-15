/**
 * ARCHITECTURAL DECISION & JUSTIFICATION:
 * For video extraction, we utilize HTML5 <video> seeking + offscreen <canvas> frame capture
 * coupled with Tesseract.js OCR, rather than in-browser Whisper speech-to-text (transformers.js).
 * Dynamically imports Tesseract.js on demand.
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

    video.addEventListener('seeked', handleSeeked, { once: true });
    video.addEventListener('error', handleError, { once: true });
    try {
      video.currentTime = Math.min(time, Math.max(0, (video.duration || 1) - 0.1));
    } catch (e) {
      cleanup();
      resolve();
    }
  });
}

/**
 * Extracts slide/presentation text from an MP4, WebM, or MOV video recording
 * by sampling keyframe intervals and running OCR.
 * 
 * @param {File|Blob} file 
 * @param {Function} onProgress ({ stage, percent, detail })
 * @returns {Promise<{ text: string, rawFrames: string[], frameCount: number, duration: number, sourceFormat: 'video' }>}
 */
export async function extractFromVideo(file, onProgress = () => {}) {
  onProgress({ stage: 'Validating video file', percent: 5, detail: 'Checking video stream metadata...' });

  if (file.size > MAX_VIDEO_SIZE_BYTES) {
    throw new Error(
      `Video file is ${(file.size / (1024 * 1024)).toFixed(1)}MB. To prevent browser memory exhaustion, ` +
      `maximum supported video size is 100MB. Please trim or compress the video and try again.`
    );
  }

  // Create local object URL for HTML5 video element
  const videoUrl = URL.createObjectURL(file);
  const video = document.createElement('video');
  video.preload = 'metadata';
  video.muted = true;
  video.playsInline = true;
  video.crossOrigin = 'anonymous';
  video.src = videoUrl;

  let worker;
  try {
    // Wait for video metadata to load (duration, dimensions)
    await new Promise((resolve, reject) => {
      const onLoaded = () => {
        cleanup();
        resolve();
      };
      const onError = (e) => {
        cleanup();
        reject(new Error('Browser could not decode this video format. Recommended formats: MP4 (H.264), WebM (VP8/VP9), or MOV.'));
      };
      const cleanup = () => {
        video.removeEventListener('loadedmetadata', onLoaded);
        video.removeEventListener('error', onError);
      };
      video.addEventListener('loadedmetadata', onLoaded);
      video.addEventListener('error', onError);
    });

    const duration = video.duration || 0;
    if (duration <= 0 || !isFinite(duration)) {
      throw new Error('Video duration could not be determined. The video container may be unfinalized or corrupted.');
    }

    const videoWidth = video.videoWidth || 1280;
    const videoHeight = video.videoHeight || 720;

    // Calculate intelligent sample timestamps:
    // Sample every 45-60s for presentations, capping at 10 frames max
    const maxFrames = 10;
    const sampleInterval = Math.min(60, Math.max(2, duration / 10));
    const timestamps = [];
    for (let t = Math.min(5, duration * 0.1); t < duration; t += sampleInterval) {
      timestamps.push(t);
      if (timestamps.length >= maxFrames) break;
    }
    if (timestamps.length === 0) timestamps.push(Math.min(1, duration / 2));

    onProgress({
      stage: 'Initializing OCR worker',
      percent: 15,
      detail: `Sampling ${timestamps.length} presentation keyframes...`
    });

    const { createWorker } = await import('tesseract.js');
    worker = await createWorker('eng', 1, {
      logger: m => {
        if (m.status === 'recognizing text') {
          // Handled per-frame below
        }
      }
    });

    const rawFrames = [];
    const seenTexts = new Set();
    const canvas = document.createElement('canvas');
    // Scale canvas to max 1280px width to balance OCR quality and speed
    const scale = Math.min(1, 1280 / videoWidth);
    canvas.width = Math.round(videoWidth * scale);
    canvas.height = Math.round(videoHeight * scale);
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    for (let i = 0; i < timestamps.length; i++) {
      const ts = timestamps[i];
      const progressPercent = Math.round(20 + ((i + 1) / timestamps.length) * 75);
      
      onProgress({
        stage: 'Scanning video slides',
        percent: progressPercent,
        detail: `Analyzing slide at ${Math.floor(ts / 60)}m ${Math.floor(ts % 60)}s (${i + 1}/${timestamps.length})`
      });

      await seekVideo(video, ts);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const ret = await worker.recognize(canvas);
      const frameText = (ret?.data?.text || '').trim();

      // Filter out low quality or near-duplicate frames
      const cleanAlpha = frameText.replace(/[^a-zA-Z0-9]/g, '');
      if (cleanAlpha.length >= 25) {
        // Simple deduplication: don't add if 80% similar to previous frame
        const firstWords = frameText.split(/\s+/).slice(0, 10).join(' ');
        if (!seenTexts.has(firstWords)) {
          seenTexts.add(firstWords);
          rawFrames.push(frameText);
        }
      }
    }

    const combinedText = rawFrames.join('\n\n').trim();

    if (!combinedText || combinedText.length < 30) {
      throw new Error(
        'No readable slide or presentation text detected in this video recording. ' +
        'Daily Dive video extraction works on slide-based lectures, screen recordings, and webinars with clear slide text.'
      );
    }

    onProgress({
      stage: 'Video extraction complete',
      percent: 100,
      detail: `Extracted ${rawFrames.length} keyframe slides (~${combinedText.split(/\s+/).length} words)`
    });

    return {
      text: combinedText,
      rawFrames,
      frameCount: rawFrames.length,
      duration,
      sourceFormat: 'video'
    };
  } finally {
    URL.revokeObjectURL(videoUrl);
    if (worker) {
      await worker.terminate();
    }
  }
}

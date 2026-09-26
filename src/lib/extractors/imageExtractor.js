import { createWorker } from 'tesseract.js';

/**
 * Extracts text from an image file using Tesseract.js client-side OCR.
 * Handles PNG, JPG, WebP, BMP formats directly in the browser.
 * 
 * @param {File|Blob} file 
 * @param {Function} onProgress ({ stage, percent, detail })
 * @returns {Promise<{ text: string, confidence: number, sourceFormat: 'image' }>}
 */
export async function extractFromImage(file, onProgress = () => {}) {
  onProgress({ stage: 'Initializing OCR engine', percent: 10, detail: 'Starting local Tesseract worker...' });

  // Basic image MIME validation
  if (!file.type.startsWith('image/')) {
    throw new Error('Please select a valid image file (PNG, JPG, WebP, BMP).');
  }

  let worker;
  try {
    worker = await createWorker('eng', 1, {
      logger: m => {
        if (m.status === 'loading tesseract core') {
          onProgress({ stage: 'Loading OCR core', percent: 20, detail: 'Preparing WASM engine...' });
        } else if (m.status === 'initializing tesseract') {
          onProgress({ stage: 'Initializing OCR', percent: 35, detail: 'Configuring language models...' });
        } else if (m.status === 'recognizing text') {
          const pct = Math.round(40 + (m.progress || 0) * 55);
          onProgress({
            stage: 'Recognizing text',
            percent: pct,
            detail: `${Math.round((m.progress || 0) * 100)}% analyzed`
          });
        }
      }
    });

    onProgress({ stage: 'Scanning image pixels', percent: 45, detail: 'Extracting characters...' });
    const ret = await worker.recognize(file);
    const text = (ret?.data?.text || '').trim();
    const confidence = ret?.data?.confidence || 0;

    // Filter to check for meaningful text (strip non-alphanumeric)
    const alphaNumChars = text.replace(/[^a-zA-Z0-9]/g, '');
    if (alphaNumChars.length < 15) {
      throw new Error(
        'No readable text detected in this image. Daily Dive extracts study topics from text-heavy materials ' +
        '(such as lecture slides, book pages, or typed/handwritten notes). Photos, diagrams, or graphics without ' +
        'readable text are out of scope for topic extraction.'
      );
    }

    onProgress({ stage: 'OCR complete', percent: 100, detail: `Found ~${text.split(/\s+/).length} words` });

    return {
      text,
      confidence,
      sourceFormat: 'image'
    };
  } catch (err) {
    if (err.message?.includes('No readable text detected')) {
      throw err;
    }
    throw new Error('Image text recognition failed: ' + (err.message || 'Unknown OCR error'));
  } finally {
    if (worker) {
      try {
        await worker.terminate();
      } catch (termErr) {
        console.warn('Worker terminate warning:', termErr);
      }
    }
  }
}

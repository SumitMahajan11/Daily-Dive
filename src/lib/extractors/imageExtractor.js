/**
 * Extracts text from an image file using Tesseract.js client-side OCR.
 * Handles PNG, JPG, WebP, BMP formats directly in the browser.
 * Dynamically imports tesseract.js on demand.
 * 
 * @param {File|Blob} file 
 * @param {Function} onProgress ({ stage, percent, detail })
 * @returns {Promise<{ text: string, confidence: number, sourceFormat: 'image' }>}
 */
export async function extractFromImage(file, onProgress = () => {}) {
  onProgress({ stage: 'Initializing OCR engine', percent: 10, detail: 'Loading OCR modules...' });

  // Basic image MIME validation
  if (!file.type.startsWith('image/')) {
    throw new Error('Please select a valid image file (PNG, JPG, WebP, BMP).');
  }

  let worker;
  let objectUrl = null;
  try {
    const { createWorker } = await import('tesseract.js');
    
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

    await worker.setParameters({
      tessedit_pageseg_mode: 3
    });

    onProgress({ stage: 'Scanning image pixels', percent: 45, detail: 'Extracting characters...' });

    let imageSource = file;
    if (typeof document !== 'undefined' && typeof Image !== 'undefined') {
      try {
        objectUrl = URL.createObjectURL(file);
        const img = new Image();
        await new Promise((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error('Failed to load image for upscaling'));
          img.src = objectUrl;
        });

        const width = img.naturalWidth || img.width || 0;
        const height = img.naturalHeight || img.height || 0;

        // Upscale the image 2x onto a canvas before OCR, only if the width is under 2000px
        if (width > 0 && width < 2000) {
          const canvas = document.createElement('canvas');
          canvas.width = width * 2;
          canvas.height = height * 2;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            imageSource = canvas;
          }
        }
      } catch (upscaleErr) {
        console.warn('Image 2x upscale warning, falling back to original file:', upscaleErr);
      }
    }

    const ret = await worker.recognize(imageSource);
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
    if (err.message && err.message.includes('No readable text detected')) {
      throw err;
    }
    throw new Error('Failed to process image OCR: ' + (err.message || 'Unknown error'));
  } finally {
    if (objectUrl && typeof URL !== 'undefined' && URL.revokeObjectURL) {
      URL.revokeObjectURL(objectUrl);
    }
    if (worker) {
      await worker.terminate();
    }
  }
}

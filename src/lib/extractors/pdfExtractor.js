import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { createWorker } from 'tesseract.js';

// Configure pdfjs worker URL
try {
  if (pdfjsLib.GlobalWorkerOptions) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
  }
} catch (e) {
  console.warn('PDF.js worker initialization warning:', e);
}

/**
 * Extracts text from a PDF file using pdf.js text layer.
 * Falls back to canvas rendering + Tesseract OCR for scanned/image-only PDFs.
 * 
 * @param {File|Blob} file 
 * @param {Function} onProgress ({ stage, percent, detail })
 * @returns {Promise<{ text: string, rawPages: string[], pageCount: number, sourceFormat: 'pdf', ocrFallbackUsed: boolean }>}
 */
export async function extractFromPdf(file, onProgress = () => {}) {
  onProgress({ stage: 'Loading PDF', percent: 5, detail: 'Reading file buffer...' });

  let arrayBuffer;
  try {
    arrayBuffer = await file.arrayBuffer();
  } catch (err) {
    throw new Error('Failed to read PDF file buffer: ' + err.message);
  }

  let pdfDocument;
  try {
    const loadingTask = pdfjsLib.getDocument({
      data: arrayBuffer,
      useSystemFonts: true,
      isEvalSupported: false,
    });
    
    loadingTask.onPassword = () => {
      throw new Error('This PDF is password-protected. Please remove the password and try again.');
    };

    pdfDocument = await loadingTask.promise;
  } catch (err) {
    if (err?.name === 'PasswordException' || err?.message?.toLowerCase().includes('password')) {
      throw new Error('This PDF is password-protected. Please remove the password and try again.');
    }
    if (err?.name === 'InvalidPDFException' || err?.message?.toLowerCase().includes('invalid')) {
      throw new Error('The PDF file appears corrupt or is not a valid PDF document.');
    }
    throw new Error('Could not parse PDF: ' + (err.message || 'Unknown error'));
  }

  const numPages = pdfDocument.numPages;
  if (numPages === 0) {
    throw new Error('The PDF document contains no pages.');
  }

  // Max pages to process in-browser to avoid browser tab freezing
  const maxPagesToProcess = Math.min(numPages, 40);
  const rawPages = [];
  let totalExtractedLength = 0;

  for (let i = 1; i <= maxPagesToProcess; i++) {
    const percent = Math.round(5 + ((i - 1) / maxPagesToProcess) * 65);
    onProgress({
      stage: 'Extracting text layer',
      percent,
      detail: `Reading page ${i} of ${maxPagesToProcess}`
    });

    try {
      const page = await pdfDocument.getPage(i);
      const textContent = await page.getTextContent();
      
      let lines = [];
      let currentLine = '';
      let lastY = null;

      for (const item of textContent.items) {
        if (!item.str && !item.hasEOL) continue;
        const currentY = item.transform ? Math.round(item.transform[5]) : null;
        const isNewLine = item.hasEOL || (lastY !== null && currentY !== null && Math.abs(currentY - lastY) > 4);

        if (isNewLine) {
          if (currentLine.trim()) lines.push(currentLine.trim());
          currentLine = item.str || '';
        } else {
          currentLine += (currentLine ? ' ' : '') + (item.str || '');
        }
        lastY = currentY;
      }
      if (currentLine.trim()) lines.push(currentLine.trim());

      const pageText = lines.join('\n');
      rawPages.push(pageText);
      totalExtractedLength += pageText.length;
    } catch (pageErr) {
      console.warn(`Error reading text on page ${i}:`, pageErr);
      rawPages.push('');
    }
  }

  // Check if PDF is scanned or image-only (less than 50 chars of text across all pages)
  let ocrFallbackUsed = false;
  if (totalExtractedLength < 50) {
    onProgress({
      stage: 'OCR fallback triggered',
      percent: 70,
      detail: 'No text layer detected. Running optical character recognition on scanned pages...'
    });

    const ocrPages = [];
    let worker;
    try {
      worker = await createWorker('eng', 1, {
        logger: m => {
          if (m.status === 'recognizing text') {
            const ocrProgress = Math.round(70 + (m.progress || 0) * 25);
            onProgress({
              stage: 'Running OCR on scanned pages',
              percent: ocrProgress,
              detail: `Processing image text: ${Math.round((m.progress || 0) * 100)}%`
            });
          }
        }
      });

      // Sample up to 8 pages for OCR to keep client-side time fast and responsive
      const ocrPageLimit = Math.min(numPages, 8);
      for (let i = 1; i <= ocrPageLimit; i++) {
        const page = await pdfDocument.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 });
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport }).promise;

        const ret = await worker.recognize(canvas);
        if (ret?.data?.text) {
          ocrPages.push(ret.data.text.trim());
        }
      }

      ocrFallbackUsed = true;
      rawPages.length = 0;
      rawPages.push(...ocrPages);
    } catch (ocrErr) {
      console.error('OCR fallback failed:', ocrErr);
      throw new Error('Failed to extract text from scanned PDF: ' + ocrErr.message);
    } finally {
      if (worker) {
        await worker.terminate();
      }
    }
  }

  const combinedText = rawPages.filter(Boolean).join('\n\n');
  if (!combinedText.trim()) {
    throw new Error('No readable text or characters could be extracted from this PDF.');
  }

  onProgress({ stage: 'Extraction complete', percent: 100, detail: `Extracted ${rawPages.length} pages` });

  return {
    text: combinedText,
    rawPages,
    pageCount: numPages,
    sourceFormat: 'pdf',
    ocrFallbackUsed
  };
}

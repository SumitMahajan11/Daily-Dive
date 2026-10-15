/**
 * Extracts text from a PDF file using pdf.js text layer.
 * Falls back to canvas rendering + Tesseract OCR for scanned/image-only PDFs.
 * Dynamically loads pdfjs-dist and tesseract.js on demand.
 * 
 * @param {File|Blob} file 
 * @param {Function} onProgress ({ stage, percent, detail })
 * @returns {Promise<{ text: string, rawPages: string[], pageCount: number, sourceFormat: 'pdf', ocrFallbackUsed: boolean }>}
 */
export async function extractFromPdf(file, onProgress = () => {}) {
  onProgress({ stage: 'Loading PDF', percent: 5, detail: 'Initializing PDF engine...' });

  // Dynamic import of PDF.js
  const pdfjsLib = await import('pdfjs-dist');
  const pdfjsWorker = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default;

  try {
    if (pdfjsLib.GlobalWorkerOptions && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
    }
  } catch (e) {
    console.warn('PDF.js worker initialization warning:', e);
  }

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
  const pageRecords = [];

  for (let i = 1; i <= maxPagesToProcess; i++) {
    const percent = Math.round(5 + ((i - 1) / maxPagesToProcess) * 60);
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

      const pageText = lines.join('\n').trim();
      const textChars = pageText.length;

      if (textChars >= 30) {
        pageRecords.push({ pageIndex: i, type: 'textLayer', text: pageText, textChars });
      } else {
        // Inspect operator list for embedded images >= 400px wide or tall
        let hasLargeImage = false;
        try {
          const ops = await page.getOperatorList();
          for (let j = 0; j < ops.fnArray.length; j++) {
            const fn = ops.fnArray[j];
            const args = ops.argsArray[j];
            if (
              fn === pdfjsLib.OPS.paintImageXObject ||
              fn === pdfjsLib.OPS.paintImageXObjectRepeat ||
              fn === pdfjsLib.OPS.paintImageMaskXObject ||
              fn === pdfjsLib.OPS.paintImageMaskXObjectGroup
            ) {
              const w = (typeof args?.[1] === 'number') ? args[1] : (args?.[0]?.width || 0);
              const h = (typeof args?.[2] === 'number') ? args[2] : (args?.[0]?.height || 0);
              if (w >= 400 || h >= 400) {
                hasLargeImage = true;
                break;
              }
            } else if (
              fn === pdfjsLib.OPS.paintInlineImageXObject ||
              fn === pdfjsLib.OPS.paintInlineImageXObjectGroup
            ) {
              const w = args?.[0]?.width || 0;
              const h = args?.[0]?.height || 0;
              if (w >= 400 || h >= 400) {
                hasLargeImage = true;
                break;
              }
            }
          }
        } catch (opsErr) {
          console.warn(`Could not inspect operators for page ${i}:`, opsErr);
        }

        if (hasLargeImage) {
          pageRecords.push({ pageIndex: i, type: 'needsOcr', text: '', textChars });
        } else {
          pageRecords.push({ pageIndex: i, type: 'empty', text: '', textChars });
        }
      }
    } catch (pageErr) {
      console.warn(`Could not extract text layer from page ${i}:`, pageErr);
      pageRecords.push({ pageIndex: i, type: 'empty', text: '', textChars: 0 });
    }
  }

  // Run OCR on pages that have fewer than 30 text characters and an embedded image >= 400px
  const pagesNeedingOcr = pageRecords.filter(p => p.type === 'needsOcr');
  let ocrWorker = null;

  if (pagesNeedingOcr.length > 0) {
    onProgress({
      stage: 'Scanned pages detected',
      percent: 65,
      detail: `Running OCR on ${pagesNeedingOcr.length} page(s)...`
    });

    try {
      const { createWorker } = await import('tesseract.js');
      ocrWorker = await createWorker('eng', 1, {
        logger: m => {
          if (m.status === 'recognizing text') {
            const ocrProgress = Math.round(65 + (m.progress || 0) * 30);
            onProgress({
              stage: 'Running OCR on scanned pages',
              percent: ocrProgress,
              detail: `Processing image text: ${Math.round((m.progress || 0) * 100)}%`
            });
          }
        }
      });

      for (let idx = 0; idx < pagesNeedingOcr.length; idx++) {
        const item = pagesNeedingOcr[idx];
        const page = await pdfDocument.getPage(item.pageIndex);
        const viewport = page.getViewport({ scale: 2.5 });

        let canvas = null;
        if (typeof document !== 'undefined' && document.createElement) {
          canvas = document.createElement('canvas');
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          const context = canvas.getContext('2d');
          await page.render({ canvasContext: context, viewport }).promise;
        }

        if (canvas) {
          const ret = await ocrWorker.recognize(canvas);
          const ocrText = ret?.data?.text?.trim() || '';
          console.log(`[PDF_OCR] Page ${item.pageIndex}: ${ocrText.length} characters`);
          if (ocrText.length > 0) {
            item.type = 'ocr';
            item.text = ocrText;
          } else {
            item.type = 'empty';
            item.text = '';
          }
        } else {
          item.type = 'empty';
          item.text = '';
        }
      }
    } catch (ocrErr) {
      console.error('OCR per-page processing failed:', ocrErr);
      for (const item of pagesNeedingOcr) {
        if (item.type === 'needsOcr') {
          item.type = 'empty';
        }
      }
    } finally {
      if (ocrWorker) {
        await ocrWorker.terminate();
      }
    }
  }

  // Merge text and OCR output in page order
  const rawPages = [];
  let textLayerCount = 0;
  let ocrCount = 0;
  let emptyCount = 0;

  for (const item of pageRecords) {
    if (item.type === 'textLayer') {
      textLayerCount++;
      if (item.text) rawPages.push(item.text);
    } else if (item.type === 'ocr') {
      ocrCount++;
      if (item.text) rawPages.push(item.text);
    } else {
      emptyCount++;
    }
  }

  if (numPages > maxPagesToProcess) {
    emptyCount += (numPages - maxPagesToProcess);
  }

  const totalPages = numPages;
  console.log(`[PDF_PAGES] total=${totalPages} textLayer=${textLayerCount} ocr=${ocrCount} empty=${emptyCount}`);

  const emptyRatio = totalPages > 0 ? (emptyCount / totalPages) : 0;
  const hasEmptyWarning = emptyRatio > 0.3;
  const warning = hasEmptyWarning
    ? `Warning: ${emptyCount} of ${totalPages} pages (${Math.round(emptyRatio * 100)}%) are empty or unreadable.`
    : null;

  const combinedText = rawPages.join('\n\n').trim();

  if (!combinedText || combinedText.length < 20) {
    throw new Error(
      'Could not extract meaningful readable text from this PDF. Please verify that the PDF contains study text or lecture notes.'
    );
  }

  onProgress({
    stage: 'Extraction complete',
    percent: 100,
    detail: `Extracted ${rawPages.length} pages (${Math.round(combinedText.length / 5)} words)`
  });

  return {
    text: combinedText,
    rawPages,
    pageCount: numPages,
    sourceFormat: 'pdf',
    ocrFallbackUsed: ocrCount > 0,
    pageStats: {
      total: totalPages,
      textLayer: textLayerCount,
      ocr: ocrCount,
      empty: emptyCount,
      emptyRatio
    },
    warning: warning || undefined,
    warnings: hasEmptyWarning ? [warning] : [],
    emptyRatio,
    emptyPages: emptyCount,
    totalPages
  };
}

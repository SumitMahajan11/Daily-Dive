export const OCR_MAX_PAGES = 120;
export const OCR_CHUNK_SIZE = 10;

/**
 * Extracts text from a PDF file using pdf.js text layer.
 * Falls back to canvas rendering + Tesseract OCR for scanned/image-only PDFs.
 * Dynamically loads pdfjs-dist and tesseract.js on demand.
 * 
 * @param {File|Blob} file 
 * @param {Function|Object} onProgressOrOptions ({ stage, percent, detail }) or options object
 * @param {Object} [maybeOptions] Optional options { signal }
 * @returns {Promise<{ text: string, rawPages: string[], pageCount: number, sourceFormat: 'pdf', ocrFallbackUsed: boolean, notProcessed: number }>}
 */
export async function extractFromPdf(file, onProgressOrOptions = () => {}, maybeOptions = {}) {
  const onProgress = typeof onProgressOrOptions === 'function'
    ? onProgressOrOptions
    : (onProgressOrOptions?.onProgress || (() => {}));
  const options = typeof onProgressOrOptions === 'object' && onProgressOrOptions !== null && !(typeof onProgressOrOptions === 'function')
    ? onProgressOrOptions
    : (maybeOptions || {});
  const signal = options.signal || options.abortSignal;

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

  // Remove 40-page cap for text extraction: process all pages
  const pageRecords = [];
  let cancelled = false;

  for (let i = 1; i <= numPages; i++) {
    if (signal?.aborted) {
      cancelled = true;
      break;
    }

    const percent = Math.round(5 + ((i - 1) / numPages) * 55);
    onProgress({
      stage: 'Extracting text layer',
      percent,
      detail: `Reading page ${i} of ${numPages}`,
      currentPage: i,
      totalPages: numPages
    });

    let page = null;
    try {
      page = await pdfDocument.getPage(i);
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
    } finally {
      if (page && typeof page.cleanup === 'function') {
        page.cleanup();
      }
    }
  }

  // Run OCR on pages that have fewer than 30 text characters and an embedded image >= 400px
  const pagesNeedingOcr = pageRecords.filter(p => p.type === 'needsOcr');
  let ocrWorker = null;
  let ocrCapWarning = null;

  // Cap OCR at named constant OCR_MAX_PAGES = 120
  const pagesToOcr = pagesNeedingOcr.slice(0, OCR_MAX_PAGES);
  const pagesSkippedOcr = pagesNeedingOcr.slice(OCR_MAX_PAGES);

  if (pagesSkippedOcr.length > 0) {
    for (const item of pagesSkippedOcr) {
      item.type = 'notProcessed';
    }
    const startPage = pagesSkippedOcr[0].pageIndex;
    const endPage = pagesSkippedOcr[pagesSkippedOcr.length - 1].pageIndex;
    ocrCapWarning = `Pages ${startPage}-${endPage} were not OCR'd (limit ${OCR_MAX_PAGES}).`;
  }

  if (!cancelled && pagesToOcr.length > 0) {
    const totalOcr = pagesToOcr.length;
    onProgress({
      stage: 'Scanned pages detected',
      percent: 60,
      detail: `Running OCR on ${totalOcr} page(s)...`,
      currentPage: 0,
      totalPages: totalOcr
    });

    try {
      const { createWorker } = await import('tesseract.js');
      ocrWorker = await createWorker('eng', 1, {
        logger: m => {
          if (m.status === 'recognizing text') {
            const ocrProgress = Math.round(60 + (m.progress || 0) * 35);
            onProgress({
              stage: 'Running OCR on scanned pages',
              percent: ocrProgress,
              detail: `Processing image text: ${Math.round((m.progress || 0) * 100)}%`
            });
          }
        }
      });

      // Run OCR in chunks of 10 pages with onProgress reporting "OCR page X of N"
      for (let c = 0; c < pagesToOcr.length; c += OCR_CHUNK_SIZE) {
        if (signal?.aborted) {
          cancelled = true;
          break;
        }

        const chunk = pagesToOcr.slice(c, c + OCR_CHUNK_SIZE);
        for (let ci = 0; ci < chunk.length; ci++) {
          if (signal?.aborted) {
            cancelled = true;
            break;
          }

          const item = chunk[ci];
          const pageIndexInOcr = c + ci + 1;
          const ocrPercent = Math.round(60 + ((pageIndexInOcr - 1) / totalOcr) * 35);

          onProgress({
            stage: 'Running OCR on scanned pages',
            percent: ocrPercent,
            detail: `OCR page ${pageIndexInOcr} of ${totalOcr}`,
            currentPage: pageIndexInOcr,
            totalPages: totalOcr
          });

          if (signal?.aborted) {
            cancelled = true;
            item.type = 'notProcessed';
            break;
          }

          let page = null;
          let canvas = null;
          try {
            page = await pdfDocument.getPage(item.pageIndex);
            const viewport = page.getViewport({ scale: 2.5 });

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
          } finally {
            if (canvas) {
              canvas.width = 0;
              canvas.height = 0;
            }
            if (page && typeof page.cleanup === 'function') {
              page.cleanup();
            }
          }
        }
      }
    } catch (ocrErr) {
      console.error('OCR per-page processing failed:', ocrErr);
      for (const item of pagesToOcr) {
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

  // If cancel mid-OCR occurred, mark remaining unprocessed OCR items as notProcessed (not empty)
  if (cancelled) {
    for (const item of pageRecords) {
      if (item.type === 'needsOcr') {
        item.type = 'notProcessed';
      }
    }
  } else {
    for (const item of pageRecords) {
      if (item.type === 'needsOcr') {
        item.type = 'empty';
      }
    }
  }

  // Merge text and OCR output in page order
  const pages = [];
  const rawPages = [];
  let textLayerCount = 0;
  let ocrCount = 0;
  let emptyCount = 0;
  let notProcessedCount = 0;

  for (const item of pageRecords) {
    const pageNum = item.pageIndex;
    const pageText = item.text || '';
    if (item.type === 'textLayer') {
      textLayerCount++;
    } else if (item.type === 'ocr') {
      ocrCount++;
    } else if (item.type === 'notProcessed') {
      notProcessedCount++;
    } else {
      emptyCount++;
    }

    const pageStatus = (item.type === 'textLayer' || item.type === 'ocr' || item.type === 'notProcessed')
      ? item.type
      : 'empty';
    pages.push({ page: pageNum, text: pageText, status: pageStatus });
    rawPages.push(pageText); // keep empty strings so indices match page numbers
  }

  // Pages never processed (e.g. if cancelled during text layer loop) must not count as empty
  if (numPages > pageRecords.length) {
    notProcessedCount += (numPages - pageRecords.length);
    for (let p = pageRecords.length + 1; p <= numPages; p++) {
      pages.push({ page: p, text: '', status: 'notProcessed' });
      rawPages.push('');
    }
  }

  const cancelWarning = cancelled
    ? 'Extraction was cancelled. Showing partial results.'
    : null;

  const totalPages = numPages;
  console.log(`[PDF_PAGES] total=${totalPages} textLayer=${textLayerCount} ocr=${ocrCount} empty=${emptyCount} notProcessed=${notProcessedCount}`);

  const emptyRatio = totalPages > 0 ? (emptyCount / totalPages) : 0;
  const hasEmptyWarning = emptyRatio > 0.3 && emptyCount > 0;
  const emptyWarning = hasEmptyWarning
    ? `Warning: ${emptyCount} of ${totalPages} pages (${Math.round(emptyRatio * 100)}%) are empty or unreadable.`
    : null;

  const allWarnings = [cancelWarning, ocrCapWarning, emptyWarning].filter(Boolean);
  const warning = allWarnings.length > 0 ? allWarnings.join(' ') : null;

  const combinedText = pages.map(p => p.text).filter(Boolean).join('\n\n').trim();

  if (!combinedText || combinedText.length < 20) {
    if (cancelled) {
      throw new Error('Extraction was cancelled by user before readable text could be obtained.');
    }
    throw new Error(
      'Could not extract meaningful readable text from this PDF. Please verify that the PDF contains study text or lecture notes.'
    );
  }

  onProgress({
    stage: 'Extraction complete',
    percent: 100,
    detail: `Extracted ${pages.filter(p => p.text).length} pages (${Math.round(combinedText.length / 5)} words)`
  });

  return {
    text: combinedText,
    pages,
    rawPages,
    pageCount: numPages,
    sourceFormat: 'pdf',
    ocrFallbackUsed: ocrCount > 0,
    pageStats: {
      total: totalPages,
      textLayer: textLayerCount,
      ocr: ocrCount,
      empty: emptyCount,
      notProcessed: notProcessedCount,
      emptyRatio
    },
    warning: warning || undefined,
    warnings: allWarnings,
    emptyRatio,
    emptyPages: emptyCount,
    notProcessed: notProcessedCount,
    totalPages
  };
}

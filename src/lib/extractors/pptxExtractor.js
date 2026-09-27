import JSZip from 'jszip';

/**
 * Extracts slide text from a PPTX file using JSZip and native browser DOMParser.
 * PPTX files are zipped archives containing XML slide documents in ppt/slides/slide*.xml.
 * 
 * @param {File|Blob} file 
 * @param {Function} onProgress ({ stage, percent, detail })
 * @returns {Promise<{ text: string, rawSlides: string[], slideCount: number, sourceFormat: 'pptx' }>}
 */
export async function extractFromPptx(file, onProgress = () => {}) {
  onProgress({ stage: 'Unzipping presentation', percent: 10, detail: 'Opening PPTX archive...' });

  let zip;
  try {
    const arrayBuffer = await file.arrayBuffer();
    zip = await JSZip.loadAsync(arrayBuffer);
  } catch (err) {
    throw new Error('The file is not a valid PPTX presentation or is corrupt. ' + err.message);
  }

  // Find all slide XML files in ppt/slides/
  const slideEntries = [];
  const slideRegex = /^ppt\/slides\/slide([0-9]+)\.xml$/i;

  zip.forEach((relativePath, zipEntry) => {
    const match = relativePath.match(slideRegex);
    if (match) {
      slideEntries.push({
        path: relativePath,
        slideNumber: parseInt(match[1], 10),
        entry: zipEntry
      });
    }
  });

  if (slideEntries.length === 0) {
    throw new Error('No slide XML content found in this PPTX archive. Please verify this is a standard PowerPoint (.pptx) file.');
  }

  // Sort slides in numerical order
  slideEntries.sort((a, b) => a.slideNumber - b.slideNumber);

  const parser = new DOMParser();
  const rawSlides = [];
  const slideMetadataList = [];
  const totalSlides = slideEntries.length;

  for (let i = 0; i < totalSlides; i++) {
    const slide = slideEntries[i];
    const percent = Math.round(15 + (i / totalSlides) * 80);
    onProgress({
      stage: 'Extracting slide text',
      percent,
      detail: `Parsing slide ${slide.slideNumber} of ${totalSlides}`
    });

    try {
      const xmlString = await slide.entry.async('text');
      const xmlDoc = parser.parseFromString(xmlString, 'application/xml');

      // Check for XML parse errors
      const parserError = xmlDoc.querySelector('parsererror');
      if (parserError) {
        console.warn(`XML parse warning on slide ${slide.slideNumber}`);
      }

      // ── Structural Title Extraction from Slide XML Placeholder ──
      let structuralTitle = null;
      const shapes = xmlDoc.getElementsByTagName('p:sp');
      for (let s = 0; s < shapes.length; s++) {
        const sp = shapes[s];
        let isTitlePlaceholder = false;

        // Check for placeholder tags: <p:ph type="title">, <p:ph type="ctrTitle">, <p:ph idx="0">
        const phElements = sp.getElementsByTagName('p:ph');
        if (phElements.length > 0) {
          const phType = (phElements[0].getAttribute('type') || '').toLowerCase();
          const phIdx = phElements[0].getAttribute('idx');
          if (phType === 'title' || phType === 'ctrtitle' || phIdx === '0' || !phType) {
            isTitlePlaceholder = true;
          }
        }

        // Check for named title shapes: <p:cNvPr name="Title 1" />
        const cNvPr = sp.getElementsByTagName('p:cNvPr')[0];
        if (cNvPr) {
          const shapeName = (cNvPr.getAttribute('name') || '').toLowerCase();
          if (shapeName.startsWith('title') || shapeName.includes('slide title')) {
            isTitlePlaceholder = true;
          }
        }

        // Check for prominent font styling sz >= 2400 (24pt+) at top of slide
        if (!isTitlePlaceholder) {
          const defRPr = sp.getElementsByTagName('a:defRPr')[0];
          const rPr = sp.getElementsByTagName('a:rPr')[0];
          const sz = parseInt(defRPr?.getAttribute('sz') || rPr?.getAttribute('sz') || '0', 10);
          if (sz >= 2400) {
            isTitlePlaceholder = true;
          }
        }

        if (isTitlePlaceholder) {
          const titleTextNodes = sp.getElementsByTagName('a:t');
          const extractedTitle = Array.from(titleTextNodes)
            .map(t => t.textContent || '')
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim();

          if (extractedTitle && extractedTitle.length >= 3 && extractedTitle.length <= 100) {
            structuralTitle = extractedTitle;
            break;
          }
        }
      }

      // Collect text by paragraph (<a:p>) to preserve bullet points and line structure
      const paragraphs = xmlDoc.getElementsByTagName('a:p');
      const slideParagraphs = [];

      for (let p = 0; p < paragraphs.length; p++) {
        const textElements = paragraphs[p].getElementsByTagName('a:t');
        const pText = Array.from(textElements)
          .map(t => t.textContent || '')
          .join('')
          .trim();

        if (pText.length > 0) {
          slideParagraphs.push(pText);
        }
      }

      // If no <a:p> tags found, fallback to all <a:t> elements directly
      if (slideParagraphs.length === 0) {
        const textNodes = xmlDoc.getElementsByTagName('a:t');
        const allText = Array.from(textNodes)
          .map(t => t.textContent?.trim() || '')
          .filter(Boolean)
          .join(' ');
        if (allText) slideParagraphs.push(allText);
      }

      // Ensure structural title is at the front of slide paragraphs if not already there
      if (structuralTitle && !slideParagraphs.some(p => p.toLowerCase() === structuralTitle.toLowerCase())) {
        slideParagraphs.unshift(structuralTitle);
      }

      const slideText = slideParagraphs.join('\n');
      rawSlides.push(slideText);
      slideMetadataList.push({
        slideNumber: slide.slideNumber,
        structuralTitle,
        text: slideText
      });
    } catch (slideErr) {
      console.warn(`Error reading slide ${slide.slideNumber}:`, slideErr);
      rawSlides.push('');
      slideMetadataList.push({
        slideNumber: slide.slideNumber,
        structuralTitle: null,
        text: ''
      });
    }
  }

  const combinedText = rawSlides.filter(Boolean).join('\n\n--- Slide Break ---\n\n');
  if (!combinedText.trim()) {
    throw new Error('This PPTX file contains slides, but no text elements were found (the slides may contain only images or vector shapes).');
  }

  onProgress({ stage: 'Extraction complete', percent: 100, detail: `Successfully parsed ${totalSlides} slides` });

  return {
    text: combinedText,
    rawSlides,
    slideMetadata: slideMetadataList,
    slideCount: totalSlides,
    sourceFormat: 'pptx'
  };
}

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

      const slideText = slideParagraphs.join('\n');
      rawSlides.push(slideText);
    } catch (slideErr) {
      console.warn(`Error reading slide ${slide.slideNumber}:`, slideErr);
      rawSlides.push('');
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
    slideCount: totalSlides,
    sourceFormat: 'pptx'
  };
}

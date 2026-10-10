/**
 * Extracts slide text from a PPTX file using JSZip and native browser DOMParser.
 * PPTX files are zipped archives containing XML slide documents in ppt/slides/slide*.xml.
 * Dynamically imports JSZip on demand.
 * 
 * @param {File|Blob} file 
 * @param {Function} onProgress ({ stage, percent, detail })
 * @returns {Promise<{ text: string, rawSlides: string[], slideCount: number, sourceFormat: 'pptx' }>}
 */
export async function extractFromPptx(file, onProgress = () => {}) {
  onProgress({ stage: 'Unzipping presentation', percent: 10, detail: 'Loading archive tools...' });

  const JSZip = (await import('jszip')).default;

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
    if (match && !zipEntry.dir) {
      slideEntries.push({
        path: relativePath,
        slideNumber: parseInt(match[1], 10),
        entry: zipEntry
      });
    }
  });

  if (slideEntries.length === 0) {
    throw new Error('No slide contents found in this PowerPoint file. It may be empty or not standard PPTX format.');
  }

  // Sort slides in physical presentation sequence
  slideEntries.sort((a, b) => a.slideNumber - b.slideNumber);

  const rawSlides = [];
  const domParser = new DOMParser();

  for (let i = 0; i < slideEntries.length; i++) {
    const item = slideEntries[i];
    const percent = Math.round(15 + ((i + 1) / slideEntries.length) * 75);
    onProgress({
      stage: 'Extracting slide content',
      percent,
      detail: `Reading slide ${item.slideNumber} of ${slideEntries.length}`
    });

    try {
      const xmlString = await item.entry.async('text');
      const doc = domParser.parseFromString(xmlString, 'application/xml');

      // Check for XML parsing errors
      const parseError = doc.querySelector('parsererror');
      if (parseError) {
        console.warn(`XML parsing warning on slide ${item.slideNumber}:`, parseError.textContent);
        continue;
      }

      // Extract text from <a:t> elements (PowerPoint OpenXML drawing text runs)
      const textNodes = doc.getElementsByTagNameNS('*', 't');
      const slideParagraphs = [];
      let currentParagraph = [];

      for (let j = 0; j < textNodes.length; j++) {
        const node = textNodes[j];
        const val = node.textContent?.trim();
        if (val) {
          currentParagraph.push(val);
        }
      }

      // Also parse slide notes if present
      const notesPath = `ppt/notesSlides/notesSlide${item.slideNumber}.xml`;
      const notesEntry = zip.file(notesPath);
      if (notesEntry) {
        try {
          const notesXml = await notesEntry.async('text');
          const notesDoc = domParser.parseFromString(notesXml, 'application/xml');
          const notesTextNodes = notesDoc.getElementsByTagNameNS('*', 't');
          const notesArr = [];
          for (let k = 0; k < notesTextNodes.length; k++) {
            const nVal = notesTextNodes[k].textContent?.trim();
            if (nVal && nVal.length > 3 && !/^[0-9]+$/.test(nVal)) {
              notesArr.push(nVal);
            }
          }
          if (notesArr.length > 0) {
            currentParagraph.push(`[Speaker Notes: ${notesArr.join(' ')}]`);
          }
        } catch (e) {
          // Non-critical notes error
        }
      }

      const slideText = currentParagraph.join(' ').replace(/\s+/g, ' ').trim();
      if (slideText) {
        rawSlides.push(slideText);
      }
    } catch (slideErr) {
      console.warn(`Error extracting text from slide ${item.slideNumber}:`, slideErr);
    }
  }

  const combinedText = rawSlides.join('\n\n').trim();

  if (!combinedText || combinedText.length < 20) {
    throw new Error(
      'The presentation contains no readable text or only blank slides. ' +
      'If slides are full-screen images/screenshots without text boxes, try converting slides to PNG/PDF.'
    );
  }

  onProgress({
    stage: 'Extraction complete',
    percent: 100,
    detail: `Extracted ${rawSlides.length} slides (${Math.round(combinedText.length / 5)} words)`
  });

  return {
    text: combinedText,
    rawSlides,
    slideCount: slideEntries.length,
    sourceFormat: 'pptx'
  };
}

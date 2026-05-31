/**
 * Client-side document text extraction.
 * Supports: .pdf (via pdfjs-dist), .docx (via mammoth), .txt
 */

const ACCEPTED_TYPES = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'text/plain': 'txt',
};

const ACCEPTED_EXTENSIONS = ['pdf', 'docx', 'txt'];

export const ACCEPTED_MIME_TYPES = Object.keys(ACCEPTED_TYPES).join(',');

/**
 * Return the extension type string for a File, or null if unsupported.
 * We check both MIME type and extension because some OSes report wrong MIME.
 */
export function getFileType(file) {
  const mimeType = ACCEPTED_TYPES[file.type];
  if (mimeType) return mimeType;

  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ACCEPTED_EXTENSIONS.includes(ext)) return ext;

  return null;
}

/**
 * Extract plain text from a File object.
 * @param {File} file
 * @returns {Promise<string>} Extracted plain text
 */
export async function extractText(file) {
  const type = getFileType(file);
  if (!type) throw new Error(`Unsupported file type. Please upload a PDF, DOCX, or TXT file.`);

  switch (type) {
    case 'pdf':  return extractFromPDF(file);
    case 'docx': return extractFromDOCX(file);
    case 'txt':  return extractFromTXT(file);
    default: throw new Error(`Unknown file type: ${type}`);
  }
}

// ---------------------------------------------------------------------------
// PDF — pdfjs-dist
// ---------------------------------------------------------------------------
async function extractFromPDF(file) {
  // Dynamic import keeps the heavy pdfjs bundle out of the initial load
  const pdfjs = await import('pdfjs-dist');

  // Must set workerSrc before any PDF loading
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
  ).href;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;

  const pageTexts = [];
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const pageText = content.items
      .map(item => ('str' in item ? item.str : ''))
      .join(' ');
    pageTexts.push(pageText);
  }

  const text = pageTexts.join('\n').trim();
  if (!text) throw new Error('No text could be extracted from this PDF. It may be a scanned image.');
  return text;
}

// ---------------------------------------------------------------------------
// DOCX — mammoth
// ---------------------------------------------------------------------------
async function extractFromDOCX(file) {
  const mammoth = await import('mammoth');
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  const text = result.value.trim();
  if (!text) throw new Error('No text could be extracted from this Word document.');
  return text;
}

// ---------------------------------------------------------------------------
// TXT — native FileReader
// ---------------------------------------------------------------------------
function extractFromTXT(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      const text = e.target.result.trim();
      if (!text) reject(new Error('The text file appears to be empty.'));
      else resolve(text);
    };
    reader.onerror = () => reject(new Error('Failed to read the text file.'));
    reader.readAsText(file, 'UTF-8');
  });
}

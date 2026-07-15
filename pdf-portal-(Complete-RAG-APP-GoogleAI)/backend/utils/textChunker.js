// Splits a page's raw text into overlapping chunks that are small enough
// to embed well and specific enough to give good search results.
// Keeping chunks page-scoped means every chunk can cite an exact page number.
const MAX_CHARS = 1200;
const OVERLAP = 150;

function chunkPageText(rawText, { maxChars = MAX_CHARS, overlap = OVERLAP } = {}) {
  const clean = (rawText || '').replace(/\s+/g, ' ').trim();
  if (!clean) return [];
  if (clean.length <= maxChars) return [clean];

  const chunks = [];
  let start = 0;
  while (start < clean.length) {
    const end = Math.min(start + maxChars, clean.length);
    chunks.push(clean.slice(start, end));
    if (end === clean.length) break;
    start = end - overlap; // step back so consecutive chunks overlap for context continuity
  }
  return chunks;
}

module.exports = { chunkPageText };

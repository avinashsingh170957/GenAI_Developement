const fs = require('fs');
const { PDFParse } = require('pdf-parse');
const pool = require('../config/db');
const { chunkPageText } = require('./textChunker');
const { embedDocumentChunks } = require('./embeddings');

// Runs after a PDF upload responds to the admin. Extracts text page-by-page,
// splits it into chunks, embeds each chunk with Google's embedding model,
// and stores everything so the /pdfs/search RAG endpoint can query it.
// Never throws — always resolves the pdf's status to 'ready' or 'failed'.
async function processPdfEmbeddings(pdfId, filePath) {
  let parser;
  try {
    const buffer = await fs.promises.readFile(filePath);
    parser = new PDFParse({ data: buffer });

    const textResult = await parser.getText();

    const chunkRecords = [];
    for (const page of textResult.pages) {
      const pageChunks = chunkPageText(page.text);
      pageChunks.forEach((content) => {
        chunkRecords.push({ page: page.num, content });
      });
    }

    if (chunkRecords.length === 0) {
      await pool.query('UPDATE pdfs SET status = ?, error_message = ? WHERE id = ?', [
        'failed',
        'No extractable text was found in this PDF (it may be scanned images without OCR).',
        pdfId
      ]);
      return;
    }

    const vectors = await embedDocumentChunks(chunkRecords.map((c) => c.content));

    const rows = chunkRecords.map((c, idx) => [
      pdfId,
      idx,
      c.page,
      c.content,
      JSON.stringify(vectors[idx])
    ]);

    await pool.query(
      'INSERT INTO pdf_chunks (pdf_id, chunk_index, page_number, content, embedding) VALUES ?',
      [rows]
    );

    await pool.query('UPDATE pdfs SET status = ?, error_message = NULL WHERE id = ?', ['ready', pdfId]);
    console.log(`✅ PDF #${pdfId} embedded: ${rows.length} chunks.`);
  } catch (error) {
    console.log("embedding failed",error);
    
    console.error(`❌ PDF #${pdfId} embedding failed:`, error);
    try {
      await pool.query('UPDATE pdfs SET status = ?, error_message = ? WHERE id = ?', [
        'failed',
        (error && error.message ? error.message : 'Processing failed.').slice(0, 500),
        pdfId
      ]);
    } catch (updateErr) {
      console.error('Failed to record PDF processing failure:', updateErr);
    }
  } finally {
    if (parser) {
      try {
        await parser.destroy();
      } catch (_) {
        /* ignore */
      }
    }
  }
}

module.exports = { processPdfEmbeddings };

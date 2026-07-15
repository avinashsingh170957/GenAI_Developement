const path = require('path');
const fs = require('fs');
const pool = require('../config/db');
const { processPdfEmbeddings } = require('../utils/pdfProcessor');
const { embedQuery, cosineSimilarity } = require('../utils/embeddings');
const ai = require('../utils/geminiClient');

const GENERATION_MODEL = process.env.GENERATION_MODEL || 'gemini-2.5-flash';
const TOP_K = 5;
const MIN_SCORE = 0.3;

// @route  POST /api/pdfs/upload
// @desc   Admin uploads a new PDF file
const uploadPdf = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No PDF file uploaded.' });
    }

    const title = req.body.title || req.file.originalname;

    const [result] = await pool.query(
      'INSERT INTO pdfs (title, filename, original_name, uploaded_by, status) VALUES (?, ?, ?, ?, ?)',
      [title, req.file.filename, req.file.originalname, req.user.id, 'processing']
    );

    // Fire-and-forget: extract text, chunk it, embed with Google, and store it
    // for RAG search. The admin gets an immediate response; the PDF list will
    // show "processing" until this finishes (poll GET /api/pdfs to see status).
    const filePath = path.join(__dirname, '..', 'uploads', req.file.filename);
    processPdfEmbeddings(result.insertId, filePath).catch((err) => {
      console.error('Unexpected error kicking off PDF embedding:', err);
    });

    res.status(201).json({
      message: 'PDF uploaded successfully. It is being indexed for search in the background.',
      pdf: {
        id: result.insertId,
        title,
        filename: req.file.filename,
        original_name: req.file.originalname,
        uploaded_by: req.user.id,
        status: 'processing'
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Server error while uploading PDF.' });
  }
};

// @route  GET /api/pdfs
// @desc   Get list of all uploaded PDFs (available to both admin and user)
const listPdfs = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT pdfs.id, pdfs.title, pdfs.original_name, pdfs.status, pdfs.error_message, pdfs.uploaded_at, users.name AS uploaded_by_name
       FROM pdfs
       JOIN users ON pdfs.uploaded_by = users.id
       ORDER BY pdfs.uploaded_at DESC`
    );
    res.status(200).json({ pdfs: rows });
  } catch (error) {
    console.error('List PDFs error:', error);
    res.status(500).json({ message: 'Server error while fetching PDFs.' });
  }
};

// @route  GET /api/pdfs/view/:id
// @desc   Stream a PDF file inline so it can be viewed in the browser/React app
const viewPdf = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM pdfs WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'PDF not found.' });
    }

    const pdf = rows[0];
    const filePath = path.join(__dirname, '..', 'uploads', pdf.filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File missing on server.' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${pdf.original_name}"`);
    fs.createReadStream(filePath).pipe(res);
  } catch (error) {
    console.error('View PDF error:', error);
    res.status(500).json({ message: 'Server error while retrieving PDF.' });
  }
};

// @route  DELETE /api/pdfs/:id
// @desc   Admin deletes a PDF
const deletePdf = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM pdfs WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'PDF not found.' });
    }

    const pdf = rows[0];
    const filePath = path.join(__dirname, '..', 'uploads', pdf.filename);

    await pool.query('DELETE FROM pdfs WHERE id = ?', [id]);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.status(200).json({ message: 'PDF deleted successfully.' });
  } catch (error) {
    console.error('Delete PDF error:', error);
    res.status(500).json({ message: 'Server error while deleting PDF.' });
  }
};

// @route  POST /api/pdfs/search
// @desc   RAG search: embeds the question, finds the most relevant PDF chunks
//         by cosine similarity, then asks Gemini to answer using only that
//         retrieved context. Available to any authenticated user (admin or user).
const searchPdfs = async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || !query.trim()) {
      return res.status(400).json({ message: 'Search query is required.' });
    }

    const [chunks] = await pool.query(
      `SELECT pc.pdf_id, pc.page_number, pc.content, pc.embedding, p.title
       FROM pdf_chunks pc
       JOIN pdfs p ON pc.pdf_id = p.id
       WHERE p.status = 'ready'`
    );

    if (chunks.length === 0) {
      return res.status(200).json({
        answer:
          "There's nothing indexed yet. Once the admin uploads a PDF and it finishes processing, you'll be able to search it here.",
        sources: []
      });
    }

    const queryVector = await embedQuery(query);

    const scored = chunks
      .map((chunk) => {
        const embedding =
          typeof chunk.embedding === 'string' ? JSON.parse(chunk.embedding) : chunk.embedding;
        return {
          pdf_id: chunk.pdf_id,
          title: chunk.title,
          page_number: chunk.page_number,
          content: chunk.content,
          score: cosineSimilarity(queryVector, embedding)
        };
      })
      .sort((a, b) => b.score - a.score);

    const topMatches = scored.slice(0, TOP_K).filter((m) => m.score >= MIN_SCORE);

    if (topMatches.length === 0) {
      return res.status(200).json({
        answer: "I couldn't find anything relevant to that in the uploaded documents.",
        sources: []
      });
    }

    const contextBlock = topMatches
      .map((m, i) => `[Source ${i + 1}] Document: "${m.title}", Page ${m.page_number}\n${m.content}`)
      .join('\n\n---\n\n');

    const prompt = `You are a helpful assistant answering a question using ONLY the context excerpts below, which were extracted from a company's uploaded PDF documents.

Context:
${contextBlock}

Question: ${query}

Instructions:
- Answer using only the information in the context above; do not use outside knowledge.
- If the context does not contain the answer, say you don't have enough information in the uploaded documents.
- When you use a fact, cite it inline like (Source 1), (Source 2), matching the numbered sources above.
- Be concise and clear.`;

    const generation = await ai.models.generateContent({
      model: GENERATION_MODEL,
      contents: prompt
    });

    const answer = generation.text || "I wasn't able to generate an answer.";

    res.status(200).json({
      answer,
      sources: topMatches.map((m, i) => ({
        index: i + 1,
        pdf_id: m.pdf_id,
        title: m.title,
        page_number: m.page_number,
        snippet: m.content.length > 220 ? `${m.content.slice(0, 220)}…` : m.content,
        score: Number(m.score.toFixed(3))
      }))
    });
  } catch (error) {
    console.error('RAG search error:', error);
    res.status(500).json({ message: 'Server error while searching documents.' });
  }
};

module.exports = { uploadPdf, listPdfs, viewPdf, deletePdf, searchPdfs };

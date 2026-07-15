const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

if (!process.env.GOOGLE_API_KEY) {
  console.warn(
    '⚠️  GOOGLE_API_KEY is not set. PDF embedding and RAG search will fail until you add it to backend/.env'
  );
}

// Single shared client for both embeddings (models.embedContent)
// and answer generation (models.generateContent).
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

module.exports = ai;

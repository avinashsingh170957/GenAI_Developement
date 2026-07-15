const ai = require('./geminiClient');

const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || 'text-embedding-004';
const BATCH_SIZE = 10; // keep requests small/safe for the Gemini embeddings API

// Calls Google's embedContent API in batches and returns the vectors in order.
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function embedTexts(texts, taskType) {
  const vectors = [];

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {

    const batch = texts.slice(i, i + BATCH_SIZE);

    while (true) {
      try {

        const response = await ai.models.embedContent({
          model: EMBEDDING_MODEL,
          contents: batch,
          config: taskType ? { taskType } : undefined
        });

        for (const embedding of response.embeddings) {
          vectors.push(embedding.values);
        }

        console.log(
          `Embedded ${Math.min(i + BATCH_SIZE, texts.length)} / ${texts.length}`
        );

        break;

      } catch (err) {
        console.log(err);
        
        if (err.status === 429) {
          console.log("Rate limit reached. Waiting 35 seconds...");
          await sleep(35000);
          continue;
        }

        throw err;
      }
    }

    // Small delay between successful requests
    await sleep(500);
  }

  return vectors;
}

// PDF chunks are embedded as "documents" (asymmetric embedding for better retrieval).
function embedDocumentChunks(chunks) {
  return embedTexts(chunks, 'RETRIEVAL_DOCUMENT');
}

// A user's search question is embedded as a "query".
async function embedQuery(query) {
  const [vector] = await embedTexts([query], 'RETRIEVAL_QUERY');
  return vector;
}

function cosineSimilarity(a, b) {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

module.exports = { embedDocumentChunks, embedQuery, cosineSimilarity };

import fs from "fs/promises";
import Ollama from "ollama";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

// Current file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Embedding JSON path
const file_path = path.join(
  __dirname,
  "embeding_files",
  "embeding.json"
);

// Cosine Similarity Function
function cosineSimilarity(vecA, vecB) {
  let dot = 0;
  let magA = 0;
  let magB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    magA += vecA[i] * vecA[i];
    magB += vecB[i] * vecB[i];
  }

  magA = Math.sqrt(magA);
  magB = Math.sqrt(magB);

  return dot / (magA * magB);
}

// Load Embeddings
async function loadEmbeddings() {
  try {
    const fileData = await fs.readFile(file_path, "utf-8");

    const parsedData = JSON.parse(fileData);

    return Array.isArray(parsedData)
      ? parsedData
      : [parsedData];

  } catch (error) {
    console.error("Error loading embeddings:", error);
    return [];
  }
}

// Ask Question
async function askQuestion(question) {
  try {

    console.log("\nQuestion:", question);

    // Load embedding data
    const data = await loadEmbeddings();

    console.log("\nTotal Stored Chunks:", data.length);

    // Create embedding for user question
    const embeddingResponse = await Ollama.embeddings({
      model: "nomic-embed-text",
      prompt: question,
    });

    const queryEmbedding = embeddingResponse.embedding;

    // Calculate similarity scores
    const scoredData = data.map((item) => ({
      id: item.id,
      text: item.text,
      score: cosineSimilarity(
        queryEmbedding,
        item.vector.embedding
      ),
    }));

    // Sort by highest similarity
    scoredData.sort((a, b) => b.score - a.score);
    // Filter relevant chunks
    const topMatches = scoredData
      .filter((item) => item.score > 0.45)
      .slice(0, 3);

    // No relevant matches
    if (topMatches.length === 0) {
      console.log("\nFinal Answer:\n");
      console.log("Not found");
      return;
    }

    // Create context
    const context = topMatches
      .map((item) => item.text)
      .join("\n\n");

    // Ask LLM
    const chatResponse = await Ollama.chat({
      model: "phi3:mini",
      messages: [
        {
          role: "system",
          content: `
You are a document Q&A assistant.

Rules:
- Answer ONLY from the provided context
- Keep answers short and direct
- Return only the exact answer
- Do not explain anything
- If answer is missing say "Not found"
          `,
        },
        {
          role: "user",
          content: `
Question:
${question}

Context:
${context}
          `,
        },
      ],
    });

    console.log("\nFinal Answer:\n");

    console.log(
      chatResponse.message.content.trim()
    );

  } catch (error) {
    console.error("\nError:", error);
  }
}

// Run
await askQuestion("Termination Policy");
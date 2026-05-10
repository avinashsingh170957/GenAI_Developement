import Ollama from "ollama";
import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

const pdfModule = require("pdf-parse");

// Fix export issue
const pdf = pdfModule.default || pdfModule;

// Split text into chunks
function chunkText(text, chunkSize = 500) {
  const chunks = [];

  for (let i = 0; i < text.length; i += chunkSize) {
    const chunk = text.slice(i, i + chunkSize).trim();

    if (chunk) {
      chunks.push(chunk);
    }
  }

  return chunks;
}

async function embeding() {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    const file_path = path.join(
      __dirname,
      "files",
      "company_employee_policy_sample.pdf"
    );

    // Read PDF file
    const dataBuffer = fs.readFileSync(file_path);

    // Parse PDF
    const data = await pdf(dataBuffer);

    console.log("\nPDF Loaded Successfully\n");

    console.log("Total Pages:", data.numpages);

    // Full PDF text
    const pdfText = data.text;

    // Create chunks
    const chunks = chunkText(pdfText, 500);

    console.log("Total Chunks:", chunks.length);

    const embeddingData = [];

    // Generate embedding for each chunk
    for (let i = 0; i < chunks.length; i++) {
      console.log(`Embedding Chunk ${i + 1}/${chunks.length}`);

      const response = await Ollama.embeddings({
        model: "nomic-embed-text",
        prompt: chunks[i],
      });

      embeddingData.push({
        id: i + 1,
        text: chunks[i],
        vector: response,
      });
    }

    // Save embeddings
    const outputPath = path.join(
      __dirname,
      "embeding.json"
    );

    fs.writeFileSync(
      outputPath,
      JSON.stringify(embeddingData, null, 2)
    );

    console.log("\nEmbeddings Saved Successfully");
    console.log("File:", outputPath);

  } catch (error) {
    console.error("Error:", error);
  }
}

embeding();
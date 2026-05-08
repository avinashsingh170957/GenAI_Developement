import Ollama from "ollama";
import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

const pdfModule = require("pdf-parse");

// Fix export issue
const pdf = pdfModule.default || pdfModule;

console.log(pdfModule);

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

    console.log("PDF Text:\n", data.text);
    console.log("Total Pages:", data.numpages);
    console.log("PDF Info:", data.info);

    // Generate embeddings
    const embeddings = await Ollama.embeddings({
      model: "nomic-embed-text",
      prompt: data.text,
    });

    console.log("Embedding Generated");
    console.log(embeddings);
  } catch (error) {
    console.error("Error:", error);
  }
}

embeding();
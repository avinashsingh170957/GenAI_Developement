import { PDFParse } from "pdf-parse";
import path from "node:path";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import Ollama from "ollama";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const filepath = path.join(__dirname, "..", "files");

async function embeding(filename) {
    try {
        const file_name = filename.split(" ");
        const pdffile = path.join(filepath, file_name[1]);

        console.log("File:", pdffile);

        const buffer = await fs.readFile(pdffile);

        const parser = new PDFParse({ data: buffer });

        const result = await parser.getText();

        await parser.destroy();

        const chunks = await chunkText(result.text);

        console.log(`Total Chunks: ${chunks.length}`);

        const embeddedChunks = [];

        for (let i = 0; i < chunks.length; i++) {
            const response = await Ollama.embed({
                model: "nomic-embed-text",
                input: chunks[i],
            });

            embeddedChunks.push({
                id: i + 1,
                text: chunks[i],
                embedding: response.embeddings[0],
            });

            console.log(
                `Chunk ${i + 1}/${chunks.length} - Embedding Size: ${response.embeddings[0].length}`
            );
        }

        const save = filepath.replace("files", "embeding_json");

        await fs.mkdir(save, { recursive: true });

        await fs.writeFile(
            path.join(save, file_name[1].replace(".pdf", ".json")),
            JSON.stringify(embeddedChunks, null, 2),
            "utf-8"
        );

        console.log("Embeddings saved successfully.");


    } catch (err) {
        console.error(err);
    }
}

async function chunkText(text, chunkSize = 200, overlap = 50) {
    const words = text.split(/\s+/);
    const chunks = [];

    for (let i = 0; i < words.length; i += (chunkSize - overlap)) {
        chunks.push(words.slice(i, i + chunkSize).join(" "));
    }

    return chunks;
}

export default embeding;
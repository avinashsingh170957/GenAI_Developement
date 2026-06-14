import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Readfiles from "./fileselection.js";
import { GoogleGenAI } from "@google/genai";
import { PDFParse } from "pdf-parse";
import { cosineSimilarity } from "./cosineSimilarity.js";

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_API_KEY
});
async function embeddings(RL) {
    try {
        const selected_pdf_files = await Readfiles(RL);
        console.log("selected Pdf files",selected_pdf_files);
        const content = await Read_Pdf(selected_pdf_files);
       const embeding_data = await embeding_Process(content);
       await saveEmbeddings(embeding_data,selected_pdf_files)
        return "Embedding completed";
    } catch (error) {
        console.error(error);
        return "Embedding failed...";
    }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function Chat(RL) {
    try {

        // Load all embedding files only once
        const embeddingFolder = path.join(
            __dirname,
            "..",
            "embeded_data"
        );

        const files = await fs.readdir(embeddingFolder);

        const allChunks = [];

        for (const file of files) {

            if (!file.endsWith(".json")) continue;

            const filePath = path.join(embeddingFolder, file);

            const data = JSON.parse(
                await fs.readFile(filePath, "utf8")
            );

            data.forEach(chunk => {
                allChunks.push({
                    source: file,
                    text: chunk.text,
                    embedding: chunk.embedding
                });
            });
        }

        console.log(`Loaded ${allChunks.length} chunks.\n`);

        while (true) {

            const question = await RL.question(
                "\nAsk your question (type 'exit' to quit): "
            );

            if (question.trim().toLowerCase() === "exit") {
                console.log("Chat ended.");
                break;
            }

            // Generate question embedding
            const response = await ai.models.embedContent({
                model: "gemini-embedding-001",
                contents: question,
            });

            const questionEmbedding = response.embeddings[0].values;

            // Calculate similarity
            const results = allChunks.map(chunk => ({
                source: chunk.source,
                text: chunk.text,
                score: cosineSimilarity(
                    questionEmbedding,
                    chunk.embedding
                )
            }));

            results.sort((a, b) => b.score - a.score);

            const topChunks = results.slice(0, 5);

            console.table(
                topChunks.map(c => ({
                    File: c.source,
                    Score: c.score.toFixed(4)
                }))
            );

            const context = topChunks
                .map(c => `Source: ${c.source}\n${c.text}`)
                .join("\n\n------------------------\n\n");

            const prompt = `
You are a helpful AI assistant.

Answer ONLY from the provided context.

If the answer is not available in the context, reply:
"I couldn't find the answer in the available documents."

Context:
${context}

Question:
${question}
`;

            const answer = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
            });

            console.log("\n==============================");
            console.log("Answer:\n");
            console.log(answer.text);
            console.log("==============================\n");
        }

    } catch (error) {
        console.error(error);
    }
}
async function embeding_Process(content) {

    const chunks = chunkText(content);

    const embeddingData = [];

    for (let i = 0; i < chunks.length; i++) {

        console.log(`Embedding Chunk ${i + 1}/${chunks.length}`);

        const response = await ai.models.embedContent({
            model: "gemini-embedding-001",
            contents: chunks[i],
        });

        embeddingData.push({
            id: i + 1,
            text: chunks[i],
            embedding: response.embeddings[0].values
        });
    }

    return embeddingData;
}
function chunkText(text, chunkSize = 1000) {

    const paragraphs = text
        .split(/\n\s*\n/)
        .map(p => p.trim())
        .filter(Boolean);

    const chunks = [];
    let currentChunk = "";

    for (const paragraph of paragraphs) {

        if ((currentChunk + paragraph).length <= chunkSize) {

            currentChunk += paragraph + "\n\n";

        } else {

            if (currentChunk) {
                chunks.push(currentChunk.trim());
            }

            currentChunk = paragraph + "\n\n";
        }
    }

    if (currentChunk) {
        chunks.push(currentChunk.trim());
    }

    return chunks;
}

async function Read_Pdf(selected_pdf_files) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const pdfFolder = path.join(__dirname, "..", "pdf_files",selected_pdf_files);
    
    const buffer = await fs.readFile(pdfFolder);
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    await parser.destroy();
    return result.text;
}

async function saveEmbeddings(data,selected_pdf_files) {
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DataFolder = path.join(__dirname, "..", "embeded_data");

// Create folder if it doesn't exist
await fs.mkdir(DataFolder, { recursive: true });

const fileName = selected_pdf_files.replace(".pdf", ".json");

const filePath = path.join(DataFolder, fileName);

await fs.writeFile(
    filePath,
    JSON.stringify(data, null, 2),
    "utf-8"
);

console.log("Saved:", filePath);
}
export default embeddings;
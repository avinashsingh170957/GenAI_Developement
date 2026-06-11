import fs from "fs/promises";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import { PDFParse } from "pdf-parse";
import ENV from "../envconfig.js";

const ai = new GoogleGenAI({
    apiKey: ENV.GEMINI_API_KEY
});

function chunkText(text, chunkSize = 1000) {
    const chunks = [];

    for (let i = 0; i < text.length; i += chunkSize) {
        const chunk = text.slice(i, i + chunkSize).trim();

        if (chunk.length > 0) {
            chunks.push(chunk);
        }
    }

    return chunks;
}

async function processPDFs() {

    const filesDir = path.resolve("../files");

    const vectorStore = [];

    const files = await fs.readdir(filesDir);

    for (const file of files) {

        if (!file.toLowerCase().endsWith(".pdf")) {
            continue;
        }

        try {

            console.log(`\nProcessing: ${file}`);

            const pdfPath = path.join(filesDir, file);

            const pdfBuffer = await fs.readFile(pdfPath);

            // New pdf-parse API
            const parser = new PDFParse({
                data: pdfBuffer
            });

            const pdfData = await parser.getText();

            const text = pdfData.text || "";

            if (!text.trim()) {
                console.log(`No text found in ${file}`);
                continue;
            }

            const chunks = chunkText(text);

            console.log(`Found ${chunks.length} chunks`);

            for (let i = 0; i < chunks.length; i++) {

                const chunk = chunks[i];

                const embedResponse =
                    await ai.models.embedContent({
                        model: "gemini-embedding-001",
                        contents: chunk
                    });

                const embedding =
                    embedResponse.embeddings[0].values;

                vectorStore.push({
                    id: `${file}-${i}`,
                    source: file,
                    chunk_no: i,
                    text: chunk,
                    embedding
                });

                console.log(
                    `Stored Chunk ${i + 1}/${chunks.length}`
                );
            }

            // cleanup parser resources
            await parser.destroy?.();

        } catch (error) {

            console.error(
                `Failed processing ${file}:`,
                error
            );
        }
    }

    await fs.writeFile(
        path.resolve("./embeddings.json"),
        JSON.stringify(vectorStore, null, 2)
    );

    console.log(
        `\nSaved ${vectorStore.length} embeddings to embeddings.json`
    );
}

await processPDFs();
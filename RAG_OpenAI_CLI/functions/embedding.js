import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Readfiles from "./fileselection.js";
import { GoogleGenAI } from "@google/genai";
import { PDFParse } from "pdf-parse";

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

async function embeding_Process(content) {
     const response = await ai.models.embedContent({
        model: "gemini-embedding-001",
        contents: content,
    });

    return response.embeddings[0].values;
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
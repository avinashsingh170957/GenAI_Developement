import Ollama from "ollama";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Readline from "node:readline/promises";
import { stdin, stdout } from "node:process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RL = Readline.createInterface({
    input: stdin,
    output: stdout
});

function cosineSimilarity(vecA, vecB) {
    let dot = 0;
    let magA = 0;
    let magB = 0;

    for (let i = 0; i < vecA.length; i++) {
        dot += vecA[i] * vecB[i];
        magA += vecA[i] * vecA[i];
        magB += vecB[i] * vecB[i];
    }

    return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

async function searchPDF(question) {

    // Generate question embedding
    const embeddingResponse = await Ollama.embed({
        model: "nomic-embed-text",
        input: question,
    });

    const questionEmbedding = embeddingResponse.embeddings[0];

    // Read all embedded JSON files
    const folderPath = path.join(__dirname, "embeding_json");

    const files = await fs.readdir(folderPath);
    console.log("files",files);
    
    const allChunks = [];

    for (const file of files) {

        if (!file.endsWith(".json")) continue;

        const filePath = path.join(folderPath, file);

        const json = JSON.parse(
            await fs.readFile(filePath, "utf8")
        );
console.log("js",json);

        for (const chunk of json) {

            allChunks.push({
                source: json.source,
                id: chunk.id,
                text: chunk.text,
                embedding: chunk.embedding
            });

        }
    }

    // Calculate similarity
    const matches = allChunks.map(chunk => ({
        source: chunk.source,
        id: chunk.id,
        text: chunk.text,
        score: cosineSimilarity(
            questionEmbedding,
            chunk.embedding
        )
    }));

    // Sort by similarity
    matches.sort((a, b) => b.score - a.score);

    return matches.slice(0, 3);
}

async function chat() {

    while (true) {

        const question = await RL.question("\nAsk your question (type 'exit' to quit): ");

        if (question.toLowerCase() === "exit") {
            RL.close();
            return;
        }

        const topChunks = await searchPDF(question);

        const context = topChunks
            .map(chunk =>
                `Source: ${chunk.source}\n${chunk.text}`
            )
            .join("\n\n");

        const prompt = `
You are a helpful assistant.

Answer ONLY from the context below.

Context:
${context}

Question:
${question}

If the answer is not available in the context, reply:
"I couldn't find that information in the documents."
`;

        const response = await Ollama.chat({
            model: "llama3.1:latest",
            stream: false,
            messages: [
                {
                    role: "user",
                    content: prompt
                }
            ]
        });

        console.log("\n--------------------------------");
        console.log(response);        
        console.log(response.message.content);
        console.log("--------------------------------");

    }
}

chat();
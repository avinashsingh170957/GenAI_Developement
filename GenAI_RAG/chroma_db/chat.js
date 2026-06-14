import fs from "fs/promises";
import ENV from "../envconfig.js";
import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({
    apiKey: ENV.GEMINI_API_KEY
});

const vectorStore = JSON.parse(
    await fs.readFile("./embeddings.json", "utf8")
);

function cosineSimilarity(a, b) {

    let dot = 0;
    let magA = 0;
    let magB = 0;

    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        magA += a[i] * a[i];
        magB += b[i] * b[i];
    }

    return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

async function retrieveRelevantChunks(question) {

    const response =
        await ai.models.embedContent({
            model: "gemini-embedding-001",
            contents: question
        });

    const questionEmbedding =
        response.embeddings[0].values;

    const scored = vectorStore.map(item => ({
        ...item,
        score: cosineSimilarity(
            questionEmbedding,
            item.embedding
        )
    }));

    scored.sort((a, b) => b.score - a.score);

    return scored.slice(0, 3);
}

async function askQuestion(question) {

    const topChunks =
        await retrieveRelevantChunks(question);

    const context = topChunks
        .map(chunk => chunk.text)
        .join("\n\n");

    const prompt = `
You are a customer support assistant.

Answer ONLY using the provided context.

Context:
${context}

Question:
${question}
`;

    const result =
        await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt
        });

    return result.text;
}

const answer =
    await askQuestion(
        "Return issues"
    );

console.log(answer);
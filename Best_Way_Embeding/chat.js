const fs = require("fs");
const path = require("path");
const ollama = require("ollama").default;

// Cosine Similarity
function cosineSimilarity(a, b) {
    let dot = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }

    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function chat(userQuestion) {
    try {
        // Read embeddings
        const filePath = path.join(__dirname, "embeddings.json");

        const embeddings = JSON.parse(
            fs.readFileSync(filePath, "utf8")
        );

        // Generate embedding for user's question
        const embedResponse = await ollama.embed({
            model: "nomic-embed-text",
            input: userQuestion
        });

        const queryEmbedding = embedResponse.embeddings[0];

        // Calculate similarity
        const matches = embeddings.map(item => ({
            ...item,
            score: cosineSimilarity(queryEmbedding, item.embedding)
        }));

        // Sort by similarity
        matches.sort((a, b) => b.score - a.score);

        // Top 3 results
        const topResults = matches.slice(0, 3);

        console.log("\nTop Matches:\n");

        topResults.forEach((item, index) => {
            console.log(`${index + 1}. Score: ${item.score.toFixed(4)}`);
            console.log(item.question);
            console.log();
        });

        // Build context
        const context = topResults
            .map(item => `
Question:
${item.question}

Answer:
${item.answer}
`)
            .join("\n------------------------\n");

        // Ask Ollama
        const response = await ollama.chat({
            model: "llama3.1:latest",
            messages: [
                {
                    role: "system",
                    content:
                        "You are a helpful customer support assistant. Answer ONLY using the provided context. If the answer is not available, say 'I don't know based on the provided documents.'"
                },
                {
                    role: "user",
                    content: `
Context:

${context}

User Question:

${userQuestion}
`
                }
            ]
        });

        console.log("\nAI Response:\n");
        console.log(response.message.content);

    } catch (err) {
        console.error(err);
    }
}

chat("Delivery");
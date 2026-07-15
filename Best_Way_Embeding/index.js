const pdfParse = require("pdf-parse");
const fs = require("fs");
const path = require("path");
const ollama = require("ollama").default;
console.log(ollama);
const file_path = path.join(__dirname, "files");

async function file_Read() {
    const pdf_file = path.join(file_path, "ecommerce_support_50_qa.pdf");

    const buffer = fs.readFileSync(pdf_file);

    const content = await pdfParse(buffer);
    const line_text = content.text.split("\n");
    console.log(line_text);
    console.log(line_text.length);
    await embeding_chunks(line_text)
}
async function embeding_chunks(line_text) {
    const embeddings = [];

    let question = "";
    let answer = "";
    let id = 1;

    for (const line of line_text) {
        const text = line.trim();

        if (!text || text === "(1000 Q&A;)") {
            continue;
        }

        if (text.startsWith("Q")) {
            question = text;
        } else if (text.startsWith("A")) {
            answer = text;

            // Embed Question + Answer together
            const input = `${question}\n${answer}`;

            const response = await ollama.embed({
                model: "nomic-embed-text",
                input
            });

            embeddings.push({
                id,
                question,
                answer,
                embedding: response.embeddings[0]
            });

            id++;
            question = "";
            answer = "";
            console.log(`Completed chunks ${id}`);
            
        }
    }

    const outputPath = path.join(__dirname, "embeddings.json");

    fs.writeFileSync(
        outputPath,
        JSON.stringify(embeddings, null, 2),
        "utf8"
    );

    console.log(`Saved ${embeddings.length} embeddings.`);
    console.log(`File: ${outputPath}`);
}
file_Read();
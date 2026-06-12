import ollama from 'ollama';
import fs from 'node:fs/promises';
import { PDFParse } from 'pdf-parse';

async function buildEmbeddings() {
  const pdfBuffer = await fs.readFile('Rag_Questions_answer.pdf');

  const parser = new PDFParse({
    data: pdfBuffer,
  });

  const result = await parser.getText();
  await parser.destroy();

  const text = result.text;

  // Split into chunks
  const chunks = text.match(/[\s\S]{1,1000}/g) || [];

  const records = [];

  for (let i = 0; i < chunks.length; i++) {
    console.log(`Embedding chunk ${i + 1}/${chunks.length}`);

    const response = await ollama.embed({
      model: 'qwen3-embedding',
      input: chunks[i],
    });

    records.push({
      id: i,
      text: chunks[i],
      embedding: response.embeddings[0],
    });
  }

  await fs.writeFile(
    'embeddings.json',
    JSON.stringify(records, null, 2)
  );

  console.log('Embeddings saved.');
}

buildEmbeddings();
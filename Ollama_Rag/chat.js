import ollama from 'ollama';
import fs from 'node:fs/promises';
import Read from 'node:readline/promises'
import { stdin, stdout } from 'node:process';
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

async function ask(question) {
  const db = JSON.parse(
    await fs.readFile('embeddings.json', 'utf8')
  );

  const queryEmbedding = await ollama.embed({
    model: 'qwen3-embedding',
    input: question,
  });

  const vector = queryEmbedding.embeddings[0];

  const scored = db.map(item => ({
    text: item.text,
    score: cosineSimilarity(vector, item.embedding),
  }));

  scored.sort((a, b) => b.score - a.score);

  const context = scored
    .slice(0, 3)
    .map(x => x.text)
    .join('\n\n');

  const response = await ollama.chat({
    model: 'qwen3:latest',
    messages: [
      {
        role: 'system',
        content:
          `Answer only from the provided context. 
		  If the answer is not in the context, 
		  say "I do not know". 
		  Rules
		  -when user say hi how are you. 
		  so just say i am fine thanks`,
      },
      {
        role: 'user',
        content: `
Context:
${context}

Question:
${question}
        `,
      },
    ],
  });

  console.log('\nQuestion:', question);
  console.log('\nAnswer:', response.message.content);
}

//ask('office hours ');

async function chat(){
    const RL = Read.createInterface({
    input : stdin,
    output : stdout
  })
  while (true) {
  
  const question = await RL.question('Enter your question ');
  if (question.toLowerCase()== 'bye' || question.toLowerCase()== 'exit') {
    RL.close();
    return;
  }
  console.log(question);
  await ask(question);
  
  }
 
  RL.close();
}

chat();
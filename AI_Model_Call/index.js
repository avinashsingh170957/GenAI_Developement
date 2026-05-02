import Ollama from "ollama";
import readline from 'node:readline/promises';
import { stdin, stdout } from "node:process";

async function call_model() {
    const RL = readline.createInterface({
        input: stdin,
        output: stdout
    });

    while (true) {
        const question = (await RL.question("enter your question "))
            .trim()
            .toLowerCase();

        if (["bye", "exit", "close"].includes(question)) {
            break;
        }

        const response = await Ollama.chat({
            model: "phi3:mini",
            messages: [
                {
                    role: "user",
                    content: question
                }
            ]
        });

        console.log("response:", response.message.content);
    }

    RL.close(); // ✅ close once
}

call_model();
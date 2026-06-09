import Ollama from "ollama";
import { stdin, stdout } from "node:process";
import readline from "node:readline/promises";

async function main() {
    const rl = readline.createInterface({
        input: stdin,
        output: stdout,
    });

    const tools = [
        {
            type: "function",
            function: {
                name: "Add_Expence",
                description: "Add a new expense",
                parameters: {
                    type: "object",
                    properties: {
                        name: {
                            type: "string",
                            description: "Expense name"
                        },
                        amount: {
                            type: "number",
                            description: "Expense amount"
                        }
                    },
                    required: ["name", "amount"]
                }
            }
        },
        {
            type: "function",
            function: {
                name: "Get_Expence",
                description: "Get expenses",
                parameters: {
                    type: "object",
                    properties: {
                        days: {
                            type: "number",
                            description: "Number of previous days"
                        }
                    },
                    required: ["days"]
                }
            }
        }
    ];

    while (true) {
        const question = await rl.question(
            "\nEnter your expense details: "
        );

        if (question.toLowerCase() === "exit") {
            break;
        }

        const today = new Date().toISOString().split("T")[0];

        const response = await Ollama.chat({
            model: "llama3.1:latest",
            tools,
            messages: [
                {
                    role: "system",
                    content: `
You are an Expense Assistant.

Today's date is ${today}.

Available tools:
1. Add_Expence(name, amount)
2. Get_Expence(days)

Rules:
- Use Add_Expence when user wants to save an expense.
- Use Get_Expence when user wants expense history.
- For phrases like:
  - last 5 days
  - last 7 days
  - previous 10 days
  return Get_Expence with the days value.
- Never invent expense data.
- Always prefer tool calls when a tool can satisfy the request.
- if tool is not required you can normal chat.
`
                },
                {
                    role: "user",
                    content: question
                }
            ]
        });

        /*
        console.log("\n======================");
        console.log(JSON.stringify(response, null, 2));
        console.log("======================");
        */
        if (response.message.tool_calls?.length) {
            for (const toolCall of response.message.tool_calls) {

                const { name, arguments: args } = toolCall.function;

                console.log("\nTool Selected:", name);
                console.log("Arguments:", args);

                if (name === "Get_Expence") {
                    const days = Number(args.days);

                    const to = new Date();
                    const from = new Date();

                    from.setDate(from.getDate() - (days - 1));

                    console.log({
                        from: from.toISOString().split("T")[0],
                        to: to.toISOString().split("T")[0]
                    });
                }

                if (name === "Add_Expence") {
                    console.log("Expense to Add:", args);
                }
            }
        } else {
            console.log("\nAssistant:");
            console.log(response.message.content);
        }
    }

    rl.close();
}

main();
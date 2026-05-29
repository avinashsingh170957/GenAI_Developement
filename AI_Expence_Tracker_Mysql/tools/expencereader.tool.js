import Groq from "groq-sdk";
import tools from "../tools.js";
import GetExpence from "./GetExpence.js";

const groq = new Groq({
    apiKey: process.env.groqkey,
});

async function expencereader(expence, msg) {
    try {

        console.log("MSG:", msg);

        const messages = [
            {
                role: "system",
                content: `
                You are a helpful expense assistant.

                Rules:
                - For greetings, general chat, or unrelated questions, respond normally.
                - Only use expense tools when the user asks about expenses, spending, reports, monthly reports, yearly reports, or expense analysis.
                `
            },
            {
                role: "user",
                content: msg
            }
        ];

        const expenseKeywords = [
            "expense",
            "expenses",
            "spending",
            "report",
            "monthly",
            "yearly",
            "date wise",
            "transaction"
        ];

        const isExpenseQuery = expenseKeywords.some(keyword =>
            msg.toLowerCase().includes(keyword)
        );

        if (isExpenseQuery) {

            messages.push({
                role: "system",
                content: `
                Expense Data:

                ${JSON.stringify(expence, null, 2)}

                Use this data whenever the user asks for expense information.
                `
            });

        }

        console.log("Expense Query:", isExpenseQuery);
        console.log(JSON.stringify(messages, null, 2));

        const requestBody = {
            model: "llama-3.3-70b-versatile",
            messages
        };

        if (isExpenseQuery) {
            requestBody.tools = tools;
        }

        const response = await groq.chat.completions.create(requestBody);

        const toolCalls = response.choices[0].message.tool_calls;

        if (toolCalls?.length) {

            const tool = toolCalls[0];

            if (tool.function.name === "GetExpence") {

                const args = JSON.parse(tool.function.arguments);

                const result = await GetExpence(
                    expence,
                    args.filterType,
                    args.value
                );

                console.log(result);
                return {
                    type: "message",
                    data: result
                };
            }
        }
        return {
            type: "message",
            data: response.choices[0].message.content
        };

    } catch (error) {
        console.error("Reading Problem:", error);
        throw error;
    }
}

export default expencereader;
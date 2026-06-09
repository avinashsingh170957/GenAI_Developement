import Ollama from "ollama";
import fs from "fs/promises";

import {
    AddExpence,
    GetExpence
} from "../functions/expencefun.js";

function parseAIResponse(content) {

    try {

        const cleaned = content
            .replace(/```json/gi, "")
            .replace(/```/g, "")
            .trim();

        const match = cleaned.match(/\{[\s\S]*\}/);

        if (!match) {
            return {
                name: "CHAT",
                message: cleaned
            };
        }

        return JSON.parse(match[0]);

    } catch {

        return {
            name: "CHAT",
            message: content
        };
    }
}

const tools = {
    AddExpence,
    GetExpence
};

async function chat(userQuestion) {

    try {

        const today =
            new Date().toISOString().split("T")[0];

        const toolSelector = await Ollama.chat({
            model: "qwen2.5-coder:latest",
            messages: [
                {
                    role: "system",
                    content: `
You are an Expense Assistant.

Today's date is ${today}.

Available Tools:

1. AddExpence

Arguments:
{
    "name": "string",
    "amount": number
}

2. GetExpence

Arguments:
{
    "days": number,
    "search": "string"
}

Rules:

- Use AddExpence when user wants to save an expense.
- Use GetExpence when user wants expense history.

Examples:

"show last 5 days expenses"

{
    "name":"GetExpence",
    "arguments":{
        "days":5
    }
}

"show previous 30 days expenses"

{
    "name":"GetExpence",
    "arguments":{
        "days":30
    }
}

"how much did I spend on mobile"

{
    "name":"GetExpence",
    "arguments":{
        "days":30,
        "search":"mobile"
    }
}

"how much did I spend on electricity"

{
    "name":"GetExpence",
    "arguments":{
        "days":30,
        "search":"electricity"
    }
}
"what is expence details for mobile"
{
    "name":"GetExpence",
    "arguments":{
        "search":"mobile"
    }
}
"what is total expence details"
{
    "name":"GetExpence",
    "arguments":{
        "search":"total"
    }
}
"spent 500 on petrol"

{
    "name":"AddExpence",
    "arguments":{
        "name":"petrol",
        "amount":500
    }
}

If no tool is required:

{
    "name":"CHAT",
    "message":"response"
}

Always return valid JSON only.
`
                },
                {
                    role: "user",
                    content: userQuestion
                }
            ]
        });

        console.log(
            "Tool Selection Response:",
            toolSelector.message.content
        );

        const aiResponse = parseAIResponse(
            toolSelector.message.content
        );

        if (aiResponse.name === "CHAT") {

            return {
                success: true,
                message: aiResponse.message
            };
        }

        const fn = tools[aiResponse.name];

        if (!fn) {

            return {
                success: true,
                message:
                    toolSelector.message.content
            };
        }

        let toolArgs =
            aiResponse.arguments || {};

        console.log(`toolArgs`, toolArgs);

        if (aiResponse.name === "GetExpence") {
            if (!toolArgs.search) {
                const days = Number(
                    toolArgs.days || 30
                );

                const to = new Date();
                const from = new Date();

                from.setDate(
                    from.getDate() - (days - 1)
                );

                toolArgs = {
                    from: from
                        .toISOString()
                        .split("T")[0],
                    to: to
                        .toISOString()
                        .split("T")[0],
                    search:
                        toolArgs.search?.trim() || ""
                };

                console.log(
                    "Calculated Date Range:",
                    toolArgs
                );
            }
                 toolArgs = {
                      search: toolArgs.search?.trim() || ""
                 }
        }

        const toolResult =
            await fn(toolArgs);

        console.log(
            "Tool Result:",
            toolResult
        );

        if (aiResponse.name === "AddExpence") {

            return {
                success: true,
                message: `${toolArgs.name} expense of ₹${toolArgs.amount} added successfully.`,
                data: toolResult
            };
        }

        if (
            !toolResult ||
            (Array.isArray(toolResult) &&
                toolResult.length === 0)
        ) {

            return {
                success: true,
                message:
                    "No expenses found."
            };
        }

        // SPECIAL CASE:
        // how much did i spend on mobile

        if (toolArgs.search) {

            const total =
                toolResult.reduce(
                    (sum, row) =>
                        sum +
                        Number(
                            row.amount || 0
                        ),
                    0
                );

            return {
                success: true,
                message: `You spent ₹${total.toFixed(
                    2
                )} on ${toolArgs.search}.`,
                data: toolResult
            };
        }

        const finalAnswer =
            await Ollama.chat({
                model: "qwen2.5-coder:latest",
                messages: [
                    {
                        role: "system",
                        content: `
You are a helpful Expense Assistant.

Rules:

- Answer naturally.
- Never mention SQL.
- Never mention database.
- Never mention tool calls.
- Use only the provided expense data.
`
                    },
                    {
                        role: "user",
                        content: `
User Question:
${userQuestion}

Expense Data:
${JSON.stringify(
                            toolResult,
                            null,
                            2
                        )}
`
                    }
                ]
            });

        return {
            success: true,
            message:
                finalAnswer.message.content,
            data: toolResult
        };

    } catch (error) {

        console.error(
            "Error:",
            error
        );

        try {

            await fs.appendFile(
                "./logs/err_log.txt",
                JSON.stringify(
                    {
                        error:
                            error.message,
                        datetime:
                            new Date().toISOString()
                    },
                    null,
                    2
                ) + "\n\n",
                "utf8"
            );

        } catch (logError) {

            console.error(
                "Logging Error:",
                logError
            );
        }

        return {
            success: false,
            message:
                error.message ||
                "Something went wrong."
        };
    }
}

export default chat;
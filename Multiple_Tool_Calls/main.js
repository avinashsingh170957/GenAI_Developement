import Ollama from "ollama";
import { stdin, stdout } from "process";
import readline from "readline/promises";
import tools from "./tools/tool.js";
import messages from "./systemPrompt/systemPrompt.js";
import Marketinfo from "./functions/Marketinfo.js";
import weather_fn from "./functions/Weather_fn.js";

async function main() {
    const RL = readline.createInterface({
        input: stdin,
        output: stdout
    });
    while (true) {
        const question = await RL.question("enter your question ");
        console.log(`questions`, question);
        if (question.toLowerCase().includes("bye", "exit", "stop it")) {
            break;
        }
        messages.push({
            role: "user",
            content: question
        })
        const response = await Ollama.chat({
            model: "llama3.1",
            tools: tools,
            messages: messages
        });
        // console.log(JSON.stringify(response));

        const tools_fn = await response.message.tool_calls;
        //console.log(`tool_fn`, tools_fn);
        let Answer = [];
        if (tools_fn.length > 0) {
            for (const tools of tools_fn) {
                const tool_name = tools.function.name;
                const tool_param = tools.function.arguments;
                if (tool_name == "Get_Weather") {
                    //console.log(`Weather function call`);
                    const response_weather = await weather_fn(tool_param);
                    await Answer.push(response_weather);
                } else if (tool_name == "Get_Goldprice") {
                    //console.log(`Gold function call`);
                    const response_gold = await Marketinfo(tool_param);
                    await Answer.push(response_gold);
                } else {
                    console.log(`No functions available !`);
                }
            }
        }else {
            console.log(response.message.content);            
        }
        console.log(Answer);
        console.log(`------------------------`);
    }
    RL.close();
}

main();
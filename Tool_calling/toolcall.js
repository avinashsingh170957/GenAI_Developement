import Ollama from "ollama";
import tools from "./setting.js";
import getWeather from "./toll_function.js";
import readline from "readline/promises";
import { stdin as input, stdout as output } from "process";

async function toolcalls() {
  const rl = readline.createInterface({
    input,
    output,
  });

  while (true) {
    const question = await rl.question("You: ");
    if (question === "exit") {
      break;
    }
    
    const messege = [
        {
            role : 'system',
            content : `you are smart search tool.
            you have following tool access 
            when question is about wheather then call weather_tool
            `
        },
        {
            role : "user",
            content : question
        }
    ]
    const response = await Ollama.chat({
        model : "qwen2.5:3b",
        tools : tools,
        messages : messege
    });
    if (response.message.tool_calls?.length > 0) {
        const functionname = response.message.tool_calls[0].function.name;
        const functionparms = response.message.tool_calls[0].function.arguments;
        if (functionname=="get_weather") {
            const fn_response = getWeather(functionparms);
            console.log(`Wheather details is ` , fn_response);
        }
    }
    else
    {
        console.log(response.message.content);
    }
    
  }

  rl.close();
}

toolcalls();
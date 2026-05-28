import { response } from "express";
import Ollama from "ollama";
import Groq from "groq-sdk";
const groq = new Groq({
  apiKey: process.env.groqkey,
});
//console.log(process.env.groqkey);

const message = [
    {
        role: "system",
        content: `you are smart expence assistance !.
        users are provide his expence details you can analise.`
    }
]

async function expencereader(expence) {
    return new Promise(async (resolve,reject)=>{
try {
        message.push({
            role: 'user',
            content: `
                Analyze this expense data and give:
                1. Total expense
                2. Category wise summary
                3. Highest expense
                4. Spending insights
                Data:
                ${JSON.stringify(expence, null, 2)}`
        });
        console.log(message);
        
        const response = await groq.chat.completions.create({
                model: "llama-3.3-70b-versatile",
                messages: message
                });
        //console.log(response.choices[0].message.content);
        resolve(response.choices[0].message.content)

    } catch (error) {
        console.log(`Reading Problem`, error);
        reject(error)
    }
    })    
}

export default expencereader;
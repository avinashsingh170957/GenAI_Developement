import { GoogleGenAI } from "@google/genai";
import  dotenv from "dotenv";
dotenv.config();
console.log('env key',process.env.GEMINI_API_KEY);

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});
export async function embedingsmodel(params) {
 
}
export async function Chatmodel(msg) {
    if (!msg) {
        throw new Error("Message is required");
    }

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-lite",
        contents: String(msg),
    });

    return response.text;
}
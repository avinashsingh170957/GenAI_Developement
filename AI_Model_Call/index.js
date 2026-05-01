import Ollama from "ollama";

async function call_model(msg){
 const response = await Ollama.chat(
    {
        model : "phi3:mini",
        messages : [{
            role : "user",
            content : msg
        }]
    }
 )
 console.log("response",response.message.content);
 return;
 
}

call_model("hello how are you");
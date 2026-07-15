import Ollama from "ollama";
import path from 'node:path'
const image_path = path.join("image","content_img.jpg");
console.log(`image path`,image_path);

async function call_set(params) {
    const response = await Ollama.chat({
        model : 'llava',
        messages : [
            {
                role : 'user',
                content : 'describe this image',
                images : [image_path]
            }
        ]
    });
    console.log(`response`, response);
    
}

call_set();
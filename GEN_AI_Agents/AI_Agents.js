import { stdin, stdout } from 'node:process'
import Realine from 'node:readline/promises'
import AI_Model_Communication from './models/AI_Model_Communication.js';

async function main() {
    const r1 = Realine.createInterface({
        input: stdin,
        output: stdout
    });
    while (true) {
        const questions = await r1.question("Enter your expence details ");
       const response = await AI_Model_Communication(questions);     
        if (questions.toLowerCase()==='exit') {
            break;
        }
        console.log(`Question is` , questions);        
        console.log(`Response is` , response); 
        console.log("\n");
               
    }
    r1.close();
}

main();
import { stdin, stdout } from "node:process";
import configDotenv from "dotenv";
configDotenv.config();
import Readline from "node:readline/promises";
import embeddings from "./functions/embedding.js";
const RL = Readline.createInterface({
    input: stdin,
    output: stdout
});

async function Main() {
    while (true) {
        const question = await RL.question(
`Enter your Choice :-
Press 1 for creating embedding files.
Press 2 for chat (Questions & Answer)

Choice: `
        );

        console.log("Question:", question);
        console.log("\n");
        
        if (question === "1") {
            console.log("Create Embedding selected");
           const workmsg = await embeddings(RL);
           if (workmsg == 'Pdf file does not exist') {
            console.log('File not exist !')  
            console.log(`First add atleat one pdf file in pdf folder`);
              console.log('Then again start this process..')
              RL.close();
              return;
           }
           console.log(`embeding Status :-` , workmsg);
           console.log("\n");
        }
        else if (question === "2") {
            console.log("Chat selected");
        }
        else {
            console.log("Wrong Choice!");
        }
    }
}

Main();
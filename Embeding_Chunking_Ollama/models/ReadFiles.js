import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Readline from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import embeding from '../embeding_fn/embedingfn.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const filepath = path.join(__dirname,"..","files");
const Files = [];

const RL = Readline.createInterface({
    input : stdin,
    output : stdout
});

async function Readfile(params) {
   const files_list = await List_files();
   await File_select_Embeding();
}

async function List_files() {
   const files = await fs.readdir(filepath);
   for (let index = 0; index < files.length; index++) {
    const element = files[index];
    Files.push(`${index+1} ${element}`);
   }
   return files;
}

async function File_select_Embeding() {
    let useroptions = true;
    while (useroptions==true) {
    
   console.log("file list",Files);
    const question = await RL.question("Select file for embedding: ");

    console.log("question:", question);
    console.log(`Selected file is ${Files[Number(question) - 1]}`);
 const finalselection = (await RL.question(
    "Are you sure you want to embed this file? (Y/N): "
)).trim().toLowerCase();

if (finalselection !== "y" && finalselection !== "n") {
    console.log("Wrong command!");
    //return;
}
    if (finalselection === "y") {
    console.log("Embedding & chunking start...");
    const file_name = Files[Number(question) - 1] 
    await embeding(file_name)
    useroptions = false;
} else {
    console.log("Embedding cancelled.");
}
}
    
    RL.close();
}
export default Readfile;
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Readline from "node:readline/promises";
import { stdin, stdout } from "node:process";

async function Readfiles(RL) {
    try {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);

        const pdfFolder = path.join(__dirname, "..", "pdf_files");

        const files = await fs.readdir(pdfFolder);
        const selected_file = await CheckEmbFile(files,RL);
        return selected_file;
    } catch (error) {
        console.error("Folder Reading Error:", error);
        return [];
    }
}
async function CheckEmbFile(files,RL) {

console.log("\nAvailable PDF Files:\n");

files.forEach((file, index) => {
    console.log(`${index + 1}. ${file}`);
});

const choice = Number(
    await RL.question("\nSelect a file number: ")
);

if (Number.isNaN(choice) || choice < 1 || choice > files.length) {
    console.log("Invalid selection.");
    return;
}

const selectedFile = files[choice - 1];
console.log("Selected File:", selectedFile);
return selectedFile;
}
export default Readfiles;
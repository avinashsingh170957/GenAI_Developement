import fs from "fs";

const env = {};

const content = fs.readFileSync("../.env", "utf8");

content.split("\n").forEach(line => {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) return;

    const [key, ...value] = trimmed.split("=");

    env[key.trim()] = value.join("=").trim();
});

export default env;
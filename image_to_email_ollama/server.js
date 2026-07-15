const express = require("express");
const path = require("path");
const cors = require("cors");
const dotenv = require("dotenv");
const tesseract = require("node-tesseract-ocr");
const sharp = require("sharp");
const fs = require("fs");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.use(express.static(path.join(__dirname, "public")));

app.use(
    express.raw({
        type: "*/*",
        limit: "20mb",
    })
);

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

const config = {
    lang: "eng",
    oem: 3,
    psm: 11,
    preserve_interword_spaces: 1,
};

app.post("/process-img", async (req, res) => {
    try {
        if (!req.body || req.body.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No image received",
            });
        }

        const uploadDir = path.join(__dirname, "uploads");

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }

        const originalPath = path.join(uploadDir, "image.png");
        const processedPath = path.join(uploadDir, "processed.png");

        fs.writeFileSync(originalPath, req.body);

        // Improve image quality for OCR
        await sharp(originalPath)
            .resize({
                width: 2000,
                withoutEnlargement: false,
            })
            .grayscale()
            .normalize()
            .sharpen()
            .png()
            .toFile(processedPath);

        const text = await tesseract.recognize(processedPath, config);

        console.log("OCR Result:");
        console.log(text);

        res.json({
            success: true,
            text,
        });
    } catch (err) {
        console.error(err);

        res.status(500).json({
            success: false,
            error: err.message,
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server Started : http://localhost:${PORT}`);
});
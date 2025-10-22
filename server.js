import express from "express";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";
import cors from "cors";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// 🔹 1. Enable CORS globally
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
}));

// 🔹 2. Ensure uploads folder exists
const uploadsPath = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsPath)) fs.mkdirSync(uploadsPath);

// 🔹 3. Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsPath),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, uuidv4() + ext);
  },
});
const upload = multer({ storage });

// 🔹 4. Manual static file serving with CORS headers
app.get("/uploads/:file", (req, res) => {
  const filePath = path.join(uploadsPath, req.params.file);
  if (fs.existsSync(filePath)) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    res.sendFile(filePath);
  } else {
    res.status(404).send("File not found");
  }
});

// 🔹 5. Upload route
app.post("/upload", upload.single("image"), (req, res) => {
  const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  res.send(`
    <h2>✅ Upload successful!</h2>
    <p><a href="${fileUrl}" target="_blank">${fileUrl}</a></p>
    <img src="${fileUrl}" width="300" />
  `);
});

app.listen(PORT, () =>
  console.log(`🚀 Server running at http://localhost:${PORT}`)
);

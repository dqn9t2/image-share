import express from "express";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Ensure uploads folder exists
if (!fs.existsSync(path.join(__dirname, "uploads"))) {
  fs.mkdirSync(path.join(__dirname, "uploads"));
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, uuidv4() + ext);
  },
});

const upload = multer({ storage });

app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

app.post("/upload", upload.single("image"), (req, res) => {
  const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  res.send(`
    <h2>✅ Upload successful!</h2>
    <p><a href="${fileUrl}" target="_blank">${fileUrl}</a></p>
    <img src="${fileUrl}" width="300" />
  `);
});

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));

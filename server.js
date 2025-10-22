import express from "express";
import multer from "multer";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

const app = express();
const PORT = process.env.PORT || 3000;

// Enable global CORS (all routes + static)
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

// handle preflight OPTIONS request
app.options("*", (req, res) => res.sendStatus(200));

// create uploads folder if not exist
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// serve static files with CORS headers
app.use(
  "/uploads",
  express.static(uploadDir, {
    setHeaders: (res) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
    },
  })
);

// setup multer for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, uuidv4() + ext);
  },
});
const upload = multer({ storage });

// homepage with upload form
app.get("/", (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Image Share</title>
        <style>
          body { font-family: sans-serif; display: flex; flex-direction: column; align-items: center; margin-top: 80px; }
          form { display: flex; flex-direction: column; gap: 10px; width: 300px; border: 1px solid #ccc; padding: 20px; border-radius: 10px; }
          input[type=file], button { padding: 10px; }
        </style>
      </head>
      <body>
        <h2>Upload Image</h2>
        <form id="uploadForm" enctype="multipart/form-data">
          <input type="file" name="image" accept="image/*" required />
          <button type="submit">Upload</button>
        </form>
        <p id="link"></p>

        <script>
          const form = document.getElementById('uploadForm');
          form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const data = new FormData(form);
            const res = await fetch('/upload', { method: 'POST', body: data });
            const json = await res.json();
            document.getElementById('link').innerHTML = 
              '<a href="' + json.url + '" target="_blank">' + json.url + '</a>';
          });
        </script>
      </body>
    </html>
  `);
});

// upload endpoint
app.post("/upload", upload.single("image"), (req, res) => {
  const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  res.json({ url: imageUrl });
});

// start server
app.listen(PORT, () => console.log(`🚀 Image Share running at http://localhost:${PORT}`));

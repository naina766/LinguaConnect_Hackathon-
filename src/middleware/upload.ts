// src/middleware/upload.ts
import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure uploads folder exists
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || ".webm";
    cb(null, Date.now() + "-" + Math.round(Math.random() * 1e9) + ext);
  }
});

// ❗ NO FILTER — allow all audio/webm
// (MediaRecorder ALWAYS produces .webm audio)
export const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
});

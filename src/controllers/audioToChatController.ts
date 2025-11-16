// controllers/audioChatController.ts
import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { sendResponse } from "../utils/responseHandler";
import { sendAudioToLingo } from "../services/lingoService";

export const audioToChat = async (req: Request, res: Response) => {
  try {
    // multer should have placed file on req.file
    const file = (req as any).file;
    if (!file) return sendResponse(res, 400, "Audio file required");

    const tmpPath = file.path; // e.g. uploads/...
    const language = req.body.language || req.body.lang;

    const reply = await sendAudioToLingo(tmpPath, language);
    // optionally persist conversation/message

    // cleanup
    try { fs.unlinkSync(tmpPath); } catch {}

    sendResponse(res, 200, "OK", { reply });
  } catch (err: any) {
    console.error("❌ audioToChat error:", err?.message || err);
    sendResponse(res, 500, "Audio chat failed", { message: err?.message || String(err) });
  }
};

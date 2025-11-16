// src/controllers/audioChatController.ts
import { Request, Response } from "express";
import { promises as fs } from "fs";
import { transcribeAudio } from "../services/audioService";
import { generateReply } from "../services/chatbotService";
import { detectLanguage, mapToNLLB } from "../services/detectService";
import { translateText } from "../services/translationService";
import { sendResponse } from "../utils/responseHandler";

async function safeTranslate(text: string, from: string, to: string): Promise<string> {
  if (!text) return "";
  if (from === to) return text;

  try {
    const t = await translateText(text, from, to);
    return t?.translated ?? text;
  } catch {
    return text;
  }
}

export const audioToChat = async (req: Request, res: Response) => {
  const file = req.file as Express.Multer.File;

  console.log("REQ FILE:", file);

  if (!file) {
    return sendResponse(res, 400, "Audio file missing");
  }

  try {
    // 1️⃣ Transcribe audio
    const transcription = await transcribeAudio(file.path);

    if (!transcription) {
      await fs.unlink(file.path).catch(() => {});
      return sendResponse(res, 500, "Failed to transcribe audio");
    }

    // 2️⃣ Detect language
    const detectedIso = detectLanguage(transcription) || "en";
    const userLangInput = req.body.language || detectedIso;

    const userIso = userLangInput.split("_")[0];
    const userNLLB = mapToNLLB(userIso);
    const botNLLB = mapToNLLB("en");

    // 3️⃣ Translate to English for bot
    const textForBot = await safeTranslate(transcription, userNLLB, botNLLB);

    // 4️⃣ Bot reply
    let botReply = await generateReply(textForBot);
    botReply = botReply || "Hi! Could you repeat that audio?";

    // 5️⃣ Translate back to user language
    const botReplyTranslated = await safeTranslate(botReply, botNLLB, userNLLB);

    // 6️⃣ Cleanup file
    await fs.unlink(file.path).catch(() => {});

    return sendResponse(res, 200, "Success", {
      transcription,
      detectedLanguage: userIso,
      botReplyOriginal: botReply,
      botReplyTranslated,
    });

  } catch (err: any) {
    console.error("audioToChat error:", err);
    await fs.unlink(file.path).catch(() => {});
    return sendResponse(res, 500, "Audio to chat failed", err.message);
  }
};

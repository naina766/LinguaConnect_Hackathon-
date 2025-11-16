// controllers/chatbotController.ts
import { Request, Response } from "express";
import { generateLingoReply } from "../services/lingoService";
import { sendResponse } from "../utils/responseHandler";

export const reply = async (req: Request, res: Response) => {
  try {
    const { question, conversationId, language } = req.body;
    if (!question) return sendResponse(res, 400, "Question required");

    // build prompt with context if you want (conversationId, language)
    let prompt = question;
    if (language) prompt = `Language:${language}\n${prompt}`;

    const replyText = await generateLingoReply(prompt, { conversationId, language });
    sendResponse(res, 200, "OK", { reply: replyText });
  } catch (err: any) {
    console.error("❌ /api/chatbot/reply error:", err?.message || err);
    sendResponse(res, 500, "Chatbot failed to generate reply", { message: err?.message || String(err) });
  }
};

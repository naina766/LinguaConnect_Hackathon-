// import express from "express";
// import { generateReply } from "../services/chatbotService";
// import { sendResponse } from "../utils/responseHandler";

// const router = express.Router();

// router.post("/reply", async (req, res) => {
//   try {
//     const { question } = req.body;
//     if (!question) return sendResponse(res, 400, "Question required");

//     const reply = await generateReply(question);

//     sendResponse(res, 200, "OK", { reply });
//   } catch (err: any) {
//     console.error("❌ Error in /reply route:", err.message);
//     sendResponse(res, 500, "Chatbot failed to generate reply", { error: err.message });
//   }
// });

// export default router;

import express from "express";
import { generateReply } from "../services/chatbotService";

const router = express.Router();

router.post("/reply", async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ reply: "Question required" });
    }

    const reply = await generateReply(question);

    // ⭐ Send exactly what frontend expects
    return res.status(200).json({ reply });
  } catch (err: any) {
    console.error("❌ Error in /reply:", err.message);
    return res.status(500).json({
      reply: "Chatbot failed to generate reply",
      error: err.message,
    });
  }
});

export default router;

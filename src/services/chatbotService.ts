import Groq from "groq-sdk";

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

if (!process.env.GROQ_API_KEY) {
  console.error("❌ Missing GROQ_API_KEY in .env");
  throw new Error("Missing GROQ_API_KEY");
}

export const generateReply = async (question: string) => {
  try {
    const chatCompletion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile", // ✅ VALID MODEL
      messages: [
        { role: "system", content: "You are a helpful AI assistant." },
        { role: "user", content: question },
      ],
      temperature: 0.7,
      max_tokens: 300, // ✅ Groq supports max_tokens, NOT max_completion_tokens
    });

    return chatCompletion.choices[0]?.message?.content || "No reply";
  } catch (err: any) {
    console.error("❌ Error generating reply via Groq:", err.response?.data || err);
    return "Sorry, I could not generate a reply.";
  }
};


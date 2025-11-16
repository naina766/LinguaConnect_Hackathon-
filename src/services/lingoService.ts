// services/lingoService.ts
import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import { execFile } from "child_process";
import util from "util";

const execFileAsync = util.promisify(execFile);

const LINGO_URL = process.env.LINGO_MODEL_API_URL;
const LINGO_KEY = process.env.LINGO_API_KEY;
const LINGO_CLI = process.env.LINGO_CLI_PATH;

type LingoResponse = { reply?: string; raw?: any };

export async function callLingoRest(prompt: string, opts: Record<string, any> = {}): Promise<LingoResponse> {
  if (!LINGO_URL || !LINGO_KEY) throw new Error("Lingo REST url/key not configured");
  try {
    const payload = {
      input: prompt,
      ...opts,
    };

    // adapt to typical REST shape — you may need to tweak this object for your Lingo plan
    const res = await axios.post(LINGO_URL, payload, {
      headers: {
        Authorization: `Bearer ${LINGO_KEY}`,
        "Content-Type": "application/json",
      },
      timeout: 120000,
    });

    // Attempt to normalize reply locations
    const data = res.data ?? {};
    const reply =
      data.reply ||
      data.output ||
      data.text ||
      data.choices?.[0]?.text ||
      data.choices?.[0]?.message?.content ||
      data.result;

    return { reply: reply ? String(reply) : undefined, raw: data };
  } catch (err: any) {
    // bubble up for caller to fallback
    throw err;
  }
}

export async function callLingoCli(prompt: string): Promise<LingoResponse> {
  if (!LINGO_CLI) throw new Error("Lingo CLI path not configured");
  try {
    // Example: `lingo --model my-model --input "hello"`
    // Adjust CLI args to how your lingo cli works
    const { stdout } = await execFileAsync(LINGO_CLI, ["--input", prompt], { timeout: 120000 });
    // CLI typically prints JSON or plain text
    try {
      const parsed = JSON.parse(stdout);
      const reply = parsed.reply || parsed.output || parsed.text;
      return { reply: reply ? String(reply) : undefined, raw: parsed };
    } catch {
      return { reply: String(stdout).trim(), raw: stdout };
    }
  } catch (err: any) {
    throw err;
  }
}

/**
 * Top-level helper: try REST then CLI fallback
 */
export async function generateLingoReply(prompt: string, opts: Record<string, any> = {}): Promise<string> {
  // 1) Try REST first
  if (LINGO_URL) {
    try {
      const r = await callLingoRest(prompt, opts);
      if (r.reply) return r.reply;
    } catch (err) {
      console.warn("Lingo REST failed:", err?.message || err);
      // fallthrough to CLI
    }
  }

  // 2) CLI fallback
  if (LINGO_CLI) {
    try {
      const r = await callLingoCli(prompt);
      if (r.reply) return r.reply;
    } catch (err) {
      console.warn("Lingo CLI failed:", err?.message || err);
    }
  }

  throw new Error("All Lingo backends failed to generate a reply");
}

/**
 * Upload audio file to Lingo REST (multipart/form-data).
 * Note: adapt field names to Lingo API (I use 'file' & 'language' as a common pattern).
 */
export async function sendAudioToLingo(filePath: string, language?: string): Promise<string> {
  if (!LINGO_URL || !LINGO_KEY) throw new Error("Lingo REST url/key not configured for audio");

  const url = `${LINGO_URL.replace(/\/$/, "")}/audio` ; // may need to change to the exact audio endpoint
  const form = new FormData();
  form.append("file", fs.createReadStream(filePath));
  if (language) form.append("language", language);

  const res = await axios.post(url, form, {
    headers: {
      Authorization: `Bearer ${LINGO_KEY}`,
      ...form.getHeaders(),
    },
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
    timeout: 2 * 60 * 1000,
  });

  const data = res.data ?? {};
  const reply =
    data.reply ||
    data.text ||
    data.output ||
    data.transcript ||
    data.message ||
    data.result ||
    data.choices?.[0]?.text;

  return reply ? String(reply) : "";
}

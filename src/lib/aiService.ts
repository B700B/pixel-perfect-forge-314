import { toast } from "sonner";
import { getSettings, isLive, writeLS, SETTINGS_KEY } from "./storage";
import { refinePrompt } from "./prompts";

export interface ChatMsg {
  role: "user" | "assistant";
  content: string;
}

export interface RunOptions {
  system: string;
  user: string;
  /** Simulated response used in Demo Mode */
  demo: () => string;
  history?: ChatMsg[];
  onToken?: (textSoFar: string) => void;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function stream(text: string, onToken?: (t: string) => void) {
  if (!onToken) return;
  const tokens = text.split(/(\s+)/);
  const steps = Math.min(70, tokens.length);
  const per = Math.ceil(tokens.length / steps);
  for (let i = 0; i < tokens.length; i += per) {
    onToken(tokens.slice(0, i + per).join(""));
    await sleep(18);
  }
  onToken(text);
}

class AIError extends Error {}

async function callLive(o: RunOptions): Promise<string> {
  const s = getSettings();
  const msgs = [...(o.history ?? []), { role: "user" as const, content: o.user }];
  let res: Response;
  try {
    if (s.provider === "openai") {
      res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${s.apiKey}` },
        body: JSON.stringify({
          model: s.model || "gpt-4o-mini",
          messages: [{ role: "system", content: o.system }, ...msgs],
        }),
      });
    } else {
      const model = s.model || "gemini-1.5-flash";
      res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(s.apiKey)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: o.system }] },
            contents: msgs.map((m) => ({
              role: m.role === "assistant" ? "model" : "user",
              parts: [{ text: m.content }],
            })),
          }),
        },
      );
    }
  } catch {
    throw new AIError("Network error — couldn't reach the AI provider.");
  }
  if (res.status === 401 || res.status === 403 || res.status === 400) {
    const body = await res.text();
    if (res.status !== 400 || /key|auth|permission/i.test(body))
      throw new AIError("Your API key was rejected. Check it in Settings.");
    throw new AIError("The provider rejected the request. Check the model name.");
  }
  if (res.status === 404) throw new AIError("Model not found. Check the model name in Settings.");
  if (res.status === 429) throw new AIError("Rate limit or quota reached. Try again shortly.");
  if (!res.ok) throw new AIError(`AI provider error (${res.status}).`);
  const data = await res.json();
  const text =
    s.provider === "openai"
      ? data?.choices?.[0]?.message?.content
      : data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("");
  if (!text) throw new AIError("The AI returned an empty response.");
  return text as string;
}

export async function runAI(o: RunOptions): Promise<string> {
  const s = getSettings();
  if (!isLive(s)) {
    await sleep(500 + Math.random() * 500);
    const text = o.demo();
    await stream(text, o.onToken);
    return text;
  }
  try {
    const text = await callLive(o);
    await stream(text, o.onToken);
    return text;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Something went wrong.";
    toast.error(msg, {
      description: "You can switch to Demo Mode to keep working.",
      action: {
        label: "Use Demo Mode",
        onClick: () => writeLS(SETTINGS_KEY, { ...getSettings(), mode: "demo" }),
      },
    });
    throw e;
  }
}

/** Re-run with previous output as context */
export function runRefine(o: Omit<RunOptions, "user" | "demo"> & { previous: string; instruction: string }) {
  return runAI({
    ...o,
    user: refinePrompt(o.previous, o.instruction),
    demo: () => demoRefine(o.previous, o.instruction),
  });
}

// ---------- Demo helpers ----------
export function demoRefine(prev: string, instruction: string): string {
  const i = instruction.toLowerCase();
  let out = prev;
  if (/short|concise|brief|trim/.test(i)) {
    out = prev
      .split("\n\n")
      .map((p) => {
        if (/^(subject:|#|\||[-*\d])/i.test(p.trim())) return p;
        const sentences = p.match(/[^.!?]+[.!?]+/g);
        return sentences && sentences.length > 1 ? sentences.slice(0, Math.ceil(sentences.length / 2)).join("").trim() : p;
      })
      .join("\n\n");
  }
  if (/formal|professional/.test(i)) {
    const map: [RegExp, string][] = [
      [/\bHi\b/g, "Dear"], [/\bHey\b/g, "Dear"], [/\bThanks\b/g, "Thank you"],
      [/\bI'm\b/g, "I am"], [/\bcan't\b/g, "cannot"], [/\bdon't\b/g, "do not"],
      [/\bwon't\b/g, "will not"], [/\bI'd\b/g, "I would"], [/\blet's\b/gi, "let us"],
      [/\bit's\b/g, "it is"], [/\bCheers,?/g, "Kind regards,"], [/\bBest,/g, "Kind regards,"],
      [/!/g, "."], [/\bgreat\b/g, "excellent"], [/\bASAP\b/g, "at your earliest convenience"],
    ];
    map.forEach(([r, s]) => (out = out.replace(r, s)));
  }
  if (/friendl|warm|casual/.test(i)) {
    out = out.replace(/\bDear\b/g, "Hi").replace(/Kind regards,/g, "Best,");
  }
  if (/bullet|list/.test(i)) {
    out = out
      .split("\n\n")
      .map((p) => (/^(subject:|#|\||[-*\d])/i.test(p.trim()) ? p : (p.match(/[^.!?]+[.!?]+/g) ?? [p]).map((s) => `- ${s.trim()}`).join("\n")))
      .join("\n\n");
  }
  if (out === prev) {
    out = `${prev}\n\n> _Demo Mode note: refinement "${instruction}" is simulated. Add an API key in Settings for true AI refinement._`;
  }
  return out;
}

export const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;

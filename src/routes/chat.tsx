import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { MessagesSquare, Send, Trash2, Copy, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DisclaimerBanner, Markdown, PromptDetails } from "@/components/tool/shared";
import { PROMPTS } from "@/lib/prompts";
import { runAI } from "@/lib/aiService";
import { demoChat } from "@/lib/demo";
import { addHistory, useLocal } from "@/lib/storage";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "AI Chatbot — AI Workplace Assistant" },
      { name: "description", content: "Chat with an AI assistant about emails, planning, summaries and everyday work." },
      { property: "og:title", content: "AI Workplace Chatbot" },
      { property: "og:description", content: "Chat with an AI assistant about your everyday work." },
    ],
  }),
  component: ChatPage,
});

interface Msg { id: string; role: "user" | "assistant"; content: string; at: number }
const EMPTY: Msg[] = [];
const CHIPS = ["Draft a follow-up email", "Help me prioritize my week", "Summarize these notes", "How do I run a better 1:1?"];

function ChatPage() {
  const [msgs, setMsgs] = useLocal<Msg[]>("awpa.chat", EMPTY);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const [live, setLive] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [msgs, live, typing]);

  async function send(text: string) {
    const t = text.trim();
    if (!t || typing) return;
    const user: Msg = { id: crypto.randomUUID(), role: "user", content: t, at: Date.now() };
    const prior = msgs.slice(-12).map(({ role, content }) => ({ role, content }));
    setMsgs((m) => [...m, user]);
    setDraft("");
    setTyping(true);
    try {
      const reply = await runAI({
        system: PROMPTS.chat, user: t, history: prior,
        demo: () => demoChat(t, prior.length / 2 + 1),
        onToken: (s) => { setTyping(false); setLive(s); },
      });
      setMsgs((m) => [...m, { id: crypto.randomUUID(), role: "assistant", content: reply, at: Date.now() }]);
      addHistory({ tool: "chat", title: t.slice(0, 60), output: reply, minutesSaved: 3 });
    } catch { /* toast */ } finally { setTyping(false); setLive(null); }
  }

  const time = (n: number) => new Date(n).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-accent p-2.5 text-accent-foreground"><MessagesSquare className="h-5 w-5" /></div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">AI Chatbot</h1>
            <p className="text-sm text-muted-foreground">Your conversation is remembered on this device.</p>
          </div>
        </div>
        <Button variant="outline" size="sm" disabled={!msgs.length} onClick={() => { setMsgs([]); toast.success("Chat cleared"); }}><Trash2 /> Clear chat</Button>
      </header>

      <div className="flex h-[min(68vh,720px)] flex-col rounded-2xl border bg-card shadow-soft">
        <div className="flex-1 space-y-4 overflow-y-auto p-4" aria-live="polite">
          {msgs.length === 0 && !live && (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-primary-foreground"><Bot className="h-6 w-6" /></div>
              <p className="text-sm text-muted-foreground">Ask me anything about your workday, or try a quick prompt below.</p>
            </div>
          )}
          {msgs.map((m) => <Bubble key={m.id} m={m} time={time(m.at)} />)}
          {live !== null && <Bubble m={{ id: "live", role: "assistant", content: live, at: Date.now() }} time="now" />}
          {typing && (
            <div className="flex items-center gap-1 pl-10" aria-label="Assistant is typing">
              {[0, 1, 2].map((i) => <span key={i} className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: `${i * 0.15}s` }} />)}
            </div>
          )}
          <div ref={endRef} />
        </div>
        <div className="space-y-3 border-t p-3">
          <div className="flex flex-wrap gap-2">
            {CHIPS.map((c) => (
              <button key={c} onClick={() => send(c)} disabled={typing}
                className="rounded-full border bg-background px-3 py-1 text-xs transition hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50">
                {c}
              </button>
            ))}
          </div>
          <DisclaimerBanner />
          <form className="flex items-end gap-2" onSubmit={(e) => { e.preventDefault(); send(draft); }}>
            <Textarea aria-label="Message" rows={2} placeholder="Type a message… (Enter to send, Shift+Enter for new line)" value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(draft); } }}
              className="min-h-0 resize-none" />
            <Button type="submit" size="icon" className="h-10 w-10 shrink-0" aria-label="Send" disabled={!draft.trim() || typing}><Send /></Button>
          </form>
        </div>
      </div>
      <PromptDetails prompt={PROMPTS.chat} />
    </div>
  );
}

function Bubble({ m, time }: { m: Msg; time: string }) {
  const mine = m.role === "user";
  return (
    <div className={cn("flex gap-2", mine && "justify-end")}>
      {!mine && <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground"><Bot className="h-4 w-4" /></div>}
      <div className={cn("group max-w-[85%] space-y-1", mine && "items-end text-right")}>
        <div className={cn(mine ? "rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-left text-sm text-primary-foreground" : "pt-1")}>
          {mine ? <p className="whitespace-pre-wrap">{m.content}</p> : <Markdown>{m.content}</Markdown>}
        </div>
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <span className={cn(mine && "ml-auto")}>{time}</span>
          {!mine && (
            <button aria-label="Copy response" className="rounded p-0.5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => navigator.clipboard.writeText(m.content).then(() => toast.success("Copied"))}>
              <Copy className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

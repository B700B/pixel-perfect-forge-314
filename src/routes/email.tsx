import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, RefreshCw, Minimize2, Briefcase, Sparkles as _unused } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ToolLayout, Field, Segmented, LoadingState, EmptyState, ReviewGate, RateAndRefine } from "@/components/tool/shared";
import { PROMPTS } from "@/lib/prompts";
import { runAI, runRefine } from "@/lib/aiService";
import { demoEmail, type EmailInput } from "@/lib/demo";
import { addHistory } from "@/lib/storage";

void _unused;

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — AI Workplace Assistant" },
      { name: "description", content: "Generate professional emails with the right tone, audience and length in seconds." },
      { property: "og:title", content: "Smart Email Generator" },
      { property: "og:description", content: "Generate professional emails with the right tone, audience and length." },
    ],
  }),
  component: EmailPage,
});

const AUDIENCES = ["Client", "Manager", "Team", "Colleague"] as const;
const TONES = ["Formal", "Friendly", "Persuasive"] as const;
const LENGTHS = ["Short", "Medium", "Detailed"] as const;

function split(text: string) {
  const m = text.match(/^\s*\**subject:?\**\s*(.+)\n+([\s\S]*)$/i);
  return m ? { subject: m[1].trim(), body: m[2].trim() } : { subject: "", body: text.trim() };
}

function EmailPage() {
  const [form, setForm] = useState<EmailInput>({ purpose: "", recipient: "", audience: "Client", tone: "Formal", length: "Medium" });
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const full = subject ? `Subject: ${subject}\n\n${body}` : body;

  const userPrompt = () =>
    `Purpose/context: ${form.purpose}\nRecipient: ${form.recipient || "Not specified"}\nAudience: ${form.audience}\nTone: ${form.tone}\nLength: ${form.length}`;

  const apply = (t: string) => { const p = split(t); setSubject(p.subject); setBody(p.body); };

  async function run(refine?: string) {
    if (!refine && !form.purpose.trim()) return;
    setLoading(true);
    try {
      const onToken = (t: string) => { setLoading(false); setStreaming(true); apply(t); };
      const text = refine
        ? await runRefine({ system: PROMPTS.email, previous: full, instruction: refine, onToken })
        : await runAI({ system: PROMPTS.email, user: userPrompt(), demo: () => demoEmail(form), onToken });
      apply(text);
      addHistory({ tool: "email", title: split(text).subject || form.purpose.slice(0, 60), output: text, minutesSaved: 8 });
    } catch { /* toast shown */ } finally { setLoading(false); setStreaming(false); }
  }

  const has = !!body;
  return (
    <ToolLayout icon={Mail} title="Smart Email Generator" description="Describe what you need — get a ready-to-send draft." prompt={PROMPTS.email}
      input={
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); run(); }}>
          <Field label="Purpose / context" htmlFor="purpose">
            <Textarea id="purpose" rows={4} required placeholder="e.g. Follow up on the proposal we sent last week and ask for feedback"
              value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} />
          </Field>
          <Field label="Recipient name" htmlFor="recipient">
            <Input id="recipient" placeholder="e.g. Jordan" value={form.recipient} onChange={(e) => setForm({ ...form, recipient: e.target.value })} />
          </Field>
          <Segmented label="Audience" options={AUDIENCES} value={form.audience as (typeof AUDIENCES)[number]} onChange={(v) => setForm({ ...form, audience: v })} />
          <Segmented label="Tone" options={TONES} value={form.tone as (typeof TONES)[number]} onChange={(v) => setForm({ ...form, tone: v })} />
          <Segmented label="Length" options={LENGTHS} value={form.length as (typeof LENGTHS)[number]} onChange={(v) => setForm({ ...form, length: v })} />
          <Button type="submit" className="w-full" disabled={loading || streaming || !form.purpose.trim()}>
            <Mail /> Generate email
          </Button>
        </form>
      }
      output={
        loading ? <LoadingState label="Writing your email…" /> : !has ? <EmptyState icon={Mail} text="Your email draft will appear here. Fill in the purpose and hit Generate." /> : (
          <div className="space-y-4">
            <Field label="Subject" htmlFor="subj">
              <Input id="subj" value={subject} onChange={(e) => setSubject(e.target.value)} />
            </Field>
            <Field label="Body (editable)" htmlFor="body">
              <Textarea id="body" rows={14} value={body} onChange={(e) => setBody(e.target.value)} className="leading-relaxed" />
            </Field>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" disabled={streaming} onClick={() => run()}><RefreshCw /> Regenerate</Button>
              <Button size="sm" variant="outline" disabled={streaming} onClick={() => run("Make it shorter and more concise")}><Minimize2 /> Make shorter</Button>
              <Button size="sm" variant="outline" disabled={streaming} onClick={() => run("Make it more formal and professional")}><Briefcase /> More formal</Button>
            </div>
            <RateAndRefine busy={streaming} onRefine={run} />
            <ReviewGate content={full} filename="email" title={subject || "Email"} />
          </div>
        )
      }
    />
  );
}

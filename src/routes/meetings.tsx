import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { NotebookPen, Upload, FileText } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ToolLayout, Field, LoadingState, EmptyState, ReviewGate, RateAndRefine, Markdown } from "@/components/tool/shared";
import { PROMPTS } from "@/lib/prompts";
import { runAI, runRefine } from "@/lib/aiService";
import { demoMeeting } from "@/lib/demo";
import { addHistory } from "@/lib/storage";

export const Route = createFileRoute("/meetings")({
  head: () => ({
    meta: [
      { title: "Meeting Notes Summarizer — AI Workplace Assistant" },
      { name: "description", content: "Turn raw meeting notes into a summary, decisions and an action-item table." },
      { property: "og:title", content: "Meeting Notes Summarizer" },
      { property: "og:description", content: "Turn raw meeting notes into a summary, decisions and action items." },
    ],
  }),
  component: MeetingsPage,
});

const SAMPLE = `Weekly product sync
- Reviewed Q3 roadmap progress, onboarding redesign is 70% done
- Customer churn up slightly in SMB segment
- Team agreed to delay the pricing page update until after launch
- Priya will prepare the launch checklist by Friday
- Marcus to review support ticket trends
- Send updated designs to the client by next Tuesday
- Decided to run a beta with 20 customers`;

function MeetingsPage() {
  const [notes, setNotes] = useState("");
  const [out, setOut] = useState("");
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function run(refine?: string) {
    setLoading(true);
    try {
      const onToken = (t: string) => { setLoading(false); setStreaming(true); setOut(t); };
      const text = refine
        ? await runRefine({ system: PROMPTS.meeting, previous: out, instruction: refine, onToken })
        : await runAI({ system: PROMPTS.meeting, user: `Meeting notes:\n"""\n${notes}\n"""`, demo: () => demoMeeting(notes), onToken });
      setOut(text);
      addHistory({ tool: "meeting", title: notes.split("\n")[0].slice(0, 60) || "Meeting summary", output: text, minutesSaved: 15 });
    } catch { /* toast shown */ } finally { setLoading(false); setStreaming(false); }
  }

  function onFile(f?: File) {
    if (!f) return;
    if (!f.name.endsWith(".txt") && f.type !== "text/plain") return toast.error("Please upload a .txt file");
    f.text().then((t) => { setNotes(t); toast.success(`Loaded ${f.name}`); });
  }

  return (
    <ToolLayout icon={NotebookPen} title="Meeting Notes Summarizer" description="Paste raw notes — get structured minutes and action items." prompt={PROMPTS.meeting}
      input={
        <div className="space-y-4">
          <Field label="Raw meeting notes" htmlFor="notes">
            <Textarea id="notes" rows={14} placeholder="Paste your notes here…" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </Field>
          <div className="flex flex-wrap gap-2">
            <input ref={fileRef} type="file" accept=".txt,text/plain" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} aria-label="Upload .txt notes" />
            <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}><Upload /> Upload .txt</Button>
            <Button variant="ghost" size="sm" onClick={() => setNotes(SAMPLE)}><FileText /> Use sample notes</Button>
          </div>
          <Button className="w-full" disabled={loading || streaming || !notes.trim()} onClick={() => run()}>
            <NotebookPen /> Summarize meeting
          </Button>
        </div>
      }
      output={
        loading ? <LoadingState label="Reading your notes…" /> : !out ? <EmptyState icon={NotebookPen} text="Summary, decisions and action items will appear here." /> : (
          <div className="space-y-4">
            <Markdown>{out}</Markdown>
            <RateAndRefine busy={streaming} onRefine={run} />
            <ReviewGate content={out} filename="meeting-summary" title="Meeting Summary" />
          </div>
        )
      }
    />
  );
}

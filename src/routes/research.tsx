import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { BookOpenText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ToolLayout, Field, Segmented, LoadingState, EmptyState, ReviewGate, RateAndRefine, Markdown } from "@/components/tool/shared";
import { PROMPTS } from "@/lib/prompts";
import { runAI, runRefine } from "@/lib/aiService";
import { demoResearch, type ResearchInput } from "@/lib/demo";
import { addHistory } from "@/lib/storage";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "AI Research Assistant — AI Workplace Assistant" },
      { name: "description", content: "Simplify articles and reports into summaries, key insights, recommendations and a glossary." },
      { property: "og:title", content: "AI Research Assistant" },
      { property: "og:description", content: "Simplify articles and reports into summaries and key insights." },
    ],
  }),
  component: ResearchPage,
});

function ResearchPage() {
  const [form, setForm] = useState<ResearchInput>({ text: "", detail: "Quick", level: "Professional" });
  const [out, setOut] = useState("");
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);

  async function run(refine?: string) {
    setLoading(true);
    try {
      const onToken = (t: string) => { setLoading(false); setStreaming(true); setOut(t); };
      const text = refine
        ? await runRefine({ system: PROMPTS.research, previous: out, instruction: refine, onToken })
        : await runAI({
            system: PROMPTS.research,
            user: `Detail level: ${form.detail}\nExplain like I'm: ${form.level}\nSource text or topic:\n"""\n${form.text}\n"""`,
            demo: () => demoResearch(form), onToken,
          });
      setOut(text);
      addHistory({ tool: "research", title: form.text.slice(0, 60), output: text, minutesSaved: 20 });
    } catch { /* toast */ } finally { setLoading(false); setStreaming(false); }
  }

  return (
    <ToolLayout icon={BookOpenText} title="AI Research Assistant" description="Paste an article or report — or just a topic — and get the essentials." prompt={PROMPTS.research}
      input={
        <div className="space-y-4">
          <Field label="Article / report text or a topic" htmlFor="src">
            <Textarea id="src" rows={12} placeholder="Paste text here, or type a topic like 'remote work productivity'" value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} />
          </Field>
          <Segmented label="Detail level" options={["Quick", "Detailed"] as const} value={form.detail} onChange={(v) => setForm({ ...form, detail: v })} />
          <Segmented label="Explain like I'm" options={["Beginner", "Professional", "Expert"] as const} value={form.level} onChange={(v) => setForm({ ...form, level: v })} />
          <Button className="w-full" disabled={loading || streaming || !form.text.trim()} onClick={() => run()}>
            <BookOpenText /> Analyze
          </Button>
        </div>
      }
      output={
        loading ? <LoadingState label="Analyzing…" /> : !out ? <EmptyState icon={BookOpenText} text="Summary, insights, glossary and things to verify will appear here." /> : (
          <div className="space-y-4">
            <Markdown>{out}</Markdown>
            <RateAndRefine busy={streaming} onRefine={run} />
            <ReviewGate content={out} filename="research-summary" title="Research Summary" />
          </div>
        )
      }
    />
  );
}

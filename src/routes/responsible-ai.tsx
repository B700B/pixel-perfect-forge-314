import { createFileRoute } from "@tanstack/react-router";
import { Scale, AlertTriangle, Users, Lock, Eye, Brain, FlaskConical } from "lucide-react";

export const Route = createFileRoute("/responsible-ai")({
  head: () => ({
    meta: [
      { title: "Responsible AI — AI Workplace Productivity Assistant" },
      { name: "description", content: "Limitations, bias, privacy and human review: how to use this AI assistant responsibly." },
      { property: "og:title", content: "Responsible AI" },
      { property: "og:description", content: "Limitations, bias, privacy and human review guidance." },
    ],
  }),
  component: ResponsiblePage,
});

const SECTIONS = [
  { icon: Brain, title: "Limitations", body: "AI models predict plausible text — they don't understand your business or verify facts. Outputs can be incomplete, outdated or simply wrong, especially for niche topics, numbers and recent events." },
  { icon: AlertTriangle, title: "Bias & hallucination risks", body: "Models can reflect biases in their training data and may confidently invent details (\"hallucinate\"). Our prompts instruct the AI never to fabricate owners, deadlines or facts and to write \"Not specified\" instead — but always double-check." },
  { icon: Lock, title: "Data privacy", body: "Don't paste confidential, client, financial, health or other personal information. In Live mode, your text is sent directly from your browser to the AI provider you chose, under their terms. Use a personal or test API key." },
  { icon: Users, title: "Human in the loop", body: "You stay responsible for what you send. Copy, download and print are only enabled after you tick \"I have reviewed this output\" — a deliberate pause to check accuracy, tone and fairness." },
  { icon: Eye, title: "Transparency", body: "Each tool has a \"Prompt details\" panel showing the exact instructions given to the AI, including its role, constraints and output format. Nothing is hidden." },
  { icon: FlaskConical, title: "Demo Mode & your data", body: "Demo Mode responses are simulated from templates and your input — no real AI is involved. The app has no accounts and no server: history, chat, settings and your key are stored only in this browser and can be cleared anytime in Settings." },
];

function ResponsiblePage() {
  return (
    <div className="space-y-6">
      <header className="flex items-start gap-3">
        <div className="rounded-xl bg-accent p-2.5 text-accent-foreground"><Scale className="h-5 w-5" /></div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Responsible AI</h1>
          <p className="text-sm text-muted-foreground">AI is a helpful assistant, not a source of truth. Here's how to use it well.</p>
        </div>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        {SECTIONS.map((s) => (
          <section key={s.title} className="rounded-2xl border bg-card p-5 shadow-soft">
            <s.icon className="h-5 w-5 text-primary" aria-hidden />
            <h2 className="mt-3 font-semibold">{s.title}</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}

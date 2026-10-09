import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Clock, Lightbulb, Mail, NotebookPen, CalendarCheck, Activity } from "lucide-react";
import { TOOLS } from "@/components/app-sidebar";
import { useHistory, TOOL_LABELS } from "@/lib/storage";
import { EmptyState } from "@/components/tool/shared";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — AI Workplace Productivity Assistant" },
      { name: "description", content: "Your AI workspace: generate emails, summarize meetings, plan tasks and research faster." },
      { property: "og:title", content: "Dashboard — AI Workplace Productivity Assistant" },
      { property: "og:description", content: "Your AI workspace: generate emails, summarize meetings, plan tasks and research faster." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const [history] = useHistory();
  const count = (t: string) => history.filter((h) => h.tool === t).length;
  const saved = history.reduce((a, h) => a + h.minutesSaved, 0);
  const stats = [
    { label: "Emails generated", value: count("email"), icon: Mail },
    { label: "Meetings summarized", value: count("meeting"), icon: NotebookPen },
    { label: "Plans created", value: count("planner"), icon: CalendarCheck },
    { label: "Est. time saved", value: saved >= 60 ? `${(saved / 60).toFixed(1)}h` : `${saved}m`, icon: Clock },
  ];
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight">Welcome back</h1>
        <p className="mt-1 text-muted-foreground">What would you like to get done today?</p>
      </header>

      <section aria-label="Quick stats" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border bg-card p-4 shadow-soft">
            <s.icon className="h-4 w-4 text-primary" aria-hidden />
            <div className="mt-3 text-2xl font-bold">{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </section>

      <section aria-label="Tools" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {TOOLS.map((t) => (
          <Link key={t.url} to={t.url}
            className="group rounded-2xl border bg-card p-5 shadow-soft transition hover:-translate-y-0.5 hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-accent p-2.5 text-accent-foreground"><t.icon className="h-5 w-5" aria-hidden /></div>
              <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" aria-hidden />
            </div>
            <h2 className="mt-4 font-semibold">{t.title}</h2>
            <p className="text-sm text-muted-foreground">{t.desc}</p>
          </Link>
        ))}
      </section>

      <div className="grid gap-5 lg:grid-cols-3">
        <section className="rounded-2xl border bg-card p-5 shadow-soft lg:col-span-2">
          <h2 className="mb-3 flex items-center gap-2 font-semibold"><Activity className="h-4 w-4 text-primary" />Recent activity</h2>
          {history.length === 0 ? (
            <EmptyState text="Nothing yet. Try a tool above — your results will show up here." />
          ) : (
            <ul className="divide-y">
              {history.slice(0, 6).map((h) => (
                <li key={h.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <span className="truncate">{h.title}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">{TOOL_LABELS[h.tool]} · {new Date(h.createdAt).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          )}
          {history.length > 0 && <Link to="/history" className="mt-3 inline-block text-sm font-medium text-primary">View all history →</Link>}
        </section>
        <section className="rounded-2xl border bg-accent p-5 text-accent-foreground">
          <h2 className="mb-3 flex items-center gap-2 font-semibold"><Lightbulb className="h-4 w-4" />Tips for better results</h2>
          <ul className="space-y-2 text-sm">
            <li>• Be specific: include the goal, audience and any constraints.</li>
            <li>• Give context, e.g. "follow-up after Tuesday's demo".</li>
            <li>• Use <strong>Refine</strong> to iterate instead of starting over.</li>
            <li>• Never paste confidential or personal data.</li>
            <li>• Always review outputs before sharing.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}

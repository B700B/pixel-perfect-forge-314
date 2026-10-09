import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { History as HistoryIcon, Search, Trash2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState, Markdown, ReviewGate } from "@/components/tool/shared";
import { useHistory, TOOL_LABELS, type ToolId } from "@/lib/storage";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "History — AI Workplace Productivity Assistant" },
      { name: "description", content: "Search, filter and manage your past AI outputs, stored only in your browser." },
      { property: "og:title", content: "History — AI Workplace Assistant" },
      { property: "og:description", content: "Search, filter and manage your past AI outputs." },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const [history, setHistory] = useHistory();
  const [q, setQ] = useState("");
  const [tool, setTool] = useState<ToolId | "all">("all");
  const [open, setOpen] = useState<string | null>(null);
  const list = history.filter((h) => (tool === "all" || h.tool === tool) && (h.title + h.output).toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-accent p-2.5 text-accent-foreground"><HistoryIcon className="h-5 w-5" /></div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">History</h1>
            <p className="text-sm text-muted-foreground">{history.length} saved output{history.length === 1 ? "" : "s"} on this device.</p>
          </div>
        </div>
        <Button variant="outline" size="sm" disabled={!history.length} onClick={() => confirm("Delete all history?") && setHistory([])}><Trash2 /> Delete all</Button>
      </header>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input aria-label="Search history" className="pl-9" placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <select aria-label="Filter by tool" className="h-9 rounded-md border bg-background px-3 text-sm" value={tool} onChange={(e) => setTool(e.target.value as ToolId | "all")}>
          <option value="all">All tools</option>
          {Object.entries(TOOL_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>
      <div className="rounded-2xl border bg-card shadow-soft">
        {list.length === 0 ? <EmptyState icon={HistoryIcon} text={history.length ? "No matches." : "No history yet. Outputs from every tool are saved here automatically."} /> : (
          <ul className="divide-y">
            {list.map((h) => (
              <li key={h.id}>
                <div className="flex items-center gap-3 px-4 py-3">
                  <button className="flex min-w-0 flex-1 items-center gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                    aria-expanded={open === h.id} onClick={() => setOpen(open === h.id ? null : h.id)}>
                    <ChevronDown className={cn("h-4 w-4 shrink-0 transition", open === h.id && "rotate-180")} />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">{h.title || "Untitled"}</span>
                      <span className="text-xs text-muted-foreground">{TOOL_LABELS[h.tool]} · {new Date(h.createdAt).toLocaleString()}</span>
                    </span>
                  </button>
                  <Button variant="ghost" size="icon" aria-label="Delete entry" onClick={() => setHistory((l) => l.filter((x) => x.id !== h.id))}><Trash2 /></Button>
                </div>
                {open === h.id && (
                  <div className="space-y-3 px-11 pb-4">
                    <div className="rounded-lg bg-muted p-3"><Markdown>{h.output}</Markdown></div>
                    <ReviewGate content={h.output} filename={`${h.tool}-${h.id.slice(0, 6)}`} title={h.title} />
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

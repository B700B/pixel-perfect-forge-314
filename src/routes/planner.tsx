import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CalendarCheck, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToolLayout, Field, Segmented, LoadingState, EmptyState, ReviewGate, RateAndRefine, Markdown } from "@/components/tool/shared";
import { PROMPTS } from "@/lib/prompts";
import { runAI, runRefine } from "@/lib/aiService";
import { demoPlannerTips, type PlanTask } from "@/lib/demo";
import { addHistory } from "@/lib/storage";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "AI Task Planner — AI Workplace Assistant" },
      { name: "description", content: "Prioritize tasks with an Eisenhower matrix and get a time-blocked daily or weekly schedule." },
      { property: "og:title", content: "AI Task Planner & Scheduler" },
      { property: "og:description", content: "Eisenhower matrix, time-blocked schedule and productivity tips." },
    ],
  }),
  component: PlannerPage,
});

const Q = [
  { key: "q1", title: "Do first", sub: "Urgent · Important", u: "High", i: "High", color: "border-q1 text-q1" },
  { key: "q2", title: "Schedule", sub: "Not urgent · Important", u: "Low", i: "High", color: "border-q2 text-q2" },
  { key: "q3", title: "Delegate", sub: "Urgent · Not important", u: "High", i: "Low", color: "border-q3 text-q3" },
  { key: "q4", title: "Eliminate", sub: "Not urgent · Not important", u: "Low", i: "Low", color: "border-q4 text-q4" },
] as const;

const newTask = (name = "", duration = 60, u: "High" | "Low" = "High", i: "High" | "Low" = "High", deadline = ""): PlanTask =>
  ({ id: crypto.randomUUID(), name, duration, deadline, urgency: u, importance: i });

interface Block { day: string; start: string; end: string; label: string; quadrant: string }

const toMin = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + (m || 0); };
const toTime = (n: number) => `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;

function buildSchedule(tasks: PlanTask[], start: string, end: string, type: string) {
  const qi = (t: PlanTask) => Q.findIndex((q) => q.u === t.urgency && q.i === t.importance);
  const sorted = tasks.filter((t) => t.name.trim() && qi(t) !== 3)
    .sort((a, b) => qi(a) - qi(b) || (a.deadline || "9999").localeCompare(b.deadline || "9999"));
  const days = type === "Weekly" ? ["Mon", "Tue", "Wed", "Thu", "Fri"] : ["Today"];
  const blocks: Block[] = [];
  const overflow: PlanTask[] = [];
  let d = 0, cur = toMin(start);
  const endM = toMin(end);
  for (const t of sorted) {
    while (d < days.length && cur + t.duration > endM) { d++; cur = toMin(start); }
    if (d >= days.length || t.duration > endM - toMin(start)) { overflow.push(t); continue; }
    blocks.push({ day: days[d], start: toTime(cur), end: toTime(cur + t.duration), label: t.name, quadrant: Q[qi(t)].title });
    cur += t.duration;
    if (cur + 10 <= endM) { blocks.push({ day: days[d], start: toTime(cur), end: toTime(cur + 10), label: "Break", quadrant: "" }); cur += 10; }
  }
  return { blocks, overflow };
}

function PlannerPage() {
  const [tasks, setTasks] = useState<PlanTask[]>([
    newTask("Finish client proposal", 90, "High", "High"),
    newTask("Plan Q4 OKRs", 60, "Low", "High"),
    newTask("Reply to vendor emails", 30, "High", "Low"),
  ]);
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("17:00");
  const [type, setType] = useState<"Daily" | "Weekly">("Daily");
  const [plan, setPlan] = useState<{ blocks: Block[]; overflow: PlanTask[]; tasks: PlanTask[] } | null>(null);
  const [tips, setTips] = useState("");
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);

  const upd = (id: string, p: Partial<PlanTask>) => setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, ...p } : t)));
  const valid = tasks.filter((t) => t.name.trim());

  const userPrompt = () =>
    `Plan type: ${type}\nWorking hours: ${start}-${end}\nTasks:\n${valid.map((t) => `- ${t.name} | ${t.duration} min | deadline: ${t.deadline || "Not specified"} | urgency: ${t.urgency} | importance: ${t.importance}`).join("\n")}`;

  async function run(refine?: string) {
    setLoading(true);
    if (!refine) setPlan({ ...buildSchedule(valid, start, end, type), tasks: valid });
    try {
      const onToken = (t: string) => { setLoading(false); setStreaming(true); setTips(t); };
      const text = refine
        ? await runRefine({ system: PROMPTS.planner, previous: tips, instruction: refine, onToken })
        : await runAI({ system: PROMPTS.planner, user: userPrompt(), demo: () => demoPlannerTips(valid, start, end, type), onToken });
      setTips(text);
      if (!refine) addHistory({ tool: "planner", title: `${type} plan · ${valid.length} tasks`, output: userPrompt() + "\n\n" + text, minutesSaved: 10 });
    } catch { /* toast */ } finally { setLoading(false); setStreaming(false); }
  }

  const exportText = plan
    ? [
        `${type} plan (${start}–${end})`, "",
        "EISENHOWER MATRIX",
        ...Q.map((q) => `${q.title}: ${plan.tasks.filter((t) => t.urgency === q.u && t.importance === q.i).map((t) => t.name).join(", ") || "—"}`),
        "", "SCHEDULE",
        ...plan.blocks.map((b) => `${b.day} ${b.start}-${b.end}  ${b.label}`),
        ...(plan.overflow.length ? ["", "Didn't fit: " + plan.overflow.map((t) => t.name).join(", ")] : []),
        "", "TIPS", tips,
      ].join("\n")
    : "";

  return (
    <ToolLayout icon={CalendarCheck} title="AI Task Planner" description="Prioritize with the Eisenhower matrix and time-block your day or week." prompt={PROMPTS.planner}
      input={
        <div className="space-y-4">
          <div className="space-y-3">
            {tasks.map((t, idx) => (
              <div key={t.id} className="space-y-2 rounded-xl border p-3">
                <div className="flex gap-2">
                  <Input aria-label={`Task ${idx + 1} name`} placeholder="Task name" value={t.name} onChange={(e) => upd(t.id, { name: e.target.value })} />
                  <Button variant="ghost" size="icon" aria-label="Remove task" onClick={() => setTasks((ts) => ts.filter((x) => x.id !== t.id))}><Trash2 /></Button>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <label className="text-xs text-muted-foreground">Minutes
                    <Input type="number" min={5} step={5} value={t.duration} onChange={(e) => upd(t.id, { duration: Math.max(5, Number(e.target.value) || 5) })} />
                  </label>
                  <label className="text-xs text-muted-foreground">Deadline
                    <Input type="date" value={t.deadline} onChange={(e) => upd(t.id, { deadline: e.target.value })} />
                  </label>
                  <label className="text-xs text-muted-foreground">Urgency
                    <select className="mt-0 h-9 w-full rounded-md border bg-background px-2 text-sm text-foreground" value={t.urgency} onChange={(e) => upd(t.id, { urgency: e.target.value as "High" | "Low" })}>
                      <option>High</option><option>Low</option>
                    </select>
                  </label>
                  <label className="text-xs text-muted-foreground">Importance
                    <select className="h-9 w-full rounded-md border bg-background px-2 text-sm text-foreground" value={t.importance} onChange={(e) => upd(t.id, { importance: e.target.value as "High" | "Low" })}>
                      <option>High</option><option>Low</option>
                    </select>
                  </label>
                </div>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => setTasks((ts) => [...ts, newTask()])}><Plus /> Add task</Button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Start" htmlFor="start"><Input id="start" type="time" value={start} onChange={(e) => setStart(e.target.value)} /></Field>
            <Field label="End" htmlFor="end"><Input id="end" type="time" value={end} onChange={(e) => setEnd(e.target.value)} /></Field>
          </div>
          <Segmented label="Plan type" options={["Daily", "Weekly"] as const} value={type} onChange={setType} />
          <Button className="w-full" disabled={loading || streaming || !valid.length || toMin(end) <= toMin(start)} onClick={() => run()}>
            <CalendarCheck /> Build my plan
          </Button>
        </div>
      }
      output={
        !plan ? <EmptyState icon={CalendarCheck} text="Your priority matrix and schedule will appear here." /> : (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-2" aria-label="Eisenhower matrix">
              {Q.map((q) => {
                const items = plan.tasks.filter((t) => t.urgency === q.u && t.importance === q.i);
                return (
                  <div key={q.key} className={cn("rounded-xl border-l-4 bg-muted p-3", q.color)}>
                    <div className="text-sm font-bold">{q.title}</div>
                    <div className="mb-2 text-[11px] text-muted-foreground">{q.sub}</div>
                    <ul className="space-y-1 text-sm text-foreground">
                      {items.length ? items.map((t) => <li key={t.id}>• {t.name}</li>) : <li className="text-muted-foreground">—</li>}
                    </ul>
                  </div>
                );
              })}
            </div>
            <div>
              <h3 className="mb-2 text-sm font-semibold">Time-blocked schedule <span className="font-normal text-muted-foreground">(labels are editable)</span></h3>
              <div className="divide-y rounded-xl border">
                {plan.blocks.map((b, i) => (
                  <div key={i} className={cn("flex items-center gap-3 px-3 py-1.5 text-sm", b.label === "Break" && "bg-muted text-muted-foreground")}>
                    <span className="w-28 shrink-0 font-mono text-xs">{type === "Weekly" && `${b.day} `}{b.start}–{b.end}</span>
                    <input aria-label={`Block ${b.start}`} className="min-w-0 flex-1 rounded bg-transparent px-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      value={b.label} onChange={(e) => setPlan({ ...plan, blocks: plan.blocks.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) })} />
                    {b.quadrant && <span className="shrink-0 text-xs text-muted-foreground">{b.quadrant}</span>}
                  </div>
                ))}
              </div>
              {plan.overflow.length > 0 && (
                <p className="mt-2 text-xs text-destructive">Didn't fit in your hours: {plan.overflow.map((t) => t.name).join(", ")}</p>
              )}
            </div>
            <div>
              <h3 className="mb-2 text-sm font-semibold">Time-optimization tips</h3>
              {loading ? <LoadingState label="Thinking about your plan…" /> : <Markdown>{tips}</Markdown>}
            </div>
            {tips && <RateAndRefine busy={streaming} onRefine={run} />}
            <ReviewGate content={exportText} filename="task-plan" title={`${type} Plan`} />
          </div>
        )
      }
    />
  );
}

// Template-driven simulated responses for Demo Mode.

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const sentences = (t: string) =>
  (t.replace(/\s+/g, " ").match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? []).map((s) => s.trim()).filter(Boolean);

// ---------- Email ----------
export interface EmailInput {
  purpose: string; recipient: string; audience: string; tone: string; length: string;
}
export function demoEmail(i: EmailInput): string {
  const name = i.recipient.trim() || "there";
  const purpose = i.purpose.trim().replace(/\.$/, "");
  const greet = i.tone === "Formal" ? `Dear ${name},` : i.tone === "Friendly" ? `Hi ${name},` : `Hello ${name},`;
  const opener: Record<string, string> = {
    Formal: "I hope this message finds you well.",
    Friendly: "Hope your week is going well!",
    Persuasive: "I'll keep this brief, because I think this is worth a couple of minutes of your time.",
  };
  const audienceLine: Record<string, string> = {
    Client: "I wanted to reach out regarding our work together",
    Manager: "I wanted to bring something to your attention",
    Team: "Quick note for the team",
    Colleague: "I wanted to follow up with you",
  };
  const core = `${audienceLine[i.audience] ?? "I am writing"} — specifically, ${purpose.charAt(0).toLowerCase() + purpose.slice(1)}.`;
  const detail =
    i.tone === "Persuasive"
      ? "Moving forward on this now would save time later, reduce back-and-forth, and keep everyone aligned on priorities."
      : "I have outlined the key points below so we can align quickly and decide on next steps.";
  const extra = [
    "If there is any context I may have missed, please let me know and I will update accordingly.",
    "I am happy to set up a short call if it would be easier to discuss in person.",
  ];
  const cta: Record<string, string> = {
    Formal: "I would appreciate your response at your earliest convenience.",
    Friendly: "Let me know what you think — happy to chat anytime!",
    Persuasive: "Could we agree on a next step by the end of this week?",
  };
  const signoff = i.tone === "Friendly" ? "Best," : i.tone === "Persuasive" ? "Thanks in advance," : "Kind regards,";
  const paras =
    i.length === "Short"
      ? [opener[i.tone], `${core} ${cta[i.tone]}`]
      : i.length === "Medium"
        ? [opener[i.tone], core + " " + detail, cta[i.tone]]
        : [opener[i.tone], core, detail, extra.join(" "), cta[i.tone]];
  const subjBase = cap(purpose.split(/[,.;]/)[0].split(" ").slice(0, 7).join(" "));
  const subject = i.tone === "Formal" ? `Regarding: ${subjBase}` : i.tone === "Persuasive" ? `Proposal: ${subjBase}` : subjBase;
  return `Subject: ${subject}\n\n${greet}\n\n${paras.join("\n\n")}\n\n${signoff}\n[Your name]`;
}

// ---------- Meeting ----------
const DEADLINE_RE =
  /\b(by|before|due|until|on)\s+((?:next\s+)?(?:mon|tues|wednes|thurs|fri|satur|sun)day|tomorrow|today|eod|end of (?:day|week|month)|next week|\d{1,2}(?:st|nd|rd|th)?\s+\w+|\w+\s+\d{1,2}(?:st|nd|rd|th)?|\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?)/i;
const OWNER_RE = /^(?:[-*•]\s*)?(?:action:?\s*|todo:?\s*|ai:?\s*)?([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)\s+(?:will|to|should|is going to|owns|needs to)\b/;
const ACTION_RE = /\b(will|to do|todo|action|follow up|send|prepare|draft|review|schedule|update|share|needs to|should)\b/i;
const DECISION_RE = /\b(decided|agreed|approved|confirmed|chose|will go with|signed off)\b/i;

export function demoMeeting(notes: string): string {
  const lines = notes.split(/\n+/).map((l) => l.replace(/^[-*•\d.)\s]+/, "").trim()).filter(Boolean);
  const all = lines.length > 1 ? lines : sentences(notes);
  const decisions = all.filter((l) => DECISION_RE.test(l));
  const actions = all.filter((l) => !DECISION_RE.test(l) && ACTION_RE.test(l));
  const points = all.filter((l) => !decisions.includes(l) && !actions.includes(l)).slice(0, 6);
  const rows = actions.map((a) => {
    const owner = a.match(OWNER_RE)?.[1] ?? "Not specified";
    const dl = a.match(DEADLINE_RE);
    const deadline = dl ? cap(dl[2]) : "Not specified";
    const priority = /urgent|asap|critical|blocker|immediately/i.test(a) ? "High" : dl ? "Medium" : "Low";
    return { task: a.replace(/\|/g, "/"), owner, deadline, priority };
  });
  const summarySrc = (points.length ? points : all).slice(0, 2).join(" ");
  const out = [
    "## Concise Summary",
    all.length
      ? `The meeting covered ${all.length} noted item${all.length > 1 ? "s" : ""}. ${summarySrc}${/[.!?]$/.test(summarySrc) ? "" : "."} ${decisions.length} decision${decisions.length === 1 ? " was" : "s were"} recorded and ${rows.length} action item${rows.length === 1 ? "" : "s"} identified.`
      : "No content to summarize.",
    "",
    "## Key Discussion Points",
    ...(points.length ? points.map((p) => `- ${p}`) : ["- Not specified"]),
    "",
    "## Decisions Made",
    ...(decisions.length ? decisions.map((d) => `- ${d}`) : ["- No explicit decisions were recorded in the notes."]),
    "",
    "## Action Items",
    "| Task | Owner | Deadline | Priority |",
    "|---|---|---|---|",
    ...(rows.length ? rows.map((r) => `| ${r.task} | ${r.owner} | ${r.deadline} | ${r.priority} |`) : ["| Not specified | Not specified | Not specified | — |"]),
    "",
    "## Upcoming Deadlines",
    ...(rows.some((r) => r.deadline !== "Not specified")
      ? rows.filter((r) => r.deadline !== "Not specified").map((r) => `- **⏰ ${r.deadline}** — ${r.task} (${r.owner})`)
      : ["- No deadlines were stated in the notes."]),
  ];
  return out.join("\n");
}

// ---------- Planner ----------
export interface PlanTask {
  id: string; name: string; duration: number; deadline: string; urgency: "High" | "Low"; importance: "High" | "Low";
}
export function demoPlannerTips(tasks: PlanTask[], start: string, end: string, type: string): string {
  const q1 = tasks.filter((t) => t.urgency === "High" && t.importance === "High").length;
  const q3 = tasks.filter((t) => t.urgency === "High" && t.importance === "Low").length;
  const total = tasks.reduce((a, t) => a + t.duration, 0);
  const tips = [
    q1 > 0
      ? `**Protect your mornings for "Do First" work** — you have ${q1} urgent & important task${q1 > 1 ? "s" : ""}; tackle them before checking messages.`
      : `**Invest in "Schedule" tasks** — nothing is on fire, so use this ${type.toLowerCase()} plan to move important long-term work forward.`,
    q3 > 0
      ? `**Delegate or batch ${q3} urgent-but-not-important task${q3 > 1 ? "s" : ""}** — group them into a single block to limit context switching.`
      : "**Batch small admin tasks** into one block late in the day to limit context switching.",
    `**Build in buffer time** — your tasks total about ${Math.round(total / 60 * 10) / 10}h; leave ~20% of your ${start}–${end} window unplanned for surprises.`,
    "**Take short breaks between blocks** — a 5–10 minute pause every 90 minutes helps sustain focus.",
    "**Review at the end of the day** — move unfinished items deliberately rather than letting them roll over silently.",
  ];
  return tips.map((t, i) => `${i + 1}. ${t}`).join("\n");
}

// ---------- Research ----------
export interface ResearchInput { text: string; detail: "Quick" | "Detailed"; level: "Beginner" | "Professional" | "Expert" }
export function demoResearch(i: ResearchInput): string {
  const src = i.text.trim();
  const isTopic = src.split(/\s+/).length < 25;
  const sents = sentences(src);
  const ranked = [...sents].sort((a, b) => b.length - a.length);
  const n = i.detail === "Quick" ? 2 : 4;
  const levelIntro = {
    Beginner: "In simple terms:",
    Professional: "Overview:",
    Expert: "Technical synopsis:",
  }[i.level];
  const summary = isTopic
    ? `${levelIntro} You asked about **${src}**. In Demo Mode no external sources are consulted, so this is a structured outline to guide your research rather than factual claims. Switch to Live AI for a substantive explanation — and verify it against reliable sources.`
    : `${levelIntro} ${sents.slice(0, n).join(" ")}`;
  const insights = isTopic
    ? [
        `Define the scope of "${src}" — what problem does it solve and for whom?`,
        "Identify the main approaches or schools of thought.",
        "Look for recent data or case studies (last 2–3 years).",
        "Note the key risks, limitations and open questions.",
        "Compare costs, benefits and adoption barriers.",
      ]
    : [...ranked.slice(0, 5), ...Array(5).fill("Not enough source text for an additional insight.")].slice(0, 5);
  const terms = Array.from(new Set((src.match(/\b[A-Za-z][a-z]{9,}\b|\b[A-Z]{2,6}\b/g) ?? []).map((w) => w)))
    .slice(0, i.detail === "Quick" ? 3 : 6);
  const glossary = terms.length
    ? terms.map((t) => {
        const ctx = sents.find((s) => s.includes(t));
        return `- **${t}** — appears in: "_${ctx ? ctx.slice(0, 110) : t}${ctx && ctx.length > 110 ? "…" : ""}_". Demo Mode does not generate definitions; look this term up in the source.`;
      })
    : ["- No complex terms detected."];
  const numbers = src.match(/\b\d[\d,.]*\s?%?/g) ?? [];
  return [
    "## Simplified Summary", summary, "",
    "## 5 Key Insights", ...insights.map((s, k) => `${k + 1}. ${s}`), "",
    "## Recommendations",
    "- Share the summary with stakeholders and confirm it matches their understanding.",
    "- Prioritize the insights most relevant to your current goals.",
    i.detail === "Detailed" ? "- Schedule a follow-up to review open questions and gather missing data." : "",
    "",
    "## Glossary", ...glossary, "",
    "## Things to Verify",
    ...(numbers.length ? [`- Figures mentioned: ${numbers.slice(0, 6).join(", ")} — confirm against the original data.`] : []),
    "- Any claim about causes, trends or future outcomes.",
    "- Whether the source is current, credible and unbiased.",
    "",
    "> Always check original sources before relying on these findings.",
  ].filter((l) => l !== "" || true).join("\n").replace(/\n{3,}/g, "\n\n");
}

// ---------- Chat ----------
export function demoChat(msg: string, turn: number): string {
  const m = msg.toLowerCase();
  if (/follow.?up|email/.test(m))
    return `Here's a follow-up email draft you can adapt:\n\n**Subject:** Following up on our conversation\n\nHi [Name],\n\nThank you for your time earlier. As discussed, I'll [next step] and share an update by [date]. Please let me know if I missed anything.\n\nBest,\n[Your name]\n\n_Tip: the **Email Generator** gives you tone and length controls._`;
  if (/priorit|week|plan|schedule/.test(m))
    return `Let's prioritize your week with the **Eisenhower Matrix**:\n\n1. **Do first** — urgent & important (deadlines this week).\n2. **Schedule** — important, not urgent (strategy, learning).\n3. **Delegate** — urgent, not important (some meetings, requests).\n4. **Eliminate** — neither.\n\nShare your task list and I'll help you sort it, or try the **Task Planner** for a time-blocked schedule.`;
  if (/summar|notes|meeting/.test(m))
    return `Paste the notes here and I'll summarize them — or use the **Meeting Summarizer**, which extracts decisions and an action-item table. I'll mark any missing owners or deadlines as *Not specified* rather than guessing.`;
  if (/^(hi|hello|hey)\b/.test(m))
    return "Hello! I can help you draft emails, summarize notes, plan your tasks or explain a topic. What are you working on?";
  return `Good question. Here's a structured way to approach it:\n\n- **Clarify the goal:** what does "done" look like?\n- **Break it down:** list 3–5 concrete steps.\n- **Timebox:** assign each step a realistic duration.\n\n_${turn > 1 ? "I'm keeping our conversation in mind. " : ""}This is a Demo Mode response — add an API key in Settings for tailored answers._`;
}

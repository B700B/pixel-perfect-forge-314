import { useState, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import {
  ShieldAlert, ChevronDown, Code2, Copy, Download, Printer, ThumbsUp, ThumbsDown, Wand2, Loader2, Inbox,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

export function Markdown({ children }: { children: string }) {
  return (
    <div className="md">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  );
}

export function DisclaimerBanner() {
  return (
    <div role="note" className="flex gap-2.5 rounded-lg bg-warning p-3 text-xs text-warning-foreground">
      <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <p>
        <strong>Privacy:</strong> don't paste confidential, client or personal information. In Live mode your text is
        sent to the AI provider you configured.
      </p>
    </div>
  );
}

export function PromptDetails({ prompt }: { prompt: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Collapsible open={open} onOpenChange={setOpen} className="rounded-xl border bg-card shadow-soft">
      <CollapsibleTrigger className="flex w-full items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <Code2 className="h-4 w-4 text-primary" aria-hidden />
        Prompt details
        <span className="text-xs font-normal text-muted-foreground">— the exact template sent to the AI</span>
        <ChevronDown className={cn("ml-auto h-4 w-4 transition-transform", open && "rotate-180")} aria-hidden />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <pre className="mx-4 mb-4 max-h-80 overflow-auto whitespace-pre-wrap rounded-lg bg-muted p-3 font-mono text-xs">
          {prompt}
        </pre>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function LoadingState({ label = "Generating…" }: { label?: string }) {
  return (
    <div className="space-y-3" aria-live="polite" aria-busy="true">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> {label}
      </div>
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}

export function EmptyState({ icon: Icon = Inbox, text }: { icon?: LucideIcon; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-14 text-center text-sm text-muted-foreground">
      <div className="rounded-full bg-accent p-3 text-accent-foreground">
        <Icon className="h-5 w-5" aria-hidden />
      </div>
      <p className="max-w-xs">{text}</p>
    </div>
  );
}

export function download(filename: string, content: string, type = "text/plain") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function printText(title: string, content: string) {
  const w = window.open("", "_blank");
  if (!w) { toast.error("Allow pop-ups to print."); return; }
  const esc = content.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]!);
  w.document.write(
    `<html><head><title>${title}</title></head><body style="font-family:system-ui;padding:32px;max-width:800px;margin:auto"><h2>${title}</h2><pre style="white-space:pre-wrap;font-family:inherit;line-height:1.6">${esc}</pre><p style="color:#777;font-size:12px;margin-top:32px">AI-generated content — reviewed by a human before use.</p></body></html>`,
  );
  w.document.close();
  w.print();
}

export function ReviewGate({
  content, filename, title,
}: { content: string; filename: string; title: string }) {
  const [ok, setOk] = useState(false);
  const id = `review-${filename}`;
  return (
    <div className="space-y-3 border-t pt-4">
      <div className="flex items-center gap-2">
        <Checkbox id={id} checked={ok} onCheckedChange={(v) => setOk(v === true)} />
        <label htmlFor={id} className="text-sm">
          I have reviewed this output for accuracy and bias
        </label>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="secondary" disabled={!ok}
          onClick={() => navigator.clipboard.writeText(content).then(() => toast.success("Copied to clipboard"))}>
          <Copy /> Copy
        </Button>
        <Button size="sm" variant="secondary" disabled={!ok} onClick={() => download(`${filename}.txt`, content)}>
          <Download /> .txt
        </Button>
        <Button size="sm" variant="secondary" disabled={!ok} onClick={() => download(`${filename}.md`, content, "text/markdown")}>
          <Download /> .md
        </Button>
        <Button size="sm" variant="secondary" disabled={!ok} onClick={() => printText(title, content)}>
          <Printer /> Print
        </Button>
      </div>
    </div>
  );
}

export function RateAndRefine({
  onRefine, busy,
}: { onRefine: (instruction: string) => void; busy?: boolean }) {
  const [rating, setRating] = useState<"up" | "down" | null>(null);
  const [text, setText] = useState("");
  const rate = (r: "up" | "down") => {
    setRating(r);
    toast.success(r === "up" ? "Thanks for the feedback!" : "Thanks — try Refine to improve it.");
  };
  return (
    <div className="space-y-3 border-t pt-4">
      <div className="flex items-center gap-1 text-sm text-muted-foreground">
        Rate this output
        <Button size="icon" variant={rating === "up" ? "default" : "ghost"} aria-label="Thumbs up" aria-pressed={rating === "up"} onClick={() => rate("up")}>
          <ThumbsUp />
        </Button>
        <Button size="icon" variant={rating === "down" ? "default" : "ghost"} aria-label="Thumbs down" aria-pressed={rating === "down"} onClick={() => rate("down")}>
          <ThumbsDown />
        </Button>
      </div>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (text.trim()) onRefine(text.trim());
        }}
      >
        <Input aria-label="Refine instruction" placeholder='Refine, e.g. "make it more concise"' value={text} onChange={(e) => setText(e.target.value)} />
        <Button type="submit" variant="outline" disabled={busy || !text.trim()}>
          <Wand2 /> Refine
        </Button>
      </form>
    </div>
  );
}

export function Panel({ title, children, actions, className }: { title: string; children: ReactNode; actions?: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-2xl border bg-card p-5 shadow-soft", className)} aria-label={title}>
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{title}</h2>
        {actions}
      </div>
      {children}
    </section>
  );
}

export function ToolLayout({
  icon: Icon, title, description, prompt, input, output,
}: {
  icon: LucideIcon; title: string; description: string; prompt: string; input: ReactNode; output: ReactNode;
}) {
  return (
    <div className="space-y-5">
      <header className="flex items-start gap-3">
        <div className="rounded-xl bg-accent p-2.5 text-accent-foreground">
          <Icon className="h-5 w-5" aria-hidden />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </header>
      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Input">
          <div className="space-y-4">
            <DisclaimerBanner />
            {input}
          </div>
        </Panel>
        <Panel title="Output">{output}</Panel>
      </div>
      <PromptDetails prompt={prompt} />
    </div>
  );
}

export function Field({ label, htmlFor, children }: { label: string; htmlFor?: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium">{label}</label>
      {children}
    </div>
  );
}

export function Segmented<T extends string>({
  label, options, value, onChange,
}: { label: string; options: readonly T[]; value: T; onChange: (v: T) => void }) {
  return (
    <fieldset className="space-y-1.5">
      <legend className="text-sm font-medium">{label}</legend>
      <div className="flex flex-wrap gap-1 rounded-lg bg-muted p-1">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            aria-pressed={value === o}
            onClick={() => onChange(o)}
            className={cn(
              "flex-1 rounded-md px-3 py-1.5 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              value === o ? "bg-card font-medium text-foreground shadow-soft" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {o}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

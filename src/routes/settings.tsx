import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { KeyRound, Settings as SettingsIcon, Trash2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Field, Panel, Segmented } from "@/components/tool/shared";
import { useSettings, clearAllData, type Provider } from "@/lib/storage";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — AI Workplace Productivity Assistant" },
      { name: "description", content: "Choose Demo or Live AI mode and optionally add your own OpenAI or Gemini API key." },
      { property: "og:title", content: "Settings — AI Workplace Assistant" },
      { property: "og:description", content: "Choose Demo or Live AI mode and configure your AI provider." },
    ],
  }),
  component: SettingsPage,
});

const DEFAULT_MODEL: Record<Provider, string> = { openai: "gpt-4o-mini", gemini: "gemini-1.5-flash" };

function SettingsPage() {
  const [s, setS] = useSettings();
  const [show, setShow] = useState(false);
  const providerLabel = s.provider === "openai" ? "OpenAI" : "Google Gemini";
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <header className="flex items-center gap-3">
        <div className="rounded-xl bg-accent p-2.5 text-accent-foreground"><SettingsIcon className="h-5 w-5" /></div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground">Everything here is saved only in this browser.</p>
        </div>
      </header>

      <Panel title="AI mode">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="font-medium">{s.mode === "live" ? "Live AI mode" : "Demo mode"}</div>
            <p className="text-sm text-muted-foreground">
              {s.mode === "live" ? "Requests go directly from your browser to the provider." : "Simulated responses — no key or setup needed."}
            </p>
          </div>
          <Switch aria-label="Use Live AI mode" checked={s.mode === "live"}
            onCheckedChange={(v) => {
              if (v && !s.apiKey.trim()) toast.info("Add an API key below to use Live AI. Demo responses will be used until then.");
              setS({ ...s, mode: v ? "live" : "demo" });
            }} />
        </div>
      </Panel>

      <Panel title="Provider (optional)">
        <div className="space-y-4">
          <Segmented label="Provider" options={["OpenAI", "Google Gemini"] as const} value={providerLabel}
            onChange={(v) => {
              const p: Provider = v === "OpenAI" ? "openai" : "gemini";
              setS({ ...s, provider: p, model: DEFAULT_MODEL[p] });
            }} />
          <Field label="API key" htmlFor="key">
            <div className="flex gap-2">
              <Input id="key" type={show ? "text" : "password"} autoComplete="off" placeholder={s.provider === "openai" ? "sk-…" : "AIza…"}
                value={s.apiKey} onChange={(e) => setS({ ...s, apiKey: e.target.value })} />
              <Button variant="outline" size="icon" aria-label={show ? "Hide key" : "Show key"} onClick={() => setShow(!show)}>
                {show ? <EyeOff /> : <Eye />}
              </Button>
            </div>
          </Field>
          <Field label="Model" htmlFor="model">
            <Input id="model" value={s.model} onChange={(e) => setS({ ...s, model: e.target.value })} />
          </Field>
          <div role="note" className="flex gap-2 rounded-lg bg-warning p-3 text-xs text-warning-foreground">
            <KeyRound className="h-4 w-4 shrink-0" />
            Your API key is stored only in your browser and sent only to the AI provider. Use a personal/test key and never share it.
          </div>
        </div>
      </Panel>

      <Panel title="Data">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">Remove history, chat, settings and your API key from this browser.</p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive"><Trash2 /> Clear all data and key</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear all data?</AlertDialogTitle>
                <AlertDialogDescription>This permanently removes your history, chat, settings and API key from this browser.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => { clearAllData(); toast.success("All data cleared"); }}>Clear everything</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </Panel>
    </div>
  );
}

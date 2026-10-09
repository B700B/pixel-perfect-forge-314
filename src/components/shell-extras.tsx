import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Moon, Sun, FlaskConical, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLocal, useSettings, isLive } from "@/lib/storage";
import { TOOLS } from "./app-sidebar";
import { cn } from "@/lib/utils";

const THEME_KEY = "awpa.theme";
const LIGHT = "light";

export function ThemeToggle() {
  const [theme, setTheme] = useLocal<string>(THEME_KEY, LIGHT);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);
  const dark = theme === "dark";
  return (
    <Button variant="ghost" size="icon" aria-label={dark ? "Switch to light mode" : "Switch to dark mode"} onClick={() => setTheme(dark ? "light" : "dark")}>
      {dark ? <Sun /> : <Moon />}
    </Button>
  );
}

export function ModeBadge() {
  const [s] = useSettings();
  const live = isLive(s);
  return (
    <Link
      to="/settings"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        live ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground",
      )}
      aria-label={`Mode: ${live ? "Live AI" : "Demo"}. Open settings`}
    >
      {live ? <Zap className="h-3 w-3" /> : <FlaskConical className="h-3 w-3" />}
      {live ? "Live AI" : "Demo Mode"}
    </Link>
  );
}

const NOT_SEEN = false;
export function OnboardingModal() {
  const [seen, setSeen] = useLocal<boolean>("awpa.onboarded", NOT_SEEN);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return (
    <Dialog open={!seen} onOpenChange={(o) => !o && setSeen(true)}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Welcome to your AI Workplace Assistant</DialogTitle>
          <DialogDescription>Five AI tools to take repetitive work off your plate. No account needed.</DialogDescription>
        </DialogHeader>
        <ul className="space-y-2">
          {TOOLS.map((t) => (
            <li key={t.url} className="flex gap-3 text-sm">
              <t.icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
              <span><strong>{t.title}</strong> — {t.desc}</span>
            </li>
          ))}
        </ul>
        <div className="grid gap-2 rounded-xl bg-muted p-3 text-sm sm:grid-cols-2">
          <div><strong className="flex items-center gap-1"><FlaskConical className="h-3.5 w-3.5" />Demo Mode</strong><span className="text-muted-foreground">Default. Realistic simulated responses, no setup.</span></div>
          <div><strong className="flex items-center gap-1"><Zap className="h-3.5 w-3.5" />Live AI</strong><span className="text-muted-foreground">Optional. Add your own OpenAI or Gemini key in Settings.</span></div>
        </div>
        <p className="text-xs text-muted-foreground">Everything is stored only in this browser.</p>
        <DialogFooter>
          <Button onClick={() => setSeen(true)}>Get started</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

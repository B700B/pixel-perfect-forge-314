import { useCallback, useSyncExternalStore } from "react";

const listeners = new Set<() => void>();
const cache = new Map<string, { raw: string | null; val: unknown }>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = () => cb();
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

export function readLS<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  const raw = localStorage.getItem(key);
  const hit = cache.get(key);
  if (hit && hit.raw === raw) return hit.val as T;
  let val: T = fallback;
  if (raw != null) {
    try {
      val = JSON.parse(raw) as T;
    } catch {
      val = fallback;
    }
  }
  cache.set(key, { raw, val });
  return val;
}

export function writeLS<T>(key: string, val: T) {
  localStorage.setItem(key, JSON.stringify(val));
  listeners.forEach((l) => l());
}

export function removeLS(key: string) {
  localStorage.removeItem(key);
  listeners.forEach((l) => l());
}

/** fallback must be a stable (module-level) reference */
export function useLocal<T>(key: string, fallback: T) {
  const value = useSyncExternalStore(
    subscribe,
    () => readLS(key, fallback),
    () => fallback,
  );
  const set = useCallback(
    (v: T | ((prev: T) => T)) => {
      const prev = readLS(key, fallback);
      writeLS(key, typeof v === "function" ? (v as (p: T) => T)(prev) : v);
    },
    [key, fallback],
  );
  return [value, set] as const;
}

// ---------- Settings ----------
export type Provider = "openai" | "gemini";
export interface Settings {
  provider: Provider;
  apiKey: string;
  model: string;
  mode: "demo" | "live";
}
export const SETTINGS_KEY = "awpa.settings";
export const DEFAULT_SETTINGS: Settings = {
  provider: "openai",
  apiKey: "",
  model: "gpt-4o-mini",
  mode: "demo",
};
export const useSettings = () => useLocal<Settings>(SETTINGS_KEY, DEFAULT_SETTINGS);
export const getSettings = () => readLS<Settings>(SETTINGS_KEY, DEFAULT_SETTINGS);
export const isLive = (s: Settings) => s.mode === "live" && !!s.apiKey.trim();

// ---------- History ----------
export type ToolId = "email" | "meeting" | "planner" | "research" | "chat";
export interface HistoryEntry {
  id: string;
  tool: ToolId;
  title: string;
  output: string;
  createdAt: number;
  minutesSaved: number;
}
export const HISTORY_KEY = "awpa.history";
const EMPTY_HISTORY: HistoryEntry[] = [];
export const useHistory = () => useLocal<HistoryEntry[]>(HISTORY_KEY, EMPTY_HISTORY);

export function addHistory(e: Omit<HistoryEntry, "id" | "createdAt">) {
  const list = readLS<HistoryEntry[]>(HISTORY_KEY, EMPTY_HISTORY);
  writeLS(HISTORY_KEY, [
    { ...e, id: crypto.randomUUID(), createdAt: Date.now() },
    ...list,
  ].slice(0, 200));
}

export const TOOL_LABELS: Record<ToolId, string> = {
  email: "Email Generator",
  meeting: "Meeting Summarizer",
  planner: "Task Planner",
  research: "Research Assistant",
  chat: "AI Chatbot",
};

export function clearAllData() {
  Object.keys(localStorage)
    .filter((k) => k.startsWith("awpa."))
    .forEach((k) => localStorage.removeItem(k));
  listeners.forEach((l) => l());
}

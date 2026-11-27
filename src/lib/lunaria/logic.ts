// Pure rules — no React, no Supabase. Covered by src/test/lunaria-logic.test.ts.
import type { Habit, Task } from "./types";

export const todayISO = (d = new Date()) => {
  const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, "0"), day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

/** An unfinished task whose deadline day has fully passed becomes failed. */
export function isOverdue(t: Pick<Task, "status" | "deadline">, today = todayISO()): boolean {
  return t.status === "active" && !!t.deadline && t.deadline < today;
}

/** Period key used to reset habits: one check-in per day / ISO week / month. */
export function periodKey(freq: Habit["frequency"], d = new Date()): string {
  if (freq === "daily") return todayISO(d);
  if (freq === "monthly") return todayISO(d).slice(0, 7);
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((t.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${t.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

export const clampProgress = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

/** The existing long project that must always be present, exactly as given. */
export const CYBER_PROJECT = {
  title: "Cybersecurity Resilience Game: 47 Cards",
  label: "Cybersecurity",
  assigned_by: "ASEAN Cybersecurity School",
  task_type: "long" as const,
  status: "completed" as const,
  progress: 100,
  entries: [
    { entry_date: "2026-11-25", description: "Finished 27/47 cards", progress: 57 },
    { entry_date: "2026-11-27", description: "Finished the rest of the cards", progress: 100 },
  ],
};

/** Which seed progress entries are still missing from what is stored (matched by date + description). */
export function missingEntries(existing: { entry_date: string; description: string }[]) {
  return CYBER_PROJECT.entries.filter((e) => !existing.some((x) => x.entry_date === e.entry_date && x.description === e.description));
}

export const PIN_LENGTH = 4;
export const DEFAULT_PIN = "1440";
export const isValidPin = (p: string) => /^\d{4}$/.test(p);
export const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e.trim());
export function passwordIssues(p: string): string[] {
  const out: string[] = [];
  if (p.length < 8) out.push("at least 8 characters");
  if (!/[A-Za-z]/.test(p)) out.push("a letter");
  if (!/\d/.test(p)) out.push("a number");
  return out;
}

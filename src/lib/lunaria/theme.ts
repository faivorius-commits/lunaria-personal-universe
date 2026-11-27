import type { ThemeSettings } from "./types";

export const PRESETS: Record<string, Omit<ThemeSettings, "density" | "decorations" | "reduceMotion" | "glass">> = {
  "Pink Galaxy": { preset: "Pink Galaxy", g1: "oklch(0.86 0.09 350)", g2: "oklch(0.82 0.1 320)", g3: "oklch(0.7 0.16 295)", g4: "oklch(0.8 0.1 255)", accent: "oklch(0.62 0.2 340)" },
  "Lavender Dream": { preset: "Lavender Dream", g1: "oklch(0.9 0.05 320)", g2: "oklch(0.85 0.08 300)", g3: "oklch(0.78 0.11 290)", g4: "oklch(0.86 0.07 270)", accent: "oklch(0.58 0.16 295)" },
  "Purple Stardust": { preset: "Purple Stardust", g1: "oklch(0.8 0.12 330)", g2: "oklch(0.68 0.18 305)", g3: "oklch(0.55 0.2 290)", g4: "oklch(0.65 0.15 265)", accent: "oklch(0.52 0.22 300)" },
  "Blue Moonlight": { preset: "Blue Moonlight", g1: "oklch(0.88 0.06 290)", g2: "oklch(0.82 0.08 265)", g3: "oklch(0.72 0.12 255)", g4: "oklch(0.85 0.08 225)", accent: "oklch(0.56 0.16 260)" },
  "Cotton Candy": { preset: "Cotton Candy", g1: "oklch(0.9 0.08 0)", g2: "oklch(0.88 0.07 340)", g3: "oklch(0.86 0.07 280)", g4: "oklch(0.88 0.08 220)", accent: "oklch(0.64 0.19 355)" },
  "Aurora Fantasy": { preset: "Aurora Fantasy", g1: "oklch(0.86 0.1 340)", g2: "oklch(0.78 0.13 300)", g3: "oklch(0.8 0.1 220)", g4: "oklch(0.86 0.11 175)", accent: "oklch(0.6 0.17 280)" },
};

export const DEFAULT_THEME: ThemeSettings = { ...PRESETS["Pink Galaxy"]!, glass: 55, density: "comfortable", decorations: true, reduceMotion: false };

export function resolveTheme(t: Partial<ThemeSettings> | null | undefined): ThemeSettings {
  return { ...DEFAULT_THEME, ...(t ?? {}) };
}

export function applyTheme(t: ThemeSettings) {
  const r = document.documentElement.style;
  r.setProperty("--g1", t.g1); r.setProperty("--g2", t.g2); r.setProperty("--g3", t.g3); r.setProperty("--g4", t.g4);
  r.setProperty("--accent-c", t.accent);
  r.setProperty("--glass-alpha", `${t.glass}%`);
  r.setProperty("--density", t.density === "cozy" ? "0.75" : t.density === "spacious" ? "1.35" : "1");
  document.documentElement.classList.toggle("reduce-motion", t.reduceMotion);
}

export const WIDGETS = [
  { id: "tasks", label: "Today's Tasks" },
  { id: "projects", label: "Long Projects" },
  { id: "habits", label: "Habits" },
  { id: "calendar", label: "Calendar" },
  { id: "weather", label: "Weather" },
  { id: "diary", label: "Diary" },
  { id: "memories", label: "Recent Memories" },
  { id: "randomizer", label: "Randomizer" },
  { id: "stats", label: "Personal Statistics" },
] as const;

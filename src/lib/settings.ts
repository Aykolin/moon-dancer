import type { AppSettings } from "./types";

const key = "moon-dancer-settings-v1";

export const defaultSettings: AppSettings = {
  theme: "night",
  language: "pt",
  reduceMotion: false,
  fontScale: 1,
  mascotEnabled: true,
  lockEnabled: false,
  pinDigest: "",
};

export function loadSettings(): AppSettings {
  try {
    const stored = JSON.parse(localStorage.getItem(key) ?? "{}") as Omit<Partial<AppSettings>, "theme"> & { theme?: string };
    const theme = stored.theme === "classic" ? "pastel" : stored.theme;
    const safeTheme = theme === "pastel" || theme === "white" || theme === "night" || theme === "rose" || theme === "latte" ? theme : defaultSettings.theme;
    const language = stored.language === "en" ? "en" : "pt";
    return { ...defaultSettings, ...stored, theme: safeTheme, language };
  } catch {
    return { ...defaultSettings };
  }
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(key, JSON.stringify(settings));
}

export async function digestPin(pin: string): Promise<string> {
  const bytes = new TextEncoder().encode(`moon-dancer:${pin}`);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function verifyPin(pin: string, expectedDigest: string): Promise<boolean> {
  if (!pin || !expectedDigest) return false;
  return (await digestPin(pin)) === expectedDigest;
}

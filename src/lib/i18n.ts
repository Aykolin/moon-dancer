import { writable } from "svelte/store";
import type { LanguageId } from "./types";

export const language = writable<LanguageId>("pt");

export function setLanguage(next: LanguageId): void {
  language.set(next);
  document.documentElement.lang = next === "en" ? "en" : "pt-BR";
}

export function pick(current: LanguageId, portuguese: string, english: string): string {
  return current === "en" ? english : portuguese;
}

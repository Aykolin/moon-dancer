export type ScreenId =
  | "home"
  | "journal"
  | "notes"
  | "calendar"
  | "memories"
  | "backup"
  | "settings";

export type ThemeId = "pastel" | "white" | "night" | "rose" | "latte";
export type LanguageId = "pt" | "en";

export interface JournalEntry {
  id: string;
  entryDate: string;
  title: string;
  content: string;
  mood: string;
  moonPhase: string;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SearchResult {
  id: string;
  kind: "journal" | "note";
  title: string;
  excerpt: string;
  date: string;
  isFavorite: boolean;
}

export interface AppSettings {
  theme: ThemeId;
  language: LanguageId;
  reduceMotion: boolean;
  fontScale: number;
  mascotEnabled: boolean;
  lockEnabled: boolean;
  pinDigest: string;
}

export interface AppSnapshot {
  journalEntries: JournalEntry[];
  notes: Note[];
}

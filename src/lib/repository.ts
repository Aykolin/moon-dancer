import type { AppSnapshot, JournalEntry, Note, SearchResult } from "./types";
import { parseBackup, serializeBackup } from "./backup";

const journalKey = "moon-dancer-journal-v1";
const notesKey = "moon-dancer-notes-v1";

function isTauri(): boolean {
  return "__TAURI_INTERNALS__" in window;
}

async function invoke<T>(command: string, args?: Record<string, unknown>): Promise<T> {
  const api = await import("@tauri-apps/api/core");
  return api.invoke<T>(command, args);
}

function readLocal<T>(key: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(key) ?? "[]") as T[];
  } catch {
    return [];
  }
}

function writeLocal<T>(key: string, value: T[]): void {
  localStorage.setItem(key, JSON.stringify(value));
}

function excerpt(value: string): string {
  const compact = value.replace(/\s+/g, " ").trim();
  return compact.length > 125 ? `${compact.slice(0, 122)}...` : compact;
}

export const repository = {
  async listJournalEntries(): Promise<JournalEntry[]> {
    if (isTauri()) return invoke<JournalEntry[]>("list_journal_entries");
    return readLocal<JournalEntry>(journalKey).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  },

  async saveJournalEntry(entry: JournalEntry): Promise<JournalEntry> {
    if (isTauri()) return invoke<JournalEntry>("save_journal_entry", { entry });
    const entries = readLocal<JournalEntry>(journalKey);
    const index = entries.findIndex((item) => item.id === entry.id);
    if (index >= 0) entries[index] = entry;
    else entries.push(entry);
    writeLocal(journalKey, entries);
    return entry;
  },

  async deleteJournalEntry(id: string): Promise<void> {
    if (isTauri()) return invoke<void>("delete_journal_entry", { id });
    writeLocal(
      journalKey,
      readLocal<JournalEntry>(journalKey).filter((item) => item.id !== id),
    );
  },

  async listNotes(): Promise<Note[]> {
    if (isTauri()) return invoke<Note[]>("list_notes");
    return readLocal<Note>(notesKey).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  },

  async saveNote(note: Note): Promise<Note> {
    if (isTauri()) return invoke<Note>("save_note", { note });
    const notes = readLocal<Note>(notesKey);
    const index = notes.findIndex((item) => item.id === note.id);
    if (index >= 0) notes[index] = note;
    else notes.push(note);
    writeLocal(notesKey, notes);
    return note;
  },

  async deleteNote(id: string): Promise<void> {
    if (isTauri()) return invoke<void>("delete_note", { id });
    writeLocal(
      notesKey,
      readLocal<Note>(notesKey).filter((item) => item.id !== id),
    );
  },

  async search(query: string): Promise<SearchResult[]> {
    if (isTauri()) return invoke<SearchResult[]>("search_entries", { query });
    const needle = query.trim().toLocaleLowerCase("pt-BR");
    if (!needle) return [];
    const journal = readLocal<JournalEntry>(journalKey)
      .filter((item) => `${item.title} ${item.content}`.toLocaleLowerCase("pt-BR").includes(needle))
      .map<SearchResult>((item) => ({
        id: item.id,
        kind: "journal",
        title: item.title || "Registro sem título",
        excerpt: excerpt(item.content),
        date: item.entryDate,
        isFavorite: false,
      }));
    const notes = readLocal<Note>(notesKey)
      .filter((item) => `${item.title} ${item.content}`.toLocaleLowerCase("pt-BR").includes(needle))
      .map<SearchResult>((item) => ({
        id: item.id,
        kind: "note",
        title: item.title || "Nota sem título",
        excerpt: excerpt(item.content),
        date: item.updatedAt.slice(0, 10),
        isFavorite: item.isFavorite,
      }));
    return [...journal, ...notes].sort((a, b) => b.date.localeCompare(a.date));
  },

  async createBackup(): Promise<string> {
    if (isTauri()) {
      const { save } = await import("@tauri-apps/plugin-dialog");
      const path = await save({
        defaultPath: `MoonDancer_${new Date().toISOString().slice(0, 10)}.moonbackup`,
        filters: [{ name: "Backup Moon Dancer", extensions: ["moonbackup"] }],
      });
      if (!path) return "";
      return invoke<string>("create_backup", { destination: path });
    }

    const snapshot: AppSnapshot = {
      journalEntries: readLocal<JournalEntry>(journalKey),
      notes: readLocal<Note>(notesKey),
    };
    const payload = serializeBackup(snapshot);
    const url = URL.createObjectURL(new Blob([payload], { type: "application/json" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `MoonDancer_${new Date().toISOString().slice(0, 10)}.moonbackup`;
    anchor.style.display = "none";
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
    return "Arquivo salvo na pasta de downloads";
  },

  async restoreBackupFromFile(file?: File): Promise<string> {
    if (isTauri()) {
      const { open } = await import("@tauri-apps/plugin-dialog");
      const path = await open({
        multiple: false,
        filters: [{ name: "Backup Moon Dancer", extensions: ["moonbackup"] }],
      });
      if (!path || Array.isArray(path)) return "";
      return invoke<string>("restore_backup", { source: path });
    }
    if (!file) throw new Error("Escolha um arquivo de backup.");
    const snapshot = parseBackup(await file.text());
    writeLocal(journalKey, snapshot.journalEntries);
    writeLocal(notesKey, snapshot.notes);
    return "Backup restaurado com segurança";
  },
};

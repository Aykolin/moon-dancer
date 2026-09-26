import type { AppSnapshot, JournalEntry, Note } from "./types";
import { APP_VERSION } from "./version";

interface BackupEnvelope {
  manifest: {
    format: "moonbackup";
    formatVersion: 1;
    appVersion: string;
    createdAt: string;
    databaseSchema: 1;
    encrypted: false;
  };
  data: AppSnapshot;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isJournalEntry(value: unknown): value is JournalEntry {
  if (!isRecord(value)) return false;
  return ["id", "entryDate", "title", "content", "mood", "moonPhase", "createdAt", "updatedAt"]
    .every((key) => typeof value[key] === "string");
}

function isNote(value: unknown): value is Note {
  if (!isRecord(value)) return false;
  return ["id", "title", "content", "category", "createdAt", "updatedAt"]
    .every((key) => typeof value[key] === "string") && typeof value.isFavorite === "boolean";
}

export function createBackupEnvelope(snapshot: AppSnapshot, createdAt = new Date().toISOString()): BackupEnvelope {
  return {
    manifest: {
      format: "moonbackup",
      formatVersion: 1,
      appVersion: APP_VERSION,
      createdAt,
      databaseSchema: 1,
      encrypted: false,
    },
    data: snapshot,
  };
}

export function serializeBackup(snapshot: AppSnapshot, createdAt?: string): string {
  return JSON.stringify(createBackupEnvelope(snapshot, createdAt), null, 2);
}

export function parseBackup(value: string): AppSnapshot {
  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    throw new Error("O arquivo de backup não contém JSON válido.");
  }
  if (!isRecord(parsed) || !isRecord(parsed.manifest) || !isRecord(parsed.data)) {
    throw new Error("Este arquivo não é um backup Moon Dancer válido.");
  }
  if (parsed.manifest.format !== "moonbackup" || parsed.manifest.formatVersion !== 1) {
    throw new Error("Esta versão do backup ainda não é compatível.");
  }
  const journalEntries = parsed.data.journalEntries;
  const notes = parsed.data.notes;
  if (!Array.isArray(journalEntries) || !journalEntries.every(isJournalEntry) || !Array.isArray(notes) || !notes.every(isNote)) {
    throw new Error("Os dados do backup estão incompletos ou corrompidos.");
  }
  return { journalEntries, notes };
}

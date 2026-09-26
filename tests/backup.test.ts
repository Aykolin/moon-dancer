import { describe, expect, it } from "vitest";
import { parseBackup, serializeBackup } from "../src/lib/backup";
import type { AppSnapshot } from "../src/lib/types";

const snapshot: AppSnapshot = {
  journalEntries: [{
    id: "journal-1",
    entryDate: "2026-09-26",
    title: "Teste",
    content: "Conteúdo preservado",
    mood: "Tranquila",
    moonPhase: "full",
    createdAt: "2026-09-26T10:00:00.000Z",
    updatedAt: "2026-09-26T10:00:00.000Z",
  }],
  notes: [{
    id: "note-1",
    title: "Nota",
    content: "Texto da nota",
    category: "Ideias",
    isFavorite: true,
    createdAt: "2026-09-26T10:00:00.000Z",
    updatedAt: "2026-09-26T10:00:00.000Z",
  }],
};

describe("backup portátil", () => {
  it("preserva diário e notas em uma ida e volta completa", () => {
    const payload = serializeBackup(snapshot, "2026-09-26T12:00:00.000Z");
    expect(parseBackup(payload)).toEqual(snapshot);
  });

  it("recusa formato incompatível", () => {
    const payload = JSON.stringify({ manifest: { format: "outro", formatVersion: 1 }, data: snapshot });
    expect(() => parseBackup(payload)).toThrow("ainda não é compatível");
  });

  it("recusa conteúdo corrompido antes de substituir os dados", () => {
    const payload = JSON.stringify({
      manifest: { format: "moonbackup", formatVersion: 1 },
      data: { journalEntries: [{ id: 12 }], notes: [] },
    });
    expect(() => parseBackup(payload)).toThrow("incompletos ou corrompidos");
  });
});

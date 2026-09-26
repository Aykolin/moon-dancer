import { afterEach, describe, expect, it, vi } from "vitest";
import { defaultSettings, digestPin, loadSettings, saveSettings, verifyPin } from "../src/lib/settings";

afterEach(() => vi.unstubAllGlobals());

describe("aparência e bloqueio", () => {
  it("usa o tema noturno como padrão", () => {
    expect(defaultSettings.theme).toBe("night");
    expect(defaultSettings.language).toBe("pt");
    expect(defaultSettings.mascotEnabled).toBe(true);
  });

  it("gera um resumo estável para o mesmo PIN", async () => {
    const digest = await digestPin("2468");
    expect(digest).toBe(await digestPin("2468"));
    expect(await verifyPin("2468", digest)).toBe(true);
    expect(await verifyPin("8642", digest)).toBe(false);
  });

  it("persiste o bloqueio e as preferências", () => {
    const values = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    });
    saveSettings({ ...defaultSettings, lockEnabled: true, pinDigest: "digest-teste" });
    expect(loadSettings()).toMatchObject({ theme: "night", lockEnabled: true, pinDigest: "digest-teste" });
  });

  it("aceita o tema claro Catppuccin Latte", () => {
    vi.stubGlobal("localStorage", {
      getItem: () => JSON.stringify({ theme: "latte" }),
      setItem: vi.fn(),
    });
    expect(loadSettings().theme).toBe("latte");
  });

  it("persiste o idioma inglês", () => {
    vi.stubGlobal("localStorage", {
      getItem: () => JSON.stringify({ language: "en" }),
      setItem: vi.fn(),
    });
    expect(loadSettings().language).toBe("en");
  });
});

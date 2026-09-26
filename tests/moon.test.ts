import { describe, expect, it } from "vitest";
import { isoDate, moonPhaseFor } from "../src/lib/moon";

describe("calendário lunar", () => {
  it("classifica a lua nova de referência", () => {
    expect(moonPhaseFor(new Date("2000-01-06T18:14:00Z")).key).toBe("new");
  });

  it("mantém uma fase válida para datas anteriores à referência", () => {
    expect(moonPhaseFor("1990-01-01").name.length).toBeGreaterThan(0);
  });

  it("formata a data local como YYYY-MM-DD", () => {
    expect(isoDate(new Date(2026, 8, 25, 9, 30))).toBe("2026-09-25");
  });
});

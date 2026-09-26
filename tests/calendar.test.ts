import { describe, expect, it } from "vitest";
import { buildCalendarMonth } from "../src/lib/calendar";

describe("grade do calendário", () => {
  it("sempre produz seis semanas completas", () => {
    const days = buildCalendarMonth(new Date(2026, 8, 1));
    expect(days).toHaveLength(42);
    expect(days.filter((day) => day.current)).toHaveLength(30);
    expect(days[0].date).toBe("2026-08-30");
    expect(days[41].date).toBe("2026-10-10");
  });

  it("trata corretamente fevereiro em ano bissexto", () => {
    const days = buildCalendarMonth(new Date(2024, 1, 1));
    expect(days.filter((day) => day.current)).toHaveLength(29);
    expect(days.some((day) => day.date === "2024-02-29" && day.current)).toBe(true);
  });
});

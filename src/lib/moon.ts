export interface MoonPhase {
  key: string;
  name: string;
  description: string;
}

const phases: MoonPhase[] = [
  { key: "new", name: "Lua Nova", description: "A lua começa um novo ciclo." },
  { key: "waxing-crescent", name: "Crescente", description: "Um fio de luz aparece no céu." },
  { key: "first-quarter", name: "Quarto Crescente", description: "Metade do disco lunar está iluminada." },
  { key: "waxing-gibbous", name: "Gibosa Crescente", description: "A luz ocupa quase toda a lua." },
  { key: "full", name: "Lua Cheia", description: "O disco lunar aparece completo." },
  { key: "waning-gibbous", name: "Gibosa Minguante", description: "A luz começa a diminuir." },
  { key: "last-quarter", name: "Quarto Minguante", description: "A outra metade do disco permanece iluminada." },
  { key: "waning-crescent", name: "Minguante", description: "O ciclo se aproxima do fim." },
];

const synodicMonth = 29.53058867;
const referenceNewMoon = Date.UTC(2000, 0, 6, 18, 14);

export function moonPhaseFor(date: Date | string, language: "pt" | "en" = "pt"): MoonPhase {
  const instant = typeof date === "string" ? new Date(`${date}T12:00:00`) : date;
  const days = (instant.getTime() - referenceNewMoon) / 86_400_000;
  const age = ((days % synodicMonth) + synodicMonth) % synodicMonth;
  const index = Math.floor((age / synodicMonth) * 8 + 0.5) % 8;
  const phase = phases[index];
  if (language === "pt") return phase;
  const english: Record<string, [string, string]> = {
    new: ["New Moon", "The moon begins a new cycle."],
    "waxing-crescent": ["Waxing Crescent", "A thread of light appears in the sky."],
    "first-quarter": ["First Quarter", "Half of the lunar disk is illuminated."],
    "waxing-gibbous": ["Waxing Gibbous", "Light covers almost the entire moon."],
    full: ["Full Moon", "The lunar disk appears complete."],
    "waning-gibbous": ["Waning Gibbous", "The light begins to fade."],
    "last-quarter": ["Last Quarter", "The other half of the disk remains illuminated."],
    "waning-crescent": ["Waning Crescent", "The cycle is nearing its end."],
  };
  return { key: phase.key, name: english[phase.key][0], description: english[phase.key][1] };
}

export function isoDate(date = new Date()): string {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

export function formatLongDate(value: string, language: "pt" | "en" = "pt"): string {
  return new Intl.DateTimeFormat(language === "en" ? "en-US" : "pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00`));
}

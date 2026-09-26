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

export function moonPhaseFor(date: Date | string): MoonPhase {
  const instant = typeof date === "string" ? new Date(`${date}T12:00:00`) : date;
  const days = (instant.getTime() - referenceNewMoon) / 86_400_000;
  const age = ((days % synodicMonth) + synodicMonth) % synodicMonth;
  const index = Math.floor((age / synodicMonth) * 8 + 0.5) % 8;
  return phases[index];
}

export function isoDate(date = new Date()): string {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

export function formatLongDate(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00`));
}

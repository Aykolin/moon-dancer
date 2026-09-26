import { isoDate } from "./moon";

export interface CalendarDay {
  date: string;
  day: number;
  current: boolean;
}

export function buildCalendarMonth(cursor: Date): CalendarDay[] {
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const previousCount = new Date(year, month, 0).getDate();
  const days: CalendarDay[] = [];

  for (let offset = firstWeekday - 1; offset >= 0; offset--) {
    const date = new Date(year, month - 1, previousCount - offset);
    days.push({ date: isoDate(date), day: date.getDate(), current: false });
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    days.push({ date: isoDate(date), day, current: true });
  }
  for (let day = 1; days.length < 42; day++) {
    const date = new Date(year, month + 1, day);
    days.push({ date: isoDate(date), day: date.getDate(), current: false });
  }

  return days;
}

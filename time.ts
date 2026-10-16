const DAY = 86_400_000;

export function todayKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseDay(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function daysBetween(fromKey: string, to = new Date()): number {
  const from = parseDay(fromKey);
  const toDay = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.round((toDay.getTime() - from.getTime()) / DAY);
}

/** Week of treatment, starting at week 1 on day 0. */
export function weekOf(startKey: string, at = new Date()): number {
  return Math.max(1, Math.floor(daysBetween(startKey, at) / 7) + 1);
}

export function addDays(key: string, n: number): string {
  const d = parseDay(key);
  d.setDate(d.getDate() + n);
  return todayKey(d);
}

export function shortDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export const CHECKIN_EVERY_DAYS = 14;
export const TREATMENT_WEEKS = 24;

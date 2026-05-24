/** Date utilities used across log flow and recall calendar */

export function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function startOfWeek(d: Date): Date {
  // Mon-Sun week
  const x = startOfDay(d);
  const day = x.getDay(); // 0=Sun..6=Sat
  const diff = (day + 6) % 7;
  x.setDate(x.getDate() - diff);
  return x;
}

export function endOfWeek(d: Date): Date {
  const s = startOfWeek(d);
  return addDays(s, 6);
}

export function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

export function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function inRange(d: Date, a: Date, b: Date): boolean {
  const x = +startOfDay(d);
  const lo = Math.min(+startOfDay(a), +startOfDay(b));
  const hi = Math.max(+startOfDay(a), +startOfDay(b));
  return x >= lo && x <= hi;
}

/** YYYY-MM-DD ISO string from a Date */
export function toISODate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Parse YYYY-MM-DD to local Date */
export function fromISODate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function formatDate(d: Date, len: 'short' | 'medium' | 'long' = 'medium'): string {
  if (len === 'long')
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  if (len === 'medium')
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatDateRange(start: Date, end: Date): string {
  if (sameDay(start, end)) return formatDate(start, 'medium');
  if (start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth()) {
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}–${end.getDate()}, ${end.getFullYear()}`;
  }
  return `${formatDate(start, 'medium')} – ${formatDate(end, 'medium')}`;
}

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const WEEKDAYS_SHORT = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

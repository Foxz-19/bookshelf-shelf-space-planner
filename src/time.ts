/** Converts a native time input value to minutes after midnight. */
export function parseTime(value: string): number | null {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;
  const hours = Number(match[1]), minutes = Number(match[2]);
  return hours < 24 && minutes < 60 ? hours * 60 + minutes : null;
}
export function availableMinutes(now: number, wake: number): number { return wake >= now ? wake - now : wake - now + 1440; }
export function addMinutes(start: number, duration: number): string {
  const total = (start + duration) % 1440, h = Math.floor(total / 60), m = total % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}
export function readableTime(value: string, format: '12h' | '24h' = '12h'): string {
  if (format === '24h') return value;
  const [h, m] = value.split(':').map(Number); const suffix = h >= 12 ? 'PM' : 'AM'; const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${suffix}`;
}
export function readableMinutes(value: number): string { return value >= 60 ? `${Math.floor(value / 60)}h ${value % 60 ? `${value % 60}m` : ''}`.trim() : `${value} min`; }

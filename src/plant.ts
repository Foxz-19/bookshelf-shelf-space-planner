import type { Plant, PlantInput, Status } from './types.js';

export const DAY = 86_400_000;
/** Returns a timezone-safe local calendar key rather than a UTC instant. */
export const dateKey = (date = new Date()): string => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const validCalendarKey = (value: string): boolean => { if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false; const [year, month, day] = value.split('-').map(Number), date = new Date(`${value}T12:00:00`); return date.getFullYear() === year && date.getMonth() + 1 === month && date.getDate() === day; };
export const addDays = (date: string, days: number): string => { const d = new Date(`${date}T12:00:00`); d.setDate(d.getDate() + days); return dateKey(d); };
export const dueDate = (plant: Plant): string => addDays(plant.lastWatered, plant.frequency);
export const statusOf = (plant: Plant, today = dateKey()): Status => dueDate(plant) < today ? 'overdue' : dueDate(plant) === today ? 'today' : 'upcoming';
export const daysUntil = (plant: Plant, today = dateKey()): number => Math.round((new Date(`${dueDate(plant)}T12:00:00`).getTime() - new Date(`${today}T12:00:00`).getTime()) / DAY);
export const formatDate = (date: string): string => new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(`${date}T12:00:00`));
export function validate(input: PlantInput): string | undefined {
  if (!input.name.trim()) return 'Give this plant a name before adding it.';
  if (!Number.isInteger(input.frequency) || input.frequency < 1 || input.frequency > 365) return 'Choose a watering interval from 1 to 365 days.';
  if (input.lastWatered && (!validCalendarKey(input.lastWatered) || input.lastWatered > dateKey())) return 'Choose a valid last-watered date that is not in the future.';
  return undefined;
}
export function makePlant(input: PlantInput, today = dateKey()): Plant { return { ...input, name: input.name.trim(), nickname: input.nickname.trim(), note: input.note.trim(), id: crypto.randomUUID(), lastWatered: input.lastWatered || today, createdAt: new Date().toISOString() }; }
export const ordered = (plants: Plant[]): Plant[] => [...plants].sort((a, b) => dueDate(a).localeCompare(dueDate(b)) || a.name.localeCompare(b.name));

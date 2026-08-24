export const DAY = 86_400_000;
export const dateKey = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
export const validCalendarKey = (value) => { if (!/^\d{4}-\d{2}-\d{2}$/.test(value))
    return false; const [year, month, day] = value.split('-').map(Number), date = new Date(`${value}T12:00:00`); return date.getFullYear() === year && date.getMonth() + 1 === month && date.getDate() === day; };
export const addDays = (date, days) => { const d = new Date(`${date}T12:00:00`); d.setDate(d.getDate() + days); return dateKey(d); };
export const dueDate = (plant) => addDays(plant.lastWatered, plant.frequency);
export const statusOf = (plant, today = dateKey()) => dueDate(plant) < today ? 'overdue' : dueDate(plant) === today ? 'today' : 'upcoming';
export const daysUntil = (plant, today = dateKey()) => Math.round((new Date(`${dueDate(plant)}T12:00:00`).getTime() - new Date(`${today}T12:00:00`).getTime()) / DAY);
export const formatDate = (date) => new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(`${date}T12:00:00`));
export function validate(input) {
    if (!input.name.trim())
        return 'Give this plant a name before adding it.';
    if (!Number.isInteger(input.frequency) || input.frequency < 1 || input.frequency > 365)
        return 'Choose a watering interval from 1 to 365 days.';
    if (input.lastWatered && (!validCalendarKey(input.lastWatered) || input.lastWatered > dateKey()))
        return 'Choose a valid last-watered date that is not in the future.';
    return undefined;
}
export function makePlant(input, today = dateKey()) { return { ...input, name: input.name.trim(), nickname: input.nickname.trim(), note: input.note.trim(), id: crypto.randomUUID(), lastWatered: input.lastWatered || today, createdAt: new Date().toISOString() }; }
export const ordered = (plants) => [...plants].sort((a, b) => dueDate(a).localeCompare(dueDate(b)) || a.name.localeCompare(b.name));

const KEY = 'verdant-plants-v1';
const calendarKey = (value) => {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value))
        return false;
    const [year, month, day] = value.split('-').map(Number), date = new Date(`${value}T12:00:00`);
    return date.getFullYear() === year && date.getMonth() + 1 === month && date.getDate() === day;
};
const valid = (value) => {
    if (!value || typeof value !== 'object')
        return false;
    const plant = value;
    return typeof plant.id === 'string' && plant.id.length > 0 && typeof plant.name === 'string' && plant.name.trim().length > 0 && plant.name.length <= 60 && typeof plant.nickname === 'string' && plant.nickname.length <= 40 && typeof plant.note === 'string' && plant.note.length <= 140 && Number.isInteger(plant.frequency) && plant.frequency >= 1 && plant.frequency <= 365 && calendarKey(plant.lastWatered) && typeof plant.createdAt === 'string';
};
export function loadPlants() {
    try {
        const raw = localStorage.getItem(KEY);
        if (!raw)
            return { plants: [] };
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed) || !parsed.every(valid)) {
            localStorage.removeItem(KEY);
            return { plants: [], notice: 'Saved plant data was unreadable and has been safely reset.' };
        }
        return { plants: parsed };
    }
    catch {
        return { plants: [], notice: 'Plant storage is unavailable. Your changes may not persist.' };
    }
}
export function savePlants(plants) { try {
    localStorage.setItem(KEY, JSON.stringify(plants));
}
catch {
    return 'Could not save changes to this browser. Please check storage permissions.';
} }

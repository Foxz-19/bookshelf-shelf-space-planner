import { STATUSES } from './types.js';
import { isValidDate } from './utils.js';
const KEY = 'rooted-propagations-v1';

/** @param {unknown} value @returns {value is import('./types.js').Propagation[]} */
export function isValidEntries(value) {
  return Array.isArray(value) && value.every((entry) => entry && typeof entry.id === 'string' && /^[a-z0-9-]{8,}$/i.test(entry.id) && typeof entry.name === 'string' && typeof entry.method === 'string' && isValidDate(entry.startedAt) && STATUSES.includes(entry.status) && typeof entry.note === 'string' && typeof entry.createdAt === 'string');
}
/** @param {Storage} [storage=localStorage] @returns {{entries: import('./types.js').Propagation[], error: string|null}} */
export function loadEntries(storage = localStorage) {
  let raw;
  try { raw = storage.getItem(KEY); } catch { return { entries: [], error: 'Your saved records could not be opened. You can still use Rooted this session.' }; }
  if (!raw) return { entries: [], error: null };
  try {
    const parsed = JSON.parse(raw);
    if (isValidEntries(parsed)) return { entries: parsed, error: null };
  } catch { /* Corrupt JSON follows the same recovery path as an invalid saved shape. */ }
  try { storage.removeItem(KEY); return { entries: [], error: 'Saved data was unreadable, so we started with a clean bench.' }; }
  catch { return { entries: [], error: 'Saved data was unreadable, but could not be cleared. You can still use Rooted this session.' }; }
}
/** @param {import('./types.js').Propagation[]} entries @param {Storage} [storage=localStorage] @returns {{error:string|null}} */
export function saveEntries(entries, storage = localStorage) { try { storage.setItem(KEY, JSON.stringify(entries)); return { error: null }; } catch { return { error: 'Changes could not be saved to this browser. Your records may disappear on refresh.' }; } }

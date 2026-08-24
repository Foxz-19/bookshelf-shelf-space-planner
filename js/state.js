import { STATUSES } from './types.js';
import { isValidDate } from './utils.js';
function createId() { return globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`; }
/** @param {import('./types.js').Propagation[]} entries */
export function getSummary(entries) { return Object.fromEntries(STATUSES.map((status) => [status, entries.filter((entry) => entry.status === status).length])); }
/** @param {FormData} formData @returns {{entry: import('./types.js').Propagation|null,error:string|null}} */
export function createEntry(formData) {
  const name = String(formData.get('name') || '').trim(), method = String(formData.get('method') || '').trim(), startedAt = String(formData.get('startedAt') || ''), note = String(formData.get('note') || '').trim();
  if (!name || !method || !startedAt) return { entry: null, error: 'Please add a plant name, method, and start date.' };
  if (!isValidDate(startedAt)) return { entry: null, error: 'Please choose a valid start date.' };
  return { entry: { id: createId(), name, method, startedAt, note, status: 'attempting', createdAt: new Date().toISOString() }, error: null };
}
/** @param {import('./types.js').Propagation[]} entries @param {string} id @param {import('./types.js').Status} status */
export function updateStatus(entries, id, status) {
  if (!STATUSES.includes(status)) return entries;
  return entries.map((entry) => entry.id === id ? { ...entry, status } : entry);
}
/** @param {import('./types.js').Propagation[]} entries @param {string} id */
export function removeEntry(entries, id) { return entries.filter((entry) => entry.id !== id); }

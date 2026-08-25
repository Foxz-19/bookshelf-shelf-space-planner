/** @typedef {import('./types').Book} Book */
/** @typedef {import('./types').ShelfState} ShelfState */

export const STORAGE_KEY = 'shelfwise.v1';
export const COLORS = ['#bb5b42', '#e0a32a', '#3a746d', '#406789', '#755c92', '#a84d60'];

/** @returns {ShelfState} */
export const defaultState = () => ({ width: 30, unit: 'in', books: [] });

/** @param {unknown} value @returns {value is ShelfState} */
export function isShelfState(value) {
  return !!value && typeof value === 'object' && Number.isFinite(value.width) && value.width > 0 &&
    (value.unit === 'in' || value.unit === 'cm') && Array.isArray(value.books) &&
    value.books.every(book => book && typeof book.title === 'string' && Number.isFinite(book.width) && book.width > 0);
}

/** @param {ShelfState} state */
export function summary(state) {
  const used = state.books.reduce((total, book) => total + book.width, 0);
  const remaining = state.width - used;
  const percent = state.width ? Number(((used / state.width) * 100).toFixed(6)) : 0;
  return { used, remaining, percent };
}

/** @param {string} title @param {number} width @param {number} index @returns {Book} */
export function makeBook(title, width, index) {
  return { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, title: title.trim(), width, color: COLORS[index % COLORS.length] };
}

/** Converts all existing book measurements when the shelf's display unit changes. @param {ShelfState} state @param {'in'|'cm'} unit */
export function convertBooks(state, unit) {
  if (state.unit === unit) return;
  const factor = unit === 'cm' ? 2.54 : 1 / 2.54;
  state.books = state.books.map(book => ({ ...book, width: Number((book.width * factor).toFixed(6)) }));
  state.unit = unit;
}

/** @param {Storage} storage @returns {{state: ShelfState, notice?: string}} */
export function load(storage) {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return { state: defaultState() };
    const parsed = JSON.parse(raw);
    if (!isShelfState(parsed)) throw new Error('Unsupported data');
    return { state: parsed };
  } catch {
    try { storage.removeItem(STORAGE_KEY); } catch { /* persistence may be blocked */ }
    return { state: defaultState(), notice: 'Saved shelf data could not be read. We started a fresh shelf.' };
  }
}

/** @param {Storage} storage @param {ShelfState} state @returns {string|undefined} */
export function save(storage, state) {
  try { storage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  catch { return 'Changes are visible now, but could not be saved in this browser.'; }
}

import { convertBooks, defaultState, load, makeBook, save, summary } from './core.js';

const $ = (selector) => document.querySelector(selector);
const els = {
  shelfForm: $('#shelf-form'), bookForm: $('#book-form'), shelfWidth: $('#shelf-width'), unit: $('#unit'), widthUnit: $('#width-unit'),
  title: $('#book-title'), bookWidth: $('#book-width'), list: $('#book-list'), empty: $('#empty-state'), meter: $('#meter-fill'),
  remaining: $('#remaining-space'), used: $('#used-space'), overflow: $('#overflow-note'), error: $('#form-error'), toast: $('#toast'),
  clear: $('#clear-button'), dialog: $('#clear-dialog'), dialogCopy: $('#dialog-copy')
};
let state = defaultState();
let toastTimer;
let lastRemoved;
const storage = (() => {
  try { return localStorage; }
  catch { return { getItem() { throw Error('Storage unavailable'); }, setItem() { throw Error('Storage unavailable'); }, removeItem() { throw Error('Storage unavailable'); } }; }
})();

function format(value) { return `${new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.abs(value))} ${state.unit}`; }
function announce(message, canUndo = false) {
  clearTimeout(toastTimer); els.toast.replaceChildren(document.createTextNode(message));
  if (canUndo) { const undo = document.createElement('button'); undo.id = 'undo-remove'; undo.type = 'button'; undo.textContent = 'Undo'; els.toast.append(' ', undo); }
  els.toast.classList.add('visible'); toastTimer = setTimeout(() => { els.toast.classList.remove('visible'); lastRemoved = undefined; }, 5500);
}
function persist() { const error = save(storage, state); if (error) announce(error); }
function render() {
  const info = summary(state);
  const overflow = info.remaining < 0;
  const className = overflow ? 'is-overflow' : info.percent > 80 ? 'is-warning' : '';
  els.meter.style.transform = `scaleX(${Math.min(info.percent, 100) / 100})`;
  els.meter.className = `meter-fill ${className}`;
  els.remaining.textContent = overflow ? `${format(info.remaining)} over` : `${format(info.remaining)} left`;
  els.remaining.classList.toggle('is-overflow', overflow);
  els.used.textContent = `${format(info.used)} / ${format(state.width)}`;
  els.overflow.textContent = overflow ? `Over capacity by ${format(info.remaining)}. Remove a book or increase shelf width.` : info.percent > 80 ? 'Nearly full — a little room remains.' : '';
  els.overflow.classList.toggle('is-overflow', overflow);
  els.widthUnit.textContent = state.unit;
  els.shelfWidth.value = String(state.width);
  els.unit.value = state.unit;
  els.list.replaceChildren(...state.books.map((book) => {
    const item = document.createElement('button');
    item.type = 'button'; item.className = 'book'; item.style.setProperty('--book-color', book.color);
    item.style.width = `${Math.max(28, Math.min((book.width / state.width) * 100, 100))}%`;
    item.dataset.id = book.id; item.setAttribute('aria-label', `Remove ${book.title}, ${format(book.width)}`);
    item.innerHTML = `<span>${escapeHtml(book.title)}</span><small>${format(book.width)}</small>`;
    return item;
  }));
  els.empty.hidden = state.books.length > 0;
  els.clear.disabled = state.books.length === 0;
}
function escapeHtml(value) { const div = document.createElement('div'); div.textContent = value; return div.innerHTML; }
function validateNumber(value, min, label, input) { const n = Number(value); if (Number.isFinite(n) && n >= min) return n; els.error.textContent = `Enter a valid ${label}.`; input.focus(); return null; }

els.shelfForm.addEventListener('submit', (event) => {
  event.preventDefault(); els.error.textContent = '';
  const width = validateNumber(els.shelfWidth.value, 0.1, 'shelf width greater than zero', els.shelfWidth); if (!width) return;
  const unit = els.unit.value === 'cm' ? 'cm' : 'in';
  convertBooks(state, unit); state.width = width; persist(); render(); announce('Shelf dimensions updated.');
});
els.bookForm.addEventListener('submit', (event) => {
  event.preventDefault(); els.error.textContent = '';
  const title = els.title.value.trim(); const width = validateNumber(els.bookWidth.value, 0.01, 'book spine width', els.bookWidth);
  if (!title) { els.error.textContent = 'Give this book a short title.'; els.title.focus(); return; }
  if (!width) return;
  state.books.push(makeBook(title, width, state.books.length)); persist(); render(); els.bookForm.reset(); els.title.focus(); announce(`${title} placed on the shelf.`);
});
els.list.addEventListener('click', (event) => {
  const button = event.target.closest('.book'); if (!button) return;
  const index = state.books.findIndex(item => item.id === button.dataset.id); const book = state.books[index];
  state.books.splice(index, 1); lastRemoved = { book, index }; persist(); render(); announce(`${book?.title || 'Book'} removed from shelf.`, true);
});
els.toast.addEventListener('click', (event) => {
  if (event.target.id !== 'undo-remove' || !lastRemoved) return;
  state.books.splice(lastRemoved.index, 0, lastRemoved.book); lastRemoved = undefined; persist(); render(); announce('Book restored to shelf.');
});
els.clear.addEventListener('click', () => { els.dialogCopy.textContent = `This will remove ${state.books.length} book${state.books.length === 1 ? '' : 's'} from this shelf.`; els.dialog.showModal(); });
els.dialog.addEventListener('close', () => { if (els.dialog.returnValue === 'confirm') { state.books = []; persist(); render(); announce('Shelf cleared.'); } els.clear.focus(); });

const loaded = load(storage); state = loaded.state; render(); if (loaded.notice) announce(loaded.notice);

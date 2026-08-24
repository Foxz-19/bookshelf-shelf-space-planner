import { STATUS_LABELS } from './types.js';
import { escapeHtml } from './utils.js';
const formatter = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
/** @param {string} date */
function formatDate(date) { return formatter.format(new Date(`${date}T12:00:00`)); }
/** @param {import('./types.js').Propagation[]} entries @param {string} filter */
export function renderEntries(entries, filter) {
  const visible = filter === 'all' ? entries : entries.filter((entry) => entry.status === filter);
  if (!visible.length) return `<div class="empty"><span>⌁</span><h3>${entries.length ? 'Nothing at this stage yet.' : 'Your bench is ready.'}</h3><p>${entries.length ? 'Try another stage, or add a fresh cutting.' : 'Add the first little start you want to remember.'}</p></div>`;
  return visible.map((entry) => `<article class="entry" data-id="${entry.id}"><div class="entry-top"><span class="badge badge-${entry.status}">${STATUS_LABELS[entry.status]}</span><div class="entry-actions"><button class="text-button" data-action="edit" aria-label="Edit ${escapeHtml(entry.name)}">Edit</button><button class="icon-button delete" data-action="delete" aria-label="Remove ${escapeHtml(entry.name)}">×</button></div></div><h3>${escapeHtml(entry.name)}</h3><p class="method">${escapeHtml(entry.method)}</p><dl><div><dt>Started</dt><dd>${formatDate(entry.startedAt)}</dd></div></dl>${entry.note ? `<p class="note">${escapeHtml(entry.note)}</p>` : ''}<label class="status-control"><span>Progress</span><select data-action="status" aria-label="Update status for ${escapeHtml(entry.name)}">${Object.entries(STATUS_LABELS).map(([key, label]) => `<option value="${key}" ${key === entry.status ? 'selected' : ''}>${label}</option>`).join('')}</select></label></article>`).join('');
}
/** @param {ReturnType<import('./state.js').getSummary>} summary */
export function renderSummary(summary) { document.querySelector('#count-attempting').textContent = String(summary.attempting); document.querySelector('#count-rooting').textContent = String(summary.rooting); document.querySelector('#count-potted').textContent = String(summary.potted); document.querySelector('#count-failed').textContent = String(summary.failed); }

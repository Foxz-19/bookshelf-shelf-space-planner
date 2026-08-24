import { dateKey, daysUntil, dueDate, formatDate, makePlant, ordered, statusOf, validate } from './plant.js';
import { loadPlants, savePlants } from './storage.js';
const $ = (selector) => { const el = document.querySelector(selector); if (!el)
    throw new Error(`Missing ${selector}`); return el; };
const form = $('#plant-form'), list = $('#plant-list'), summary = $('#summary'), error = $('#form-error'), notices = $('#notices'), dialog = $('#delete-dialog'), submitButton = $('#submit-button'), cancelEdit = $('#edit-cancel'), lastWatered = $('#last-watered');
let plants = [];
let pendingDelete;
let returnFocus;
let editingId;
function notice(message, kind = 'info') { const item = document.createElement('p'); item.className = `notice ${kind}`; item.textContent = message; notices.prepend(item); if (kind === 'info')
    setTimeout(() => item.remove(), 4200); }
function persist() { const message = savePlants(plants); if (message)
    notice(message, 'error'); return message; }
function updatePlants(next) { const previous = plants; plants = next; const storageError = persist(); if (storageError)
    plants = previous; render(); return storageError; }
function label(status, days) { if (status === 'overdue')
    return `${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} overdue`; if (status === 'today')
    return 'Water today'; return `Due in ${days} days`; }
function render() {
    const counts = { overdue: 0, today: 0, upcoming: 0 };
    plants.forEach(p => counts[statusOf(p)]++);
    summary.innerHTML = `<strong>${plants.length}</strong> plants <span>·</span> <strong>${counts.overdue + counts.today}</strong> need attention`;
    if (!plants.length) {
        list.innerHTML = `<div class="empty"><span>✦</span><h3>Your shelf is waiting.</h3><p>Add your first plant and its rhythm will live here.</p></div>`;
        list.setAttribute('aria-busy', 'false');
        return;
    }
    list.innerHTML = ordered(plants).map(plant => { const status = statusOf(plant), days = daysUntil(plant), id = escapeAttr(plant.id); return `<article class="plant ${status}" data-id="${id}"><div class="plant-status"><span class="status-ring"></span><span>${label(status, days)}</span></div><div class="plant-main"><div><h3>${escapeHtml(plant.name)}</h3>${plant.nickname ? `<p class="nickname">${escapeHtml(plant.nickname)}</p>` : ''}</div><p class="interval">Every <b>${plant.frequency}</b> days</p></div>${plant.note ? `<p class="care-note">${escapeHtml(plant.note)}</p>` : ''}<div class="plant-footer"><p><span>Next water</span><strong>${formatDate(dueDate(plant))}</strong></p><div><button class="water-button" type="button" data-action="water" data-id="${id}">Water now <span>↗</span></button><button class="edit-button" type="button" data-action="edit" data-id="${id}">Edit</button><button class="icon-button" type="button" data-action="delete" data-id="${id}" aria-label="Remove ${escapeAttr(plant.name)}">×</button></div></div></article>`; }).join('');
    list.setAttribute('aria-busy', 'false');
}
function escapeHtml(text) { const node = document.createElement('span'); node.textContent = text; return node.innerHTML; }
function escapeAttr(text) { return escapeHtml(text).replace(/"/g, '&quot;'); }
function resetForm() { editingId = undefined; form.reset(); $('#frequency').setAttribute('value', '7'); $('#note-count').textContent = '0'; submitButton.innerHTML = 'Add to collection <span>↗</span>'; cancelEdit.hidden = true; error.hidden = true; }
function savePlant(input) { const invalid = validate(input); if (invalid) {
    error.textContent = invalid;
    error.hidden = false;
    return;
} const editing = plants.find(p => p.id === editingId), next = editing ? plants.map(p => p.id === editing.id ? { ...p, ...input, name: input.name.trim(), nickname: input.nickname.trim(), note: input.note.trim(), lastWatered: input.lastWatered || p.lastWatered } : p) : [...plants, makePlant(input)], storageError = updatePlants(next); if (storageError) {
    error.textContent = storageError;
    error.hidden = false;
}
else {
    notice(editing ? `${input.name.trim()} updated.` : `${input.name.trim()} is now on your care schedule.`);
    resetForm();
} }
function startEdit(id) { const plant = plants.find(p => p.id === id); if (!plant)
    return; editingId = id; $('#plant-name').value = plant.name; $('#nickname').value = plant.nickname; $('#frequency').value = String(plant.frequency); lastWatered.value = plant.lastWatered; $('#note').value = plant.note; $('#note-count').textContent = String(plant.note.length); submitButton.innerHTML = `Save ${escapeHtml(plant.name)} <span>↗</span>`; cancelEdit.hidden = false; error.hidden = true; $('#plant-name').focus(); }
form.addEventListener('submit', event => { event.preventDefault(); const data = new FormData(form); savePlant({ name: String(data.get('name') ?? ''), nickname: String(data.get('nickname') ?? ''), frequency: Number(data.get('frequency')), note: String(data.get('note') ?? ''), lastWatered: String(data.get('lastWatered') ?? '') }); });
cancelEdit.addEventListener('click', resetForm);
$('#note').addEventListener('input', event => { $('#note-count').textContent = String(event.target.value.length); });
list.addEventListener('click', event => { const button = event.target.closest('button[data-action]'); if (!button)
    return; const id = button.dataset.id; if (button.dataset.action === 'water') {
    const plant = plants.find(p => p.id === id);
    if (!plant)
        return;
    const today = dateKey(), updated = { ...plant, lastWatered: today }, storageError = updatePlants(plants.map(p => p.id === id ? updated : p));
    if (!storageError)
        notice(`${plant.name} watered. Next up: ${formatDate(dueDate(updated))}.`);
}
else if (button.dataset.action === 'edit')
    startEdit(id);
else {
    pendingDelete = id;
    returnFocus = button;
    const plant = plants.find(p => p.id === id);
    $('#delete-copy').textContent = `This will permanently remove ${plant?.name ?? 'this plant'} from your collection.`;
    dialog.showModal();
} });
dialog.addEventListener('close', () => { if (dialog.returnValue === 'confirm' && pendingDelete) {
    const plant = plants.find(p => p.id === pendingDelete), storageError = updatePlants(plants.filter(p => p.id !== pendingDelete));
    if (!storageError) {
        if (editingId === pendingDelete) {
            resetForm();
            returnFocus = $('#plant-name');
        }
        notice(`${plant?.name ?? 'Plant'} removed.`);
    }
} pendingDelete = undefined; returnFocus?.focus(); returnFocus = undefined; });
$('#theme-toggle').addEventListener('click', event => { document.body.classList.toggle('night'); const button = event.currentTarget; const dark = document.body.classList.contains('night'); button.textContent = dark ? 'Day view' : 'Night view'; button.setAttribute('aria-pressed', String(dark)); });
const loaded = loadPlants();
plants = loaded.plants;
lastWatered.max = dateKey();
if (loaded.notice)
    notice(loaded.notice, 'error');
$('#today').textContent = new Intl.DateTimeFormat('en', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date());
render();

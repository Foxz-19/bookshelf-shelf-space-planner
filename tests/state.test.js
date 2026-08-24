import test from 'node:test';
import assert from 'node:assert/strict';
import { createEntry, getSummary, removeEntry, updateEntry, updateStatus } from '../js/state.js';
// A small FormData-compatible double keeps validation tests independent of the DOM.
const form = (values) => ({ get: (key) => values[key] ?? null });
test('requires the three essential fields', () => assert.equal(createEntry(form({ name: '', method: '', startedAt: '' })).error !== null, true));
test('rejects impossible calendar dates', () => assert.equal(createEntry(form({ name: 'Fern', method: 'Soil', startedAt: '2026-02-31' })).error !== null, true));
test('creates an attempting propagation and counts all statuses', () => { const entry = createEntry(form({ name: 'Pothos', method: 'Water', startedAt: '2026-08-24', note: '' })).entry; const summary = getSummary([entry, { ...entry, id: '2', status: 'rooting' }]); assert.deepEqual(summary, { attempting: 1, rooting: 1, potted: 0, failed: 0 }); });
test('updates and removes a propagation immutably', () => { const entries = [{ id: 'a', status: 'attempting' }]; const changed = updateStatus(entries, 'a', 'potted'); assert.equal(changed[0].status, 'potted'); assert.equal(removeEntry(changed, 'a').length, 0); });
test('rejects an invalid status transition', () => { const entries = [{ id: 'a', status: 'attempting' }]; assert.equal(updateStatus(entries, 'a', 'unknown')[0].status, 'attempting'); });
test('edits fields without resetting status or identity', () => { const entries = [{ id: 'a', name: 'Old', method: 'Water', startedAt: '2026-08-01', note: '', status: 'rooting', createdAt: 'x' }]; const result = updateEntry(entries, 'a', form({ name: 'New', method: 'Soil', startedAt: '2026-08-02', note: 'Updated' })); assert.deepEqual(result.entries[0], { ...entries[0], name: 'New', method: 'Soil', startedAt: '2026-08-02', note: 'Updated' }); });

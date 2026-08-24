import test from 'node:test'; import assert from 'node:assert/strict';
import { addDays, dueDate, makePlant, statusOf, validate } from '../js/plant.js';
import { loadPlants, savePlants } from '../js/storage.js';
const plant = { id: '1', name: 'Fern', nickname: '', note: '', frequency: 7, lastWatered: '2026-08-20', createdAt: '' };
test('calculates due date without mutating the plant', () => { assert.equal(dueDate(plant), '2026-08-27'); assert.equal(plant.lastWatered, '2026-08-20'); });
test('classifies watering urgency', () => { assert.equal(statusOf(plant, '2026-08-28'), 'overdue'); assert.equal(statusOf(plant, '2026-08-27'), 'today'); assert.equal(statusOf(plant, '2026-08-26'), 'upcoming'); });
test('rejects invalid plant input', () => { assert.match(validate({ name: '', nickname: '', note: '', frequency: 7 }), /name/); assert.match(validate({ name: 'Fern', nickname: '', note: '', frequency: 0 }), /1 to 365/); assert.equal(addDays('2026-01-30', 2), '2026-02-01'); });
test('supports a valid historical watering date', () => { const input = { name: 'Fern', nickname: '', note: '', frequency: 7, lastWatered: '2026-08-20' }; assert.equal(validate(input), undefined); assert.equal(makePlant(input, '2026-08-24').lastWatered, '2026-08-20'); assert.match(validate({ ...input, lastWatered: '2026-02-30' }), /valid last-watered/); });
test('recovers visibly from malformed saved data', () => {
  const removed = []; globalThis.localStorage = { getItem: () => '[{"id":"x","name":"","frequency":0}]', removeItem: key => removed.push(key), setItem: () => {} };
  const result = loadPlants(); assert.deepEqual(result.plants, []); assert.match(result.notice, /unreadable/); assert.deepEqual(removed, ['verdant-plants-v1']);
});
test('rejects impossible calendar dates in saved data', () => {
  globalThis.localStorage = { getItem: () => '[{"id":"x","name":"Fern","nickname":"","note":"","frequency":7,"lastWatered":"2026-02-30","createdAt":""}]', removeItem: () => {}, setItem: () => {} };
  assert.match(loadPlants().notice, /unreadable/);
});
test('reports a storage write failure', () => {
  globalThis.localStorage = { getItem: () => null, removeItem: () => {}, setItem: () => { throw new Error('blocked'); } };
  assert.match(savePlants([plant]), /Could not save changes/);
});
test('reports a storage read failure', () => {
  globalThis.localStorage = { getItem: () => { throw new Error('blocked'); }, removeItem: () => {}, setItem: () => {} };
  assert.match(loadPlants().notice, /storage is unavailable/);
});

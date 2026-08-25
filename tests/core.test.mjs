import test from 'node:test';
import assert from 'node:assert/strict';
import { convertBooks, defaultState, isShelfState, summary, save, load } from '../src/core.js';
test('summary calculates used, remaining and capacity', () => { const state = { width: 10, unit: 'in', books: [{ width: 6 }, { width: 5 }] }; assert.deepEqual(summary(state), { used: 11, remaining: -1, percent: 110 }); });
test('state validation rejects malformed persistence', () => { assert.equal(isShelfState(defaultState()), true); assert.equal(isShelfState({ width: 0, unit: 'in', books: [] }), false); assert.equal(isShelfState({ width: 30, unit: 'in', books: [{ title: 'Broken', width: 1 }] }), false); });
test('load visibly recovers malformed data and save reports failures', () => { const bad = { getItem: () => '{oops', removeItem() {} }; assert.match(load(bad).notice, /fresh shelf/i); const blocked = { setItem() { throw Error('blocked'); } }; assert.match(save(blocked, defaultState()), /could not be saved/i); });
test('unit changes convert existing book measurements without changing physical occupancy', () => { const state = { width: 30, unit: 'in', books: [{ id: '1', title: 'Test', width: 1.2, color: '#000' }] }; convertBooks(state, 'cm'); assert.equal(state.unit, 'cm'); assert.equal(state.books[0].width, 3.048); });

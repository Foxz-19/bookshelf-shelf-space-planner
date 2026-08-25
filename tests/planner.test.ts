import { describe, expect, it } from 'vitest';
import { createPlan } from '../src/planner';
import { availableMinutes, parseTime } from '../src/time';
describe('nap planning', () => {
  it('handles overnight wake-ups', () => expect(availableMinutes(23 * 60 + 50, 20)).toBe(30));
  it('treats an identical wake time as no available nap time', () => expect(createPlan(500, 500).warning).toContain('wake-up time is now'));
  it('rejects malformed times', () => expect(parseTime('25:00')).toBeNull());
  it('warns when there is less than ten minutes', () => expect(createPlan(500, 508).warning).toContain('8 minutes'));
  it('recommends a sleep cycle only when it fits', () => expect(createPlan(500, 600).options.some(x => x.kind === 'Sleep Cycle Nap')).toBe(true));
  it('gives a short window a power nap ending at wake time', () => expect(createPlan(500, 515).options[0].minutes).toBe(15));
  it('caps a power nap at twenty minutes and retains the full-window choice', () => {
    const plan = createPlan(500, 550);
    expect(plan.options.find(x => x.kind === 'Power Nap')?.minutes).toBe(20);
    expect(plan.options.find(x => x.kind === 'Full Nap')?.minutes).toBe(50);
  });
  it('keeps the Full Nap label visible when its duration matches another recommendation', () => expect(createPlan(500, 590).options.map(x => x.kind)).toEqual(['Power Nap', 'Sleep Cycle Nap', 'Full Nap']));
  it('formats midnight rollover correctly', () => expect(createPlan(23 * 60 + 50, 20).options[0].alarm).toBe('00:10'));
});

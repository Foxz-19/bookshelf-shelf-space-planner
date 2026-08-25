import { addMinutes, availableMinutes } from './time';
import type { NapOption, Plan } from './types';
const make = (kind: NapOption['kind'], minutes: number, now: number, description: string, featured = false): NapOption => ({ kind, minutes, alarm: addMinutes(now, minutes), description, featured });
export function createPlan(now: number, wake: number): Plan {
  const available = availableMinutes(now, wake);
  if (available < 10) return { available, options: [], warning: available === 0 ? 'Your wake-up time is now — skip the nap and give yourself a slow breath instead.' : `Only ${available} minutes remain — skip the nap and give yourself a slow breath instead.` };
  const options: NapOption[] = [];
  const power = Math.min(20, available);
  options.push(make('Power Nap', power, now, 'A quick reset. You should wake up clear, not groggy.'));
  if (available >= 90) options.push(make('Sleep Cycle Nap', 90, now, 'One full cycle for a properly rested feeling.', true));
  options.push(make('Full Nap', available, now, 'Use every quiet minute you have. Wake when you need to.'));
  return { available, options };
}

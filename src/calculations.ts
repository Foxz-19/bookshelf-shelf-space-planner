import type { Day, SleepState, WeeklyTotals } from './types';

export const clampHours = (value: number): number => Number.isFinite(value) ? Math.min(24, Math.max(0, value)) : 0;
export const cleanGoal = (value: number): number => Number.isFinite(value) ? Math.min(24, Math.max(0, value)) : 0;
export const difference = (hours: number, goal: number): number => clampHours(hours) - cleanGoal(goal);
export function totals(state: SleepState): WeeklyTotals {
  const slept = Object.values(state.hours).reduce((sum, value) => sum + clampHours(value), 0);
  const target = cleanGoal(state.goal) * 7;
  return { slept, target, difference: slept - target, progress: target === 0 ? 0 : Math.min(100, slept / target * 100) };
}
export const formatHours = (value: number): string => Number.isInteger(value) ? String(value) : value.toFixed(1).replace(/\.0$/, '');
export function balanceMessage(value: number): string {
  if (value < 0) return `You owe yourself ${formatHours(Math.abs(value))} ${Math.abs(value) === 1 ? 'hour' : 'hours'} of sleep`;
  if (value > 0) return `You are ahead by ${formatHours(value)} ${value === 1 ? 'hour' : 'hours'} of sleep`;
  return 'Your week is perfectly balanced';
}
export const dayDifference = (state: SleepState, day: Day) => difference(state.hours[day], state.goal);

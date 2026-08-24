export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;
export type Day = typeof DAYS[number];
export interface SleepState { goal: number; hours: Record<Day, number>; }
export interface WeeklyTotals { slept: number; target: number; difference: number; progress: number; }

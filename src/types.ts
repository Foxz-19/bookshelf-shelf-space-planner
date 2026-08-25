export interface NapOption { kind: 'Power Nap' | 'Sleep Cycle Nap' | 'Full Nap'; minutes: number; alarm: string; description: string; featured?: boolean; alsoFullNap?: boolean; tomorrow?: boolean; }
export interface Plan { available: number; options: NapOption[]; warning?: string; }
export type TimeFormat = '12h' | '24h';

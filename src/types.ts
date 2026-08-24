export interface Plant { id: string; name: string; nickname: string; frequency: number; note: string; lastWatered: string; createdAt: string; }
export type PlantInput = Pick<Plant, 'name' | 'nickname' | 'frequency' | 'note'> & { lastWatered?: string };
export type Status = 'overdue' | 'today' | 'upcoming';
export interface LoadResult { plants: Plant[]; notice?: string; }

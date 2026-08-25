/** A single book positioned on the planned shelf. */
export interface Book { id: string; title: string; width: number; color: string; }
/** The persisted state contract for Shelfwise. */
export interface ShelfState { width: number; unit: 'in' | 'cm'; books: Book[]; }
export interface LoadResult { state: ShelfState; notice?: string; }

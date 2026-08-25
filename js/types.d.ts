export type Style = 'cozy' | 'comfortable' | 'sprawled';

export interface PicnicInput {
  people: number;
  style: Style;
  gear: boolean;
}

export interface BlanketPlan {
  width: number;
  length: number;
  metersWidth: string;
  metersLength: string;
  comparison: string;
}

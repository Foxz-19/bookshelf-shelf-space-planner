export type Status = 'attempting' | 'rooting' | 'potted' | 'failed';

export interface Propagation {
  id: string;
  name: string;
  method: string;
  startedAt: string;
  status: Status;
  note: string;
  createdAt: string;
}

export interface IPastStreamInfo {
  link: string;
  title: string;
  endTime: number;
}

export class PastStreamInfo implements IPastStreamInfo {
  constructor(init?: Partial<IPastStreamInfo>) {
    Object.assign(this, init);
  }

  link: string;
  title: string;
  endTime: number;
}

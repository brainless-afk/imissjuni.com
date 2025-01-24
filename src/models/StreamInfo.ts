export interface IStreamInfo {
  live: number;
  title: string;
  thumbnail: string;
  videoLink: string;
  streamStartTime: number | undefined;
  isMembersOnly: boolean;
  streamType: number;
}

export class StreamInfo implements IStreamInfo {
  constructor(init?: Partial<IStreamInfo>) {
    Object.assign(this, init);
  }

  live: number;
  title: string;
  thumbnail: string;
  videoLink: string;
  streamStartTime: number | undefined;
  isMembersOnly: boolean;
  streamType: number;
}

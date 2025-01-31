import { IStreamInfo } from "./StreamInfo";

export interface ILiveStreamInfo {
  isError: boolean;
  status: number | undefined;
  streamInfo: IStreamInfo | undefined;
  usedImageSet: string[];
}

export class LiveStreamInfo implements ILiveStreamInfo {
  constructor(init?: Partial<ILiveStreamInfo>) {
    Object.assign(this, init);
  }

  isError: boolean;
  status: number;
  streamInfo: IStreamInfo | undefined;
  usedImageSet: string[];
}

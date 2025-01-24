import { IStreamInfo } from "./StreamInfo";

export interface ILiveStreamInfo {
  initialImage: string;
  isError: boolean;
  status: number | undefined;
  streamInfo: IStreamInfo | undefined;
  usedImageSet: string[];
}

export class LiveStreamInfo implements ILiveStreamInfo {
  constructor(init?: Partial<ILiveStreamInfo>) {
    Object.assign(this, init);
  }

  initialImage: string;
  isError: boolean;
  status: number;
  streamInfo: IStreamInfo | undefined;
  usedImageSet: string[];
}

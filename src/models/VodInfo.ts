export interface IVodInfo {
  video_link: string;
  title: string;
  thumbnail: string;
  uploaded_date: number;
  length_seconds: number;
  members_only: number;
  _last_valid: number;
}

export class VodInfo implements IVodInfo {
  constructor(init?: Partial<IVodInfo>) {
    Object.assign(this, init);
  }

  video_link: string;
  title: string;
  thumbnail: string;
  uploaded_date: number;
  length_seconds: number;
  members_only: number;
  _last_valid: number;
}

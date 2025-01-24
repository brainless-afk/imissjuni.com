export interface ICachedStreamInfo {
  video_link: string;
  status: number;
  title: string;
  thumbnail: string;
  start_time: number;
  members_only: number;
  type: number;
  last_check_time: number;
}

export class CachedStreamInfo implements ICachedStreamInfo {
  constructor(init?: Partial<ICachedStreamInfo>) {
    Object.assign(this, init);
  }

  video_link: string;
  status: number;
  title: string;
  thumbnail: string;
  start_time: number;
  members_only: number;
  type: number;
  last_check_time: number;
}

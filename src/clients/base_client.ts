import { StreamInfo } from "../models/StreamInfo";
import { ICachedStreamInfo } from "../models/CachedStreamInfo";
import { IVodInfo } from "../models/VodInfo";

export interface IBaseCoordinator {
  /**
   * Retrieves cached stream information near a specific timestamp.
   * @param nearTime - The timestamp to search for nearby streams.
   * @returns A promise resolving to the cached stream information.
   */
  getCachedStreamInfo(nearTime: number): Promise<ICachedStreamInfo>;

  /**
   * Updates the cache with a list of stream information.
   * @param streamInfos - The list of StreamInfo objects to update in the cache.
   * @returns A promise resolving when the update is complete.
   */
  updateCache(streamInfos: StreamInfo[]): Promise<void>;

  /**
   * Retrieves a random VOD (Video on Demand) information entry.
   * @returns A promise resolving to the VOD information.
   */
  getVod(): Promise<IVodInfo | undefined>;

  /**
   * Add list to vods table
   * @param vodEntries List of youtube videos
   */
  insertVods(vodEntries: IVodInfo[]): Promise<void>;

  /**
   * Cleans up and closes the database connection.
   * @returns A promise resolving when the teardown is complete.
   */
  teardown(): Promise<void>;
}

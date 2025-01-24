import { STREAM_STATUS, STREAM_TYPE } from "../common/enums";
import { getStreamInfos } from "./stream_finder";
import { pollPaststreamStatusTwitch } from "./poll_twitch_paststream";
import { pollPaststreamStatus } from "./poll_youtube_paststream";
import { pollTwitchLivestreamStatus } from "./poll_twitch_livestream";
import { pollYoutubeLivestreamStatus } from "./poll_youtube_livestream";
import { IBaseCoordinator } from "../clients/base_client";
import { ICachedStreamInfo } from "../models/CachedStreamInfo";
import { IStreamInfo, StreamInfo } from "../models/StreamInfo";
import { pollHolodexLivestreamStatus } from "./poll_holodex_livestream";

export interface IBasicResponse {
  error: string | null;
  result: StreamInfo | null;
}

async function revalidateCachedStream(
  coordinator: IBaseCoordinator,
  cachedStreamInfo: ICachedStreamInfo,
  age: number
): Promise<IStreamInfo | null> {
  if (!cachedStreamInfo) {
    return null;
  }

  console.debug("[revalidateCachedStream]", "time since last check:", age);
  if (
    cachedStreamInfo.type == STREAM_TYPE.LIVE_STREAM &&
    !cachedStreamInfo.members_only
  ) {
    if (age > 90000) {
      console.debug(
        "[revalidateCachedStream]",
        "discarding stale normal stream data"
      );
      return null;
    }

    return new StreamInfo({
      live: cachedStreamInfo.status,
      title: cachedStreamInfo.title,
      videoLink: cachedStreamInfo.video_link,
      streamStartTime: cachedStreamInfo.start_time,
      thumbnail: cachedStreamInfo.thumbnail,
      isMembersOnly: !!cachedStreamInfo.members_only,
      streamType: cachedStreamInfo.type,
    });
  }

  const videoIdMatch = cachedStreamInfo.video_link.match(
    /\?v=([a-zA-Z0-9_-]{11})/
  );
  
  if (!videoIdMatch) {
    return null;
  }

  const { result, error } = await getStreamInfos(
    [videoIdMatch[1]],
    process.env.WATCH_YT_CHANNEL_ID || ""
  );
  if (error || !result) {
    return null;
  }

  const refreshedInfo = result.filter(
    (v) => v.videoLink === cachedStreamInfo.video_link
  )?.[0];
  if (!refreshedInfo) {
    return null;
  }

  await coordinator.updateCache([refreshedInfo]);
  return refreshedInfo;
}

export async function getKnownStreamData(
  coordinator: IBaseCoordinator
): Promise<IStreamInfo | null> {
  const now = Date.now();
  const cachedStreamInfo = await coordinator.getCachedStreamInfo(now);
  const result = await revalidateCachedStream(
    coordinator,
    cachedStreamInfo,
    now - cachedStreamInfo.last_check_time
  );

  if (result && result.streamType !== STREAM_TYPE.DEAD) {
    if (result.live !== STREAM_STATUS.LIVE && result.streamStartTime) {
      const waitTime = result.streamStartTime - now;
      if (waitTime > 1800 * 1000) {
        result.live = STREAM_STATUS.OFFLINE;
      } else {
        result.live = STREAM_STATUS.STARTING_SOON;
      }
    }
    return result;
  }

  return null;
}

export async function getPastStream() {
  let pastStreamVal;

  if (process.env.WATCH_TWITCH_USER_ID) {
    pastStreamVal = await pollPaststreamStatusTwitch(
      process.env.WATCH_TWITCH_USER_ID
    );
  } else {
    pastStreamVal = await pollPaststreamStatus(
      process.env.WATCH_YT_CHANNEL_ID || ""
    );
  }

  const { error: pastStreamError, result: pastStreamResult } = pastStreamVal;
  if (pastStreamError) {
    console.warn("paststream poll returned error:", pastStreamError);
    // Error is non-blocking. Gracefully fall back to not displaying things related to past stream
    return null;
  }

  return pastStreamResult;
}

export async function getLiveStreamData(): Promise<IBasicResponse> {
  let apiVal;

  if (process.env.WATCH_TWITCH_USER_ID) {
    apiVal = await pollTwitchLivestreamStatus(process.env.WATCH_TWITCH_USER_ID);
  } else if (process.env.WATCH_YT_CHANNEL_ID && process.env.HOLODEX_API_KEY) {
    apiVal = await pollHolodexLivestreamStatus();
  } else {
    apiVal = await pollYoutubeLivestreamStatus(
      process.env.WATCH_YT_CHANNEL_ID || ""
    );
  }

  return apiVal;
}

export async function getDatabase(): Promise<IBaseCoordinator> {
  if (process.env.DATABASE_TYPE === "sqlite3") {
    return await (await import("../clients/sqlite_client")).getCoordinator();
  } else {
    return await (await import("../clients/postgres_client")).getCoordinator();
  }
}

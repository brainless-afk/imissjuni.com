import {
  pollYoutubeLivestreamStatus,
  pollTwitchLivestreamStatus,
  pollLivestreamStatusDummy,
} from "../server/livestream_poller";
import {
  pollPaststreamStatus,
  pollPaststreamStatusTwitch,
} from "../server/paststream_poller";
import { STREAM_STATUS, STREAM_TYPE } from "../common/enums";

async function revalidateCachedStream(coordinator, streamInfo, age) {
  if (!streamInfo) {
    return null;
  }

  console.debug("[revalidateCachedStream]", "time since last check:", age);
  if (
    streamInfo.streamType == STREAM_TYPE.LIVE_STREAM &&
    !streamInfo.isMembersOnly
  ) {
    if (age > 90000) {
      console.debug(
        "[revalidateCachedStream]",
        "discarding stale normal stream data"
      );
      return null;
    }
    return streamInfo;
  }

  const match = /\?v=(.{11})/.exec(streamInfo.videoLink);
  const { result, error } = await getStreamInfos(
    [match[1]],
    process.env.WATCH_YT_CHANNEL_ID
  );
  if (error) {
    return null;
  }

  const refreshedInfo = result.filter(
    (v) => v.videoLink === streamInfo.videoLink
  )?.[0];
  if (!refreshedInfo) {
    return null;
  }

  await coordinator.updateCache([refreshedInfo]);
  return refreshedInfo;
}

export async function getKnownStreamData(coordinator) {
  const now = Date.now();
  let { streamInfo: result, lastCheck } = await coordinator.getCachedStreamInfo(
    now
  );
  result = await revalidateCachedStream(coordinator, result, now - lastCheck);
  if (result && result.streamType !== STREAM_TYPE.DEAD) {
    if (result.live !== STREAM_STATUS.LIVE && result.streamStartTime) {
      const waitTime = result.streamStartTime.getTime() - now;
      if (waitTime > 1800 * 1000) {
        result.live = STREAM_STATUS.OFFLINE;
      } else {
        result.live = STREAM_STATUS.STARTING_SOON;
      }
    }
    return result;
  }
}

export async function getPastStream() {
  let pastStreamVal;

  if (process.env.WATCH_TWITCH_USER_ID) {
    pastStreamVal = await pollPaststreamStatusTwitch(
      process.env.WATCH_TWITCH_USER_ID
    );
  } else {
    pastStreamVal = await pollPaststreamStatus(process.env.WATCH_YT_CHANNEL_ID);
  }

  const { error: pastStreamError, result: pastStreamResult } = pastStreamVal;
  if (pastStreamError) {
    console.warn("paststream poll returned error:", pastStreamError);
    // Error is non-blocking. Gracefully fall back to not displaying things related to past stream
    return null;
  }

  return pastStreamResult;
}

export async function getLiveStreamData(mockKey) {
  let apiVal;
  if (process.env.USE_DUMMY_DATA === "true") {
    apiVal = await pollLivestreamStatusDummy(
      process.env.WATCH_YT_CHANNEL_ID,
      mockKey
    );
  } else {
    if (process.env.WATCH_TWITCH_CHANNEL_HANDLE) {
      apiVal = await pollTwitchLivestreamStatus(
        process.env.WATCH_TWITCH_CHANNEL_HANDLE
      );
    } else {
      apiVal = await pollYoutubeLivestreamStatus(
        process.env.WATCH_YT_CHANNEL_ID
      );
    }
  }

  return apiVal;
}

export async function getDatabase() {
  if (process.env.DATABASE_TYPE === "sqlite3") {
    return await (await import("./sqlite_db")).getCoordinator();
  } else {
    return await (await import("./postgres_db")).getCoordinator();
  }
}

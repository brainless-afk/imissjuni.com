import { STREAM_STATUS, STREAM_TYPE } from "../common/enums";
import { fetchWithTimeout } from "../common/fetchUtils";
import { StreamInfo } from "../models/StreamInfo";
import { IBasicResponse } from "./data_sources";

function createPollRoute(channelID: string) {
  return `https://holodex.net/api/v2/live?type=stream&sort=start_scheduled&limit=50&order=desc&channel_id=${channelID}`;
}

function createThumbURL(videoID: string) {
  return `https://i.ytimg.com/vi/${videoID}/mqdefault.jpg`;
}

function createWatchURL(videoID: string) {
  return `https://www.youtube.com/watch?v=${videoID}`;
}

export async function pollHolodexLivestreamStatus(): Promise<IBasicResponse> {
  const res = await fetchWithTimeout(
    createPollRoute(process.env.WATCH_CHANNEL_ID || ""),
    {
      headers: {
        "X-APIKEY": process.env.HOLODEX_API_KEY || "",
      },
    },
    "Get Holodex Livestream Info"
  );
  if (res.status !== 200) {
    return { error: `HTTP status: ${res.status}`, result: null };
  }
  const streams = await res.json();
  if (!streams.length) {
    return {
      error: null,
      result: new StreamInfo({
        live: STREAM_STATUS.OFFLINE,
        title: undefined,
        videoLink: undefined,
        streamStartTime: undefined,
        thumbnail: undefined,
        isMembersOnly: false,
        streamType: STREAM_TYPE.LIVE_STREAM,
      }),
    };
  }

  const nowMS = new Date().getTime();
  let minStream = null;
  let minWait = 0;
  for (const i in streams) {
    const stream = streams[i];
    if (stream.status === "live") {
      minStream = stream;
      break;
    }

    const expectedStartTime = new Date(stream.start_scheduled).getTime();
    const waitTimeLeftMS = expectedStartTime - nowMS;
    if (minStream !== null) {
      if (waitTimeLeftMS < minWait) {
        minStream = stream;
        minWait = waitTimeLeftMS;
      }
    } else {
      minStream = stream;
      minWait = waitTimeLeftMS;
    }
  }

  let computedStatus = STREAM_STATUS.INDETERMINATE;
  if (minStream.status === "live") {
    computedStatus = STREAM_STATUS.LIVE;
  } else {
    const expectedStartTime = new Date(minStream.start_scheduled).getTime();
    const waitTimeLeftMS = expectedStartTime - nowMS;
    if (waitTimeLeftMS > 1800 * 1000) {
      computedStatus = STREAM_STATUS.OFFLINE;
    } else {
      computedStatus = STREAM_STATUS.STARTING_SOON;
    }
  }

  return {
    error: null,
    result: new StreamInfo({
      live: computedStatus,
      title: minStream.title,
      videoLink: createWatchURL(minStream.id),
      streamStartTime: minStream.start_scheduled,
      thumbnail: createThumbURL(minStream.id),
      isMembersOnly: false,
      streamType: STREAM_TYPE.LIVE_STREAM,
    }),
  };
}

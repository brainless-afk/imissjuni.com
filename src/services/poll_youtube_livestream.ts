import { parse } from "node-html-parser";
import { STREAM_STATUS, STREAM_TYPE } from "../common/enums";
import { fetchWithTimeout } from "../common/fetchUtils";
import { StreamInfo } from "../models/StreamInfo";
import { IBasicResponse } from "./data_sources";

const VIDEO_INFO_EXPECT_START = "var ytInitialPlayerResponse = ";

function createPollRoute(channelID: string): string {
  return `https://www.youtube.com/channel/${channelID}/live`;
}

function validateVideoLink(anyLink: string): string | undefined {
  if (anyLink.match(/watch\?v=/)) {
    return anyLink;
  }
}

function extractInitialPlayerResponse(fromScript: string) {
  const idxs = Array.from(fromScript.matchAll(/;/g), (m) => m.index);
  for (let i = idxs.length - 1; i >= 0; --i) {
    try {
      return JSON.parse(
        fromScript.substring(VIDEO_INFO_EXPECT_START.length, idxs[i])
      );
    } catch {
      // nothing
    }
  }
}

export async function fetchLivestreamPage(
  channelID: string
): Promise<{ error: string | null; result: string | null }> {
  try {
    const res = await fetchWithTimeout(
      createPollRoute(channelID),
      {},
      "Get YouTube /live"
    );
    if (res.status !== 200) {
      return { error: `HTTP status: ${res.status}`, result: null };
    }
    const youtubeHTML = await res.text();
    return { error: null, result: youtubeHTML };
  } catch (e) {
    let message = "Unknown Error";
    if (e instanceof Error) message = e.message.toString();
    return { error: message, result: null };
  }
}

export function extractLivestreamInfo(fromPageContent: string): IBasicResponse {
  const dom = parse(fromPageContent, {
    blockTextElements: {
      script: true,
      noscript: false,
      style: false,
      pre: false,
    },
  });

  const canonical = dom.querySelector("link[rel='canonical']");
  if (!canonical) {
    return { error: "Malformed HTML", result: null };
  }

  const streamInfo = new StreamInfo({
    live: STREAM_STATUS.OFFLINE,
    title: undefined,
    videoLink: undefined,
    streamStartTime: undefined,
    thumbnail: undefined,
    isMembersOnly: false,
    streamType: STREAM_TYPE.LIVE_STREAM,
  });

  const videoLink = validateVideoLink(canonical.getAttribute("href") || "");
  if (!videoLink) {
    return {
      error: null,
      result: streamInfo,
    };
  }

  const liveTitle =
    dom.querySelector("meta[name='title']")?.getAttribute("content") || "";

  streamInfo.live = STREAM_STATUS.INDETERMINATE;
  streamInfo.videoLink = videoLink;
  streamInfo.title = liveTitle;

  const scripts = dom.querySelectorAll("script");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let playerInfo: any = null;
  for (let i = 0; i < scripts.length; ++i) {
    const text = scripts[i].textContent || "";

    if (
      text.startsWith(VIDEO_INFO_EXPECT_START) &&
      (playerInfo = extractInitialPlayerResponse(text))
    ) {
      break;
    }
  }

  if (!playerInfo) {
    console.warn(
      "[extractLivestreamInfo]",
      "can't extract ytInitialPlayerResponse"
    );
    return {
      error: null,
      result: streamInfo,
    };
  }

  // Check if stream frame is actually live, or just a waiting room
  const videoDetails = playerInfo.videoDetails;
  if (videoDetails?.isLiveContent && videoDetails?.isUpcoming) {
    streamInfo.live = STREAM_STATUS.STARTING_SOON;
  } else if (videoDetails?.isLiveContent && !videoDetails?.isUpcoming) {
    streamInfo.live = STREAM_STATUS.LIVE;
  }

  // Check stream frame start time
  // If it's more than one hour out, act as if it was offline
  const ts =
    playerInfo.playabilityStatus?.liveStreamability?.liveStreamabilityRenderer
      ?.offlineSlate?.liveStreamOfflineSlateRenderer?.scheduledStartTime;
  if (ts !== undefined) {
    const expectedStartTime = parseInt(ts) * 1000;
    const waitTimeLeftMS = expectedStartTime - new Date().getTime();
    streamInfo.streamStartTime = expectedStartTime;
    if (waitTimeLeftMS > 1800 * 1000) {
      streamInfo.live = STREAM_STATUS.OFFLINE;
    }
  }

  const thumbnailArray = playerInfo.videoDetails?.thumbnail?.thumbnails;
  if (thumbnailArray !== undefined && Array.isArray(thumbnailArray)) {
    for (let i = 0; i < thumbnailArray.length; ++i) {
      const t = thumbnailArray[i];
      if (
        typeof t.width === "number" &&
        t.width > 300 &&
        typeof t.height === "number" &&
        t.height > 150
      ) {
        streamInfo.thumbnail = t.url;
        break;
      }
    }
  }

  return {
    error: null,
    result: streamInfo,
  };
}

export async function pollYoutubeLivestreamStatus(
  channelID: string
): Promise<IBasicResponse> {
  const { error, result: youtubeHTML } = await fetchLivestreamPage(channelID);
  if (error) {
    return { error, result: null };
  }

  return extractLivestreamInfo(youtubeHTML || "");
}

import { STREAM_STATUS, STREAM_TYPE } from "../common/enums";
import { fetchWithTimeout } from "../common/fetchUtils";
import { IStreamInfo, StreamInfo } from "../models/StreamInfo";

async function queryMultiVideoInfo(videoIDs) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const idList = videoIDs.join(",");

  try {
    const res = await fetchWithTimeout(
      `https://youtube.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,liveStreamingDetails,status&id=${idList}&key=${apiKey}`,
      {
        headers: {
          Accept: "application/json",
        },
      },
      "Get YouTube Video Info"
    );
    if (res.status !== 200) {
      try {
        const errorDetail = await res.json();
        return { error: errorDetail, result: null };
      } catch {
        return { error: `HTTP status: ${res.status}`, result: null };
      }
    }
    const data = await res.json();
    return { error: null, result: data.items };
  } catch (e) {
    console.error("[queryMultiVideoInfo]", "fetch error:", e);
    return { error: e.toString(), result: null };
  }
}

function chooseThumbnail(thumbList) {
  for (const [_, thumb] of Object.entries(thumbList)) {
    if (thumb.width > 300 && thumb.height > 150) {
      return thumb.url;
    }
  }

  return null;
}

const ISO8601_DURATION =
  /^P(?:([0-9]+)Y)?(?:([0-9]+)M)?(?:([0-9]+)W)?(?:([0-9]+)D)?(?:T(?:([0-9]+)H)?(?:([0-9]+)M)?(?:([0-9]+)S)?)?/;
function parseISO8601Duration(s) {
  const match = ISO8601_DURATION.exec(s);
  if (!match) {
    return NaN;
  }

  const groupToSecs = [0, 31536000, 2592000, 604800, 86400, 3600, 60, 1];
  let time = 0;
  for (let i = 1; i < groupToSecs.length; ++i) {
    if (match[i] !== undefined) {
      time += groupToSecs[i] * parseInt(match[i]);
    }
  }

  return time * 1000;
}

async function extractStreamInfo(
  videoResponseList,
  onlyForChannel: string
): Promise<IStreamInfo[] | null> {
  return videoResponseList
    .map((item) => {
      console.debug(
        "[extractStreamInfo]",
        "considering video",
        item.snippet.title
      );
      let start;
      if (
        !(start = item.liveStreamingDetails?.scheduledStartTime) ||
        item.snippet.channelId !== onlyForChannel
      ) {
        console.debug(
          "[extractStreamInfo]",
          "returning null because video is on wrong channel or has no start time"
        );
        return null;
      }

      const streamInfo = new StreamInfo({
        live: undefined,
        title: item.snippet.title,
        videoLink: `https://www.youtube.com/watch?v=${item.id}`,
        streamStartTime: undefined,
        thumbnail: chooseThumbnail(item.snippet.thumbnails),
        isMembersOnly: false,
        streamType: STREAM_TYPE.LIVE_STREAM,
      });

      // Not sure if these are correct, but this data doesn't seem to be provided elsewhere
      if (parseISO8601Duration(item.contentDetails.duration) > 0) {
        streamInfo.streamType = STREAM_TYPE.PREMIERE;
      }

      if (item.status.privacyStatus === "unlisted") {
        streamInfo.isMembersOnly = true;
      }

      const startMS = Date.parse(start);
      streamInfo.streamStartTime = startMS;
      if (item.snippet.liveBroadcastContent === "upcoming") {
        const waitTimeLeftMS = startMS - new Date().getTime();
        if (waitTimeLeftMS > 1800 * 1000) {
          streamInfo.live = STREAM_STATUS.OFFLINE;
        } else {
          streamInfo.live = STREAM_STATUS.STARTING_SOON;
        }
      } else if (item.snippet.liveBroadcastContent === "live") {
        streamInfo.live = STREAM_STATUS.LIVE;
      } else {
        streamInfo.live = STREAM_STATUS.OFFLINE;
        streamInfo.streamType = STREAM_TYPE.DEAD;
      }

      return streamInfo;
    })
    .filter((v) => v !== null);
}

export async function getStreamInfos(
  videoIDs,
  filterChannelID: string
): Promise<{ error: string | null; result: IStreamInfo[] | null }> {
  const { result, error } = await queryMultiVideoInfo(videoIDs);
  if (!error) {
    const videos = await extractStreamInfo(result, filterChannelID);
    return { result: videos, error: null };
  }

  return { error, result: null };
}

import { STREAM_STATUS, STREAM_TYPE } from "../common/enums";
import { fetchWithTimeout } from "../common/fetchUtils";
import { StreamInfo } from "../models/StreamInfo";
import { IBasicResponse } from "./data_sources";

export async function pollTwitchLivestreamStatus(
  channelID: string
): Promise<IBasicResponse> {
  const { error, result } = await fetchTwitchLivestreamPage(channelID);

  if (error) {
    return { error, result: null };
  }

  return extractInfoFromTwitchApiResponse(result, channelID);
}

/**
 * Get a list of streams for a channel.
 * https://dev.twitch.tv/docs/api/reference/#get-streams
 * @param {string} channelID
 * @returns {error: string | null, result: Object[] }
 */
export async function fetchTwitchLivestreamPage(channelID: string) {
  const options = {
    headers: {
      "Client-Id": process.env.TWITCH_CLIENT_ID || "",
      Authorization: `Bearer ${process.env.TWITCH_ACCESS_TOKEN}`,
    },
  };
  try {
    const res = await fetchWithTimeout(
      `https://api.twitch.tv/helix/streams?user_id=${channelID}`,
      options,
      "Get Twitch live status"
    );
    if (res.status !== 200) {
      return { error: `HTTP status: ${res.status}`, result: null };
    }

    const responseContent = await res.json();

    return { error: null, result: responseContent };
  } catch (e) {
    let message = "Unknown Error";
    if (e instanceof Error) message = e.message.toString();
    return { error: message, result: null };
  }
}

export function extractInfoFromTwitchApiResponse(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  responseContent: any,
  channelID: string
): IBasicResponse {
  const baseResponse: IBasicResponse = {
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

  if (
    !responseContent ||
    !responseContent.data ||
    !responseContent.data.length
  ) {
    return baseResponse;
  } else {
    const livestream = responseContent.data.find(
      (x: { type: string }) => x.type === "live"
    );
    if (!livestream) return baseResponse;

    return {
      error: null,
      result: new StreamInfo({
        live: STREAM_STATUS.LIVE,
        title: livestream.title,
        videoLink: `https://www.twitch.tv/${channelID}`,
        streamStartTime: livestream.started_at,
        thumbnail: livestream.thumbnail_url
          .replace("{width}", "320")
          .replace("{height}", "180"),
        isMembersOnly: false,
        streamType: STREAM_TYPE.LIVE_STREAM,
      }),
    };
  }
}

import { fetchWithTimeout } from "../common/fetchUtils";

export function extractInfoFromTwitchApiResponse(responseContent) {
  if (
    !responseContent ||
    !responseContent.data ||
    !responseContent.data.length
  ) {
    return null;
  } else {
    const lastStream = responseContent.data[0];

    return {
      videoLink: `https://www.twitch.tv/videos/${lastStream.id}`,
      title: lastStream.title,
      endActual: Date.parse(lastStream.published_at),
    };
  }
}

async function fetchPastStreamTwitch(channelID: string) {
  const options = {
    headers: {
      "Client-Id": process.env.TWITCH_CLIENT_ID || "",
      Authorization: `Bearer ${process.env.TWITCH_ACCESS_TOKEN}`,
    },
  };

  try {
    const res = await fetchWithTimeout(
      `https://api.twitch.tv/helix/videos?user_id=${channelID}&type=archive&first=1`,
      options,
      "Get Twitch vod Info"
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

export async function pollPaststreamStatusTwitch(channelID: string) {
  const { error, result: youtubeJSON } = await fetchPastStreamTwitch(channelID);
  if (error) {
    return { error, result: null };
  }

  return {
    error: null,
    result: extractInfoFromTwitchApiResponse(youtubeJSON),
  };
}

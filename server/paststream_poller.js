import { fetchWithTimeout } from "../common/utils";

//#region poll youtube
function createPollRoute(channelID) {
  return `https://holodex.net/api/v2/channels/${channelID}/videos?lang=en&type=stream%2Cplaceholder&include=live_info&limit=24&offset=0&paginated=true`;
}

async function fetchPaststreamPage(channelID) {
  try {
    const res = await fetchWithTimeout(
      createPollRoute(channelID),
      {
        headers: {
          "X-APIKEY": process.env.HOLODEX_API_KEY,
        },
      },
      undefined,
      "Get Holodex Stream Info"
    );
    if (res.status !== 200) {
      return { error: `HTTP status: ${res.status}`, result: null };
    }
    const youtubeJSON = await res.json();
    return { error: null, result: youtubeJSON };
  } catch (e) {
    return { error: e.toString(), result: null };
  }
}

function extractPaststreamInfo(fromPageContent) {
  const lastStream =
    fromPageContent.items.find((e) => {
      return (
        e.status === "past" &&
        e.type === "stream" &&
        e.topic_id !== "shorts" &&
        e.duration >= 600 &&
        e.end_actual
      );
    }) || null;
  return lastStream
    ? {
        videoLink: `https://www.youtube.com/watch?v=${lastStream.id}`,
        title: lastStream.title,
        endActual: Date.parse(lastStream.end_actual),
      }
    : null;
}

export async function pollPaststreamStatus(channelID) {
  if (process.env.USE_DUMMY_DATA === "true") {
    return pollPaststreamStatusDummy();
  }

  const { error, result: youtubeJSON } = await fetchPaststreamPage(channelID);
  if (error) {
    return { error, result: null };
  }

  return {
    error: null,
    result: extractPaststreamInfo(youtubeJSON),
  };
}

async function pollPaststreamStatusDummy() {
  const dummyData = require("./mocks/paststream_dummy_data.json");
  return {
    error: null,
    result: extractPaststreamInfo(dummyData),
  };
}

//#endregion poll youtube

//#region poll twitch

export function extractInfoFromTwitchApiResponse(responseContent, channelID) {
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

async function fetchPastStreamTwitch() {
  const options = {
    headers: {
      "Client-Id": process.env.TWITCH_CLIENT_ID,
      Authorization: `Bearer ${process.env.TWITCH_ACCESS_TOKEN}`,
    },
  };

  try {
    const res = await fetchWithTimeout(
      `https://api.twitch.tv/helix/videos?user_id=${process.env.WATCH_TWITCH_USER_ID}&type=archive&first=1`,
      options,
      undefined,
      "Get Twitch vod Info"
    );
    if (res.status !== 200) {
      return { error: `HTTP status: ${res.status}`, result: null };
    }

    const responseContent = await res.json();
    return { error: null, result: responseContent };
  } catch (e) {
    return { error: e.toString(), result: null };
  }
}

export async function pollPaststreamStatusTwitch(channelID) {
  if (process.env.USE_DUMMY_DATA === "true") {
    return pollPaststreamStatusDummy();
  }

  const { error, result: youtubeJSON } = await fetchPastStreamTwitch(channelID);
  if (error) {
    return { error, result: null };
  }

  return {
    error: null,
    result: extractInfoFromTwitchApiResponse(youtubeJSON),
  };
}

//#endregion poll twitch

import { fetchWithTimeout } from "@/src/common/fetchUtils";
import { IVodInfo, VodInfo } from "@/src/models/VodInfo";
import { decode } from "html-entities";
import type { NextRequest } from "next/server";

function makeAPIURL(pageToken: string | undefined = undefined): string {
  const { YOUTUBE_API_KEY: apiKey, WATCH_YT_CHANNEL_ID: channelID } =
    process.env;
  const pageSpecifier = pageToken ? `pageToken=${pageToken}&` : "";

  return `https://youtube.googleapis.com/youtube/v3/search?${pageSpecifier}part=snippet&channelId=${channelID}&maxResults=100&order=date&type=video&key=${apiKey}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function collect(item: any): IVodInfo {
  return new VodInfo({
    video_link: item.id.videoId,
    title: decode(item.snippet.title),
    thumbnail: item.snippet.thumbnails.medium.url,
    uploaded_date: Date.parse(item.snippet.publishedAt),
    length_seconds: 0,
  });
}

/**
 * Gets youtube videos and adds them to vod table in database.
 * @param request
 * @returns
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const ds = await import("@/src/services/data_sources");
  const coordinator = await ds.getDatabase();

  let nextUrl: string | undefined = makeAPIURL();
  let videosConsidered = 0;

  const headers = new Headers();
  headers.set("Referer", process.env.NEXT_PUBLIC_HOST || "");

  try {
    while (nextUrl && videosConsidered < 100) {
      const response = await fetchWithTimeout(
        nextUrl,
        {
          headers: headers,
        },
        "YT API - Update VODs"
      );

      if (!response.ok) {
        const errorMessage = await response.json();
        console.error(
          "[Update VODs] YouTube API error:",
          response.status,
          errorMessage
        );
        break;
      }

      const { items, nextPageToken } = await response.json();
      await coordinator.insertVods(items.map(collect));
      videosConsidered += items.length;

      nextUrl = nextPageToken ? makeAPIURL(nextPageToken) : undefined;
    }
  } catch (error) {
    console.error("[Update VODs] Unexpected error:", error);
    return new Response("Internal Server Error", { status: 500 });
  } finally {
    await coordinator.teardown();
  }

  return Response.json({ result: { videosConsidered } });
}

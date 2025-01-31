import { STREAM_STATUS } from "@/src/common/enums";
import StreamLayout from "@/src/components/streamLayout";
import AllStrings from "@/src/lang/strings";
import { ILiveStreamInfo, LiveStreamInfo } from "@/src/models/LiveStreamInfo";
import { PastStreamInfo } from "@/src/models/PastStreamInfo";
import { StreamInfo } from "@/src/models/StreamInfo";
import { getPastStream } from "@/src/services/data_sources";
import { Metadata } from "next/types";
import { cache } from "react";
import styles from "./page.module.css"; // Adjust the path as necessary
import { getImageSetFromStatus } from "@/src/common/imageUtils";

const absolutePrefix = process.env.PUBLIC_HOST || "./";

async function fetchLivestreamInfo(): Promise<ILiveStreamInfo> {
  const ds = await import("@/src/services/data_sources");

  // Todo: Why is the stream only cached when it is live
  // Status is offline much more often than live
  // const coordinator = await ds.getDatabase();
  // let useStreamInfo = await ds.getKnownStreamData(coordinator);
  // if (!useStreamInfo) {
  //   const { result, error } = await ds.getLiveStreamData();

  //   if (error || !result) {
  //     console.warn("livestream poll returned error:", error);
  //     await coordinator.teardown();
  //     return new LiveStreamInfo({
  //       isError: true,
  //       usedImageSet: getImageSetFromStatus(undefined),
  //     });
  //   }

  //   if (result.videoLink) {
  //     await coordinator.updateCache([result]);
  //   }

  //   useStreamInfo = result;
  // }
  // await coordinator.teardown();

  const { result, error } = await ds.getLiveStreamData();

  if (error || !result) {
    console.warn("livestream poll returned error:", error);
    return new LiveStreamInfo({
      isError: true,
      usedImageSet: getImageSetFromStatus(undefined),
    });
  }
  const useStreamInfo = result;

  return new LiveStreamInfo({
    isError: false,
    status: useStreamInfo.live,
    streamInfo: useStreamInfo,
    usedImageSet: getImageSetFromStatus(useStreamInfo.live),
  });
}

const cachedLivestreamInfo = cache(fetchLivestreamInfo);

export async function generateMetadata(): Promise<Metadata> {
  const liveStreamStatusInfo = await cachedLivestreamInfo();

  if (liveStreamStatusInfo.isError) {
    return {
      twitter: {
        images: "imagesets/errored/mothLoading.png",
      },
      openGraph: {
        images: "imagesets/errored/mothLoading.png",
      },
    };
  } else if (
    liveStreamStatusInfo.status === STREAM_STATUS.LIVE ||
    liveStreamStatusInfo.status === STREAM_STATUS.STARTING_SOON
  ) {
    const pageEmoji =
      liveStreamStatusInfo.status === STREAM_STATUS.LIVE ? "🔴" : "🕒";
    const description =
      liveStreamStatusInfo.status === STREAM_STATUS.LIVE
        ? `${AllStrings.Main.Embed.TextLive} ${liveStreamStatusInfo.streamInfo?.title}`
        : `${AllStrings.Main.Embed.TextStartingSoon} ${liveStreamStatusInfo.streamInfo?.title}`;

    return {
      title: `${pageEmoji} ${AllStrings.CommonMetadata.HeaderSMTitle}`,
      description: description,
      twitter: {
        images: "imagesets/have-stream/mothHappy.png",
      },
      openGraph: {
        images: "imagesets/have-stream/mothHappy.png",
      },
    };
  }

  // else use default metadata from layout.tsx
  return {};
}

//#region Server action

// Server actions can't serialize classes
// https://github.com/vercel/next.js/discussions/46137#discussioncomment-5047095

async function refreshLiveStreamStatusInfo() {
  "use server";
  const liveStreamInfo = await fetchLivestreamInfo();
  return JSON.stringify(liveStreamInfo);
}

async function fetchPastStream() {
  "use server";
  const pastStreamInfo = await getPastStream();

  if (!pastStreamInfo) return JSON.stringify(new PastStreamInfo());

  return JSON.stringify(
    new PastStreamInfo({
      link: pastStreamInfo.videoLink,
      title: pastStreamInfo.title,
      endTime: pastStreamInfo.endActual,
    })
  );
}

//#endregion Server action

export default async function Home() {
  const liveStreamInfo = await cachedLivestreamInfo();

  return (
    <div className={styles.site}>
      <StreamLayout
        absolutePrefix={absolutePrefix}
        getPastStreamInfo={fetchPastStream}
        isError={liveStreamInfo.isError}
        refreshStatus={refreshLiveStreamStatusInfo}
        status={liveStreamInfo.status || STREAM_STATUS.OFFLINE}
        streamInfo={JSON.stringify(
          liveStreamInfo.streamInfo || new StreamInfo()
        )}
        usedImageSet={liveStreamInfo.usedImageSet}
      />
    </div>
  );
}

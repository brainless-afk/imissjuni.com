"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { STREAM_STATUS } from "../common/enums";
import {
  selectNextImage,
  selectRandomImage,
  shuffleImageSet,
} from "../common/imageUtils";
import AllStrings from "../lang/strings";
import { IStreamInfo } from "../models/StreamInfo";
import PastStreamCounter from "./past_stream_counter";
import { VideoBox } from "./videoBox";
import styles from "./vodInfo.module.css";

interface IStreamBoxProps {
  absolutePrefix: string;
  getPastStreamInfo: () => Promise<string>; // stringified IPastStreamInfo
  isError: boolean;
  refreshStatus: () => Promise<string>; // stringified ILiveStreamInfo
  status: number;
  streamInfo: string; // stringified IStreamInfo
  usedImageSet: string[];
}

interface ILiveStreamStatusInfoProps {
  streamInfo: IStreamInfo | undefined;
}

function LiveStreamStatusInfo(props: ILiveStreamStatusInfoProps) {
  if (props.streamInfo && !!props.streamInfo.videoLink) {
    let text,
      boxExtraClass = "";
    switch (props.streamInfo.live) {
      case STREAM_STATUS.LIVE:
        text = AllStrings.VideoBox.StatusLive;
        boxExtraClass = styles.streamInfoLive;
        break;
      case STREAM_STATUS.STARTING_SOON:
        text = AllStrings.VideoBox.StatusStartingSoon;
        break;
      default:
        text = AllStrings.VideoBox.StatusStreamQueued;
        break;
    }

    return (
      <div className={`${styles.streamInfo} ${boxExtraClass}`}>
        <VideoBox
          caption={text}
          isMembersOnly={false}
          link={props.streamInfo.videoLink}
          showCounter={props.streamInfo.live != STREAM_STATUS.LIVE}
          thumbnail={props.streamInfo.thumbnail}
          title={props.streamInfo.title}
          startTime={props.streamInfo.streamStartTime}
        />
      </div>
    );
  } else {
    return (
      <div className={styles.streamInfo}>
        <div className={styles.vstack}>
          <p className={styles.videoBoxCaption}>
            {AllStrings.VideoBox.NoStreamDummyStatus}
          </p>
          <p>
            <b>{AllStrings.VideoBox.NoStreamDummyTitle}</b>
          </p>
        </div>
      </div>
    );
  }
}

/**
 * Shows stream status (live/offline/error getting status)
 */
export default function StreamLayout(props: IStreamBoxProps) {
  const [image, setImage] = useState<string | undefined>(undefined);
  const [isError, setIsError] = useState(props.isError);
  const [status, setStatus] = useState<number | undefined>(props.status);
  const [streamInfo, setStreamInfo] = useState(JSON.parse(props.streamInfo));
  const [usedImageSet, setUsedImageSet] = useState(
    shuffleImageSet(props.usedImageSet)
  );

  useEffect(() => {
    const interval = setInterval(async () => {
      const response = await props.refreshStatus();
      const refreshedStatus = JSON.parse(response);

      if (
        refreshedStatus.isError !== isError ||
        refreshedStatus.status !== status
      ) {
        setImage(selectRandomImage(props.usedImageSet));
        setIsError(refreshedStatus.isError);
        setStatus(refreshedStatus.status);
        setStreamInfo(refreshedStatus.streamInfo);
        setUsedImageSet(shuffleImageSet(refreshedStatus.usedImageSet));
      }
    }, 120000);
    return () => clearInterval(interval);
  }, [props.refreshStatus]);

  useEffect(() => {
    const initialImage = selectRandomImage(props.usedImageSet);
    setImage(initialImage);
  }, [props.usedImageSet]);

  return (
    <div>
      {image && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          className={styles.bigImage}
          src={`${props.absolutePrefix}/${image}`}
          alt={AllStrings.Main.ImageAlt}
          onClick={() => setImage(selectNextImage(usedImageSet, image))}
        />
      )}
      {isError ? (
        <div className={`${styles.streamInfo} ${styles.streamInfoError}`}>
          <p>
            {`${AllStrings.Main.ErrorOccurred} `}
            <a href={AllStrings.Main.ErrorMessageChannelLink}>
              {AllStrings.Main.ErrorMessageLiveStreamStatus}
            </a>
          </p>
        </div>
      ) : (
        <>
          {status === STREAM_STATUS.LIVE && (
            <h1>{AllStrings.Main.DontMissCaption}</h1>
          )}
          <LiveStreamStatusInfo streamInfo={streamInfo} />
          {status !== STREAM_STATUS.LIVE && (
            <PastStreamCounter getPastStreamInfo={props.getPastStreamInfo} />
          )}
        </>
      )}
      <p>
        <Link href="/reps">{AllStrings.Main.RandomVodLink}</Link>
      </p>
    </div>
  );
}

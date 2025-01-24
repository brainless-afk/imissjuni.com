"use client";
import AllStrings from "@/src/lang/strings";
import styles from "./vodInfo.module.css";
import { VideoBox } from "./videoBox";
import { IVodInfo } from "../models/VodInfo";
import { useState } from "react";

const formatDateShort = (date: Date): string =>
  date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const getCaption = (uploadDate: number): string => {
  const date = new Date(uploadDate);
  return `${AllStrings.Reps.VodInfoUploadDate} ${formatDateShort(date)}`;
};

interface VodInfoProps {
  vodInfoData?: IVodInfo;
  rerollVod: () => Promise<IVodInfo | undefined>;
}

export default function VodInfo(props: VodInfoProps) {
  const [data, setData] = useState<IVodInfo | undefined>(props.vodInfoData);
  const [loading, setLoading] = useState<boolean>(false);

  const onClickRerollVod = async () => {
    setLoading(true);
    const newData = await props.rerollVod();
    if (newData) {
      setData(newData);
    }
    setLoading(false);
  };

  if (!data) {
    return (
      <div className={`${styles.streamInfo} ${styles.streamInfoError}`}>
        <p>
          {`${AllStrings.Reps.ErrorDescription} ${AllStrings.Reps.ErrorCodes.NO_VIDEO_FOUND} `}
        </p>
      </div>
    );
  } else {
    return (
      <>
        <div
          className={`${styles.streamInfo} ${
            loading ? styles.isReloading : ""
          }`}
        >
          <VideoBox
            caption={getCaption(data.uploaded_date)}
            link={`https://www.youtube.com/watch?v=${data.video_link}`}
            title={data.title}
            isMembersOnly={Boolean(data.members_only)}
            thumbnail={data.thumbnail}
            showCounter={false}
          />
        </div>
        <button
          className={styles.rerollButton}
          disabled={loading}
          onClick={onClickRerollVod}
        >
          {AllStrings.Reps.RerollButton}
        </button>
      </>
    );
  }
}

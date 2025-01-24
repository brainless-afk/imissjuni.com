"use client";
import React, { memo, useEffect, useState } from "react";
import AllStrings from "../lang/strings";
import TextCountdown from "./text_countdown";
import styles from "./vodInfo.module.css";
import { IPastStreamInfo } from "../models/PastStreamInfo";

interface IPastStreamCounterProps {
  getPastStreamInfo: () => Promise<string>; // stringified IPastStreamInfo;
}

function PastStreamCounter(props: IPastStreamCounterProps) {
  const [pastStreamInfo, setPastStreamInfo] = useState<
    IPastStreamInfo | undefined
  >(undefined);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const pastStreamInfoString = await props.getPastStreamInfo();
        const pastStreamInfo: IPastStreamInfo =
          JSON.parse(pastStreamInfoString);

        setPastStreamInfo(pastStreamInfo);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [props]);

  if (
    pastStreamInfo &&
    pastStreamInfo.endTime &&
    pastStreamInfo.link &&
    pastStreamInfo.title
  ) {
    return (
      <div className={`${styles.streamInfo} ${styles.pastStreamInfo}`}>
        <a href={pastStreamInfo.link}>
          <TextCountdown
            to={pastStreamInfo.endTime}
            formatStrings={AllStrings.Countdowns.PastStream}
          />
        </a>
      </div>
    );
  }
}

export default memo(PastStreamCounter);

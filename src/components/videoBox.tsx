import AllStrings from "@/src/lang/strings";
import React from "react";
import TextCountdown from "./text_countdown";
import styles from "./videoBox.module.css";

interface VideoBoxProps {
  caption: string;
  link: string;
  title: string;
  isMembersOnly: boolean;
  thumbnail: string;
  showCounter: boolean;
  startTime?: number;
}

export function VideoBox(props: VideoBoxProps) {
  return (
    <div className={`${styles.videoBox}`}>
      <div className={styles.vstack}>
        {props.caption ? (
          <p className={`${styles.videoBoxCaption}`}>
            {props.caption}
            {props.showCounter && props.startTime ? (
              <span className={styles.countdown}>
                <TextCountdown
                  to={props.startTime}
                  formatStrings={AllStrings.Countdowns.VideoBox}
                />
              </span>
            ) : undefined}
          </p>
        ) : undefined}
        <p>
          <a href={props.link}>{props.title}</a>
        </p>
        {props.isMembersOnly ? (
          <p>{AllStrings.VideoBox.MembersOnlySubtext}</p>
        ) : undefined}
      </div>
      {props.thumbnail ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={props.thumbnail}
          alt={AllStrings.VideoBox.ThumbnailAltText}
          width={120}
        />
      ) : undefined}
    </div>
  );
}

import { STREAM_STATUS } from "./enums";
import {
  ERROR_IMAGE_SET,
  HAVE_STREAM_IMAGE_SET,
  NO_STREAM_IMAGE_SET,
} from "../../imagesets";

export function selectRandomImage(fromSet: string[]) {
  return fromSet[(Math.random() * fromSet.length) | 0];
}

/**
 * Returns the next image in an imageset, wrapping around to the start after reaching the end of the array.
 */
export function selectNextImage(fromSet: string[], currentImage: string) {
  const nextIndex = fromSet.indexOf(currentImage) + 1;
  return fromSet[nextIndex % fromSet.length];
}

export function imageFromStreamStatus(status: number) {
  if (status != STREAM_STATUS.LIVE && status != STREAM_STATUS.STARTING_SOON) {
    return selectRandomImage(NO_STREAM_IMAGE_SET);
  } else {
    return selectRandomImage(HAVE_STREAM_IMAGE_SET);
  }
}

/**
 * Returns an imageset with its positions in the array scrambled.
 */
export function scrambledImageSet(status: number | undefined) {
  const shuffle = function (array: string[]) {
    const shuffled = [...array];
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      // Swap elements at indices i and j
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  switch (status) {
    case STREAM_STATUS.LIVE:
    case STREAM_STATUS.STARTING_SOON:
      return shuffle([...HAVE_STREAM_IMAGE_SET]);
    case STREAM_STATUS.OFFLINE:
    case STREAM_STATUS.INDETERMINATE:
      return shuffle([...NO_STREAM_IMAGE_SET]);
    default:
      return shuffle([...ERROR_IMAGE_SET]);
  }
}

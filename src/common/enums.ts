export const STREAM_STATUS = {
  OFFLINE: 1,
  INDETERMINATE: 2,
  STARTING_SOON: 3,
  LIVE: 4,
};

export const STREAM_TYPE = {
  LIVE_STREAM: 1,
  PREMIERE: 2,
  DEAD: 3,
};

export const API_EPOCH = 2;

export const COUNTDOWN_DEFAULT_FORMATS = {
  immediate: "now",
  forFuture: "in %@",
  forPast: "%@ ago",
  days: "%@d",
  hours: "%@h",
  minutes: "%@m",
  seconds: "%@s",
  separator: " ",
};

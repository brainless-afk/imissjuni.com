const AllStrings = {
  CommonMetadata: {
    HeaderSMTitle: "I MISS JUNI",
    FooterText:
      "Not affiliated with Juniper Actias or Lune Genetic Research Facility - ",
    FooterSourceHref: "https://github.com/brainless-afk/imissjuni.com",
    FooterSourceLink: "Source",
    FooterYoutubeLink: "https://www.youtube.com/@juniperactiasofficial",
    FooterTwitchLink: "https://www.twitch.tv/juniperactias",
    FooterTwitterLink: "https://x.com/Egocider",
  },

  Main: {
    PageTitle: "I MISS JUNI",
    DontMissCaption: "I Don't Miss Juni",
    ImageAlt: "Meme",
    RandomVodLink: "Do your reps",
    ErrorMessageLiveStreamStatus: "You can check Juni's channel yourself!",
    ErrorMessageChannelLink: "https://www.twitch.tv/juniperactias",
    ErrorOccurred: "There was a problem checking stream status.",
    Embed: {
      TextLive: "Streaming:",
      TextStartingSoon: "Starting Soon:",
      TextStreamQueued: "Next Stream:",
    },
  },

  VideoBox: {
    StatusLive: "LIVE",
    StatusStartingSoon: "Starting Soon",
    StatusStreamQueued: "Next Stream",
    NoStreamDummyStatus: "Current Stream",
    NoStreamDummyTitle: "NOTHING UUUUUUUuuuuuu",
    MembersOnlySubtext: "(for Lunatics only!)",
    ThumbnailAltText: "Video Thumbnail",
  },

  Reps: {
    PageTitle: "Do your reps!",
    SMMetaDescription: "Get a random Juni Video to watch!",
    VodInfoUploadDate: "Streamed or uploaded on",
    PageCaption: "Watch this one!",
    RerollButton: "Reroll",
    BackToStreamTrackerButton: "Back to stream tracker",
    ErrorDescription: "A problem occurred while getting a random video:",

    ErrorCodes: {
      NO_VIDEO_FOUND: "No video found.",
    },
  },

  Countdowns: {
    VideoBox: {
      immediate: "(Now!)",
      forFuture: "(in %@)",
      forPast: "(%@ ago)",
      days: "%@d",
      hours: "%@h",
      minutes: "%@m",
      seconds: "%@s",
      separator: " ",
    },
    PastStream: {
      immediate: "",
      forFuture: "",
      forPast: `%@ without Juni`,
      days: (days: number) => (days > 1 ? `${days} days` : `${days} day`),
      hours: (hours: number) =>
        hours > 1 ? `${hours} hours` : `${hours} hour`,
      minutes: (minutes: number) =>
        minutes > 1 ? `${minutes} minutes` : `${minutes} minute`,
      seconds: (seconds: number) =>
        seconds > 1 ? `${seconds} seconds` : `${seconds} second`,
      separator: ", ",
    },
  },
};

export default AllStrings;

import AllStrings from "@/src/lang/strings";
import Image from "next/image";

export default function CommonFooter() {
  return (
    <footer>
      <div>
        <a
          href={AllStrings.CommonMetadata.FooterYoutubeLink}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            src="/youtube_logo.svg"
            alt="Youtube logomark"
            width={43.53}
            height={30}
          />
        </a>
        <a
          href={AllStrings.CommonMetadata.FooterTwitchLink}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            src="/twitch_logo.svg"
            alt="Twitch logomark"
            width={30}
            height={30}
          />
        </a>
        <a
          href={AllStrings.CommonMetadata.FooterTwitterLink}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            src="/twitter_logo_dark.svg"
            alt="Twitter logomark"
            width={30}
            height={30}
          />
        </a>
      </div>
      <br />
      <small>
        {AllStrings.CommonMetadata.FooterText}
        <a
          href={AllStrings.CommonMetadata.FooterSourceHref}
          target="_blank"
          rel="noopener noreferrer"
        >
          {AllStrings.CommonMetadata.FooterSourceLink}
        </a>
      </small>
    </footer>
  );
}

import Head from "next/head";
import React, { useContext } from "react";
import { LangContext } from "../lang/dict_manager";

export function CommonMetadata() {
  const lang = useContext(LangContext);
  return (
    <>
      <Head>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <meta name="theme-color" content="#c3f0ce" />
        <meta content={lang.CommonMetadata.HeaderSMTitle} property="og:title" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
    </>
  );
}

export function CommonFooter(props) {
  const lang = useContext(LangContext);
  return (
    <footer>
      <a href={props.channelLink}>{lang.CommonMetadata.FooterStreamerLink}</a>
      <br />
      <small>
        {lang.formatString(
          lang.CommonMetadata.FooterText,
          <a href="https://github.com/brainless-afk/imissjuni.com">
            {lang.CommonMetadata.FooterSourceLink}
          </a>
        )}
      </small>
    </footer>
  );
}

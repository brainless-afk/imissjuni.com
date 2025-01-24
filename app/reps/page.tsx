import AllStrings from "@/src/lang/strings";
import Link from "next/link";
import styles from "./page.module.css";
import VodInfo from "@/src/components/vodInfo";
import { IVodInfo } from "@/src/models/VodInfo";
import { Metadata } from "next/types";

export const metadata: Metadata = {
  title: `${AllStrings.Reps.PageTitle}`,
  description: `${AllStrings.Reps.SMMetaDescription}`,
};

async function fetchVodInfo() {
  const ds = await import("@/src/services/data_sources");
  const coordinator = await ds.getDatabase();

  const vodInfo = await coordinator.getVod();
  await coordinator.teardown();
  return vodInfo;
}

async function rerollVod(): Promise<IVodInfo | undefined> {
  "use server";
  return await fetchVodInfo();
}

export default async function Reps() {
  const vodInfoData = await fetchVodInfo();

  return (
    <div className={styles.repsRoot}>
      <p className={styles.watchThisText}>{AllStrings.Reps.PageCaption}</p>
      <VodInfo vodInfoData={vodInfoData} rerollVod={rerollVod} />
      <p>
        <Link href="/">{AllStrings.Reps.BackToStreamTrackerButton}</Link>
      </p>
    </div>
  );
}

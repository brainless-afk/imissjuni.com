import sqlite3 from "sqlite3";
import { STREAM_TYPE } from "../common/enums";
import { StreamInfo } from "../models/StreamInfo";
import {
  CachedStreamInfo,
  ICachedStreamInfo,
} from "../models/CachedStreamInfo";
import { IVodInfo } from "../models/VodInfo";
import { IBaseCoordinator } from "./base_client";

export class SQLiteCoordinator implements IBaseCoordinator {
  connection = new sqlite3.Database(process.env.SQLITE_DB_PATH || "");

  getCachedStreamInfo = async (
    nearTime: number
  ): Promise<ICachedStreamInfo> => {
    try {
      const row = await new Promise<ICachedStreamInfo>((resolve, reject) => {
        this.connection.get<ICachedStreamInfo>(
          `SELECT * FROM cached_stream_info WHERE type != ? ORDER BY ABS(? - start_time)`,
          [STREAM_TYPE.DEAD, nearTime],
          (err, row) => {
            if (err) {
              console.error("[getCachedStreamInfo]", "query error:", err);
              return reject(err);
            }
            resolve(row);
          }
        );
      });

      return row ? row : new CachedStreamInfo();
    } catch (error) {
      console.error("[getCachedStreamInfo]", "Unexpected error:", error);
      return new CachedStreamInfo();
    }
  };

  updateCache = async (streamInfos: StreamInfo[]): Promise<void> => {
    const ts = Date.now();
    this.connection.serialize(() => {
      const stmt = this.connection.prepare(`
        INSERT INTO cached_stream_info VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT (video_link) DO UPDATE SET
          video_link      = excluded.video_link,
          status          = excluded.status,
          title           = excluded.title,
          thumbnail       = excluded.thumbnail,
          start_time      = excluded.start_time,
          members_only    = excluded.members_only,
          type            = excluded.type,
          last_check_time = excluded.last_check_time
      `);

      streamInfos.forEach((v) => {
        stmt.run([
          v.videoLink,
          v.live,
          v.title,
          v.thumbnail,
          v.streamStartTime ? v.streamStartTime : null,
          v.isMembersOnly,
          v.streamType,
          ts,
        ]);
      });

      stmt.finalize();
    });
  };

  getVod = (): Promise<IVodInfo | undefined> => {
    return new Promise<IVodInfo>((resolve, reject) => {
      this.connection.get<IVodInfo>(
        `SELECT video_link, title, thumbnail, uploaded_date, members_only, _last_valid FROM vod ORDER BY random() LIMIT 1`,
        (err, row) => {
          if (err) {
            console.error("[getVod]", "query error:", err);
            return reject(err);
          }
          resolve(row);
        }
      );
    });
  };

  async insertVods(vodEntries: IVodInfo[]): Promise<void> {
    const stmt = this.connection.prepare(`
            INSERT INTO vod VALUES (?, ?, ?, ?, ?, 0, 0)
            ON CONFLICT (video_link) DO UPDATE SET
                video_link          = excluded.video_link,
                title               = excluded.title,
                thumbnail           = excluded.thumbnail,
                uploaded_date       = excluded.uploaded_date,
                length_seconds      = excluded.length_seconds,
                members_only        = excluded.members_only,
                _last_valid         = excluded._last_valid
        `);

    vodEntries.forEach((v) =>
      stmt.run([
        v.video_link,
        v.title,
        v.thumbnail,
        v.uploaded_date,
        v.length_seconds,
      ])
    );
    stmt.finalize();
  }

  teardown = (): Promise<void> => {
    return new Promise((resolve) => {
      this.connection.close((err) => {
        if (err) {
          console.error("[teardown]", err);
        }
        resolve();
      });
    });
  };
}

export async function getCoordinator() {
  return new SQLiteCoordinator();
}

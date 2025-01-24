import pg, { PoolClient } from "pg";
import { IBaseCoordinator } from "./base_client";
import {
  CachedStreamInfo,
  ICachedStreamInfo,
} from "../models/CachedStreamInfo";
import { STREAM_TYPE } from "../common/enums";
import { StreamInfo } from "../models/StreamInfo";
import { IVodInfo } from "../models/VodInfo";
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  connectionTimeoutMillis: 1500,
  idleTimeoutMillis: 2500,
  max: 100,
  ssl: true,
});

export class PostgresCoordinator implements IBaseCoordinator {
  connection: PoolClient | undefined = undefined;

  async _connect(): Promise<this> {
    try {
      this.connection = await pool.connect();
      return this;
    } catch (e) {
      throw new Error(`[_connect]: error connecting ${e}`);
    }
  }

  async getCachedStreamInfo(nearTime: number): Promise<ICachedStreamInfo> {
    let res;
    try {
      res = await this.connection!.query<ICachedStreamInfo>(
        `SELECT * FROM cached_stream_info WHERE type != $1 ORDER BY ABS($2 - start_time) LIMIT 1`,
        [STREAM_TYPE.DEAD, nearTime]
      );
    } catch (e) {
      console.error("[getCachedStreamInfo]", "query error:", e);
      return new CachedStreamInfo();
    }

    const row = res.rows[0];

    return row ? row : new CachedStreamInfo();
  }

  async updateCache(streamInfos: StreamInfo[]): Promise<void> {
    const ts = Date.now();
    await this.transaction(async (client) => {
      for (const v of streamInfos) {
        await client.query(
          `
          INSERT INTO cached_stream_info VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (video_link) DO UPDATE SET
              video_link      = excluded.video_link,
              status          = excluded.status,
              title           = excluded.title,
              thumbnail       = excluded.thumbnail,
              start_time      = excluded.start_time,
              members_only    = excluded.members_only,
              type            = excluded.type,
              last_check_time = excluded.last_check_time
          `,
          [
            v.videoLink,
            v.live,
            v.title,
            v.thumbnail,
            v.streamStartTime ? v.streamStartTime : null,
            v.isMembersOnly,
            v.streamType,
            ts,
          ]
        );
      }
    });
  }

  async getVod(): Promise<IVodInfo | undefined> {
    let res;
    try {
      res = await this.connection!.query(
        `SELECT video_link, title, thumbnail, uploaded_date, _last_valid FROM vod LIMIT 1 OFFSET (floor(random() * (SELECT num_vods FROM vod_count)))`
      );
    } catch (e) {
      console.error("[getVod]", "query error:", e);
      return undefined;
    }

    return res.rows[0];
  }

  async insertVods(vodEntries: IVodInfo[]) {
    const ts = Date.now();
    console.debug("[insertVod]", "enter");
    await this.transaction(async (client) => {
      for (const vod of vodEntries) {
        await client.query(
          `
                    INSERT INTO vod VALUES ($1, $2, $3, $4, $5, false, $6)
                    ON CONFLICT (video_link) DO UPDATE SET
                        video_link             = excluded.video_link,
                        title                  = excluded.title,
                        thumbnail              = excluded.thumbnail,
                        uploaded_date          = excluded.uploaded_date,
                        length_seconds         = excluded.length_seconds,
                        members_only           = excluded.members_only,
                        _last_valid            = excluded._last_valid
                `,
          [
            vod.video_link,
            vod.title,
            vod.thumbnail,
            vod.uploaded_date,
            vod.length_seconds,
            ts,
          ]
        );
      }
    });
    console.debug("[insertVod]", "exit");
  }

  async transaction<T>(
    f: (client: PoolClient) => Promise<T>
  ): Promise<T | undefined> {
    let retVal;
    try {
      await this.connection!.query("BEGIN");
      retVal = await f(this.connection!);
      await this.connection!.query("COMMIT");
    } catch (e) {
      await this.connection!.query("ROLLBACK");
      console.error("[transaction]", "query error:", e);
    }
    return retVal;
  }

  async teardown(): Promise<void> {
    await this.connection!.release(true);
  }
}

export async function getCoordinator(): Promise<PostgresCoordinator> {
  return await new PostgresCoordinator()._connect();
}

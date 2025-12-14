import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

type IssPoint = {
  at: string;
  lat: number;
  lon: number;
  velocity: number;
  altitude: number;
};

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const limitRaw = url.searchParams.get("limit") ?? "240";
  let limit = Number.parseInt(limitRaw, 10);
  if (!Number.isFinite(limit) || limit <= 0) {
    limit = 240;
  }
  if (limit > 1000) {
    limit = 1000;
  }

  try {
    const client = await pool.connect();
    try {
      const resDb = await client.query(
        "select fetched_at, payload from iss_fetch_log order by id desc limit $1",
        [limit]
      );
      const rows = resDb.rows as { fetched_at: Date; payload: any }[];
      const points: IssPoint[] = [];

      for (const row of rows.reverse()) {
        const p = row.payload || {};
        const lat = Number(p.latitude ?? p.lat);
        const lon = Number(p.longitude ?? p.lon);
        const velocity = Number(p.velocity ?? p.speed);
        const altitude = Number(p.altitude ?? p.alt);
        if (
          Number.isFinite(lat) &&
          Number.isFinite(lon) &&
          Number.isFinite(velocity) &&
          Number.isFinite(altitude)
        ) {
          const at =
            row.fetched_at instanceof Date
              ? row.fetched_at.toISOString()
              : String(row.fetched_at ?? "");
          points.push({ at, lat, lon, velocity, altitude });
        }
      }

      return NextResponse.json({ points });
    } finally {
      client.release();
    }
  } catch {
    return NextResponse.json({ points: [] }, { status: 200 });
  }
}

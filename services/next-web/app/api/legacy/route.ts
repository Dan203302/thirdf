import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const limitRaw = url.searchParams.get("limit") ?? "500";
  let limit = Number.parseInt(limitRaw, 10);
  if (!Number.isFinite(limit) || limit <= 0 || limit > 5000) {
    limit = 500;
  }

  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  const ok = url.searchParams.get("ok");

  const where: string[] = [];
  const params: unknown[] = [];
  let idx = 1;

  if (from) {
    where.push(`recorded_at >= $${idx++}`);
    params.push(new Date(from));
  }

  if (to) {
    where.push(`recorded_at <= $${idx++}`);
    params.push(new Date(to));
  }

  if (ok === "true" || ok === "false") {
    where.push(`is_ok = $${idx++}`);
    params.push(ok === "true");
  }

  let text = "select id, recorded_at, is_ok, voltage, temp, source_file from telemetry_legacy";
  if (where.length) {
    text += " where " + where.join(" and ");
  }
  text += " order by recorded_at desc";
  text += " limit " + String(limit);

  try {
    const client = await pool.connect();
    try {
      const resDb = await client.query(text, params);
      return NextResponse.json({ items: resDb.rows });
    } finally {
      client.release();
    }
  } catch (e) {
    return NextResponse.json({ items: [] }, { status: 200 });
  }
}

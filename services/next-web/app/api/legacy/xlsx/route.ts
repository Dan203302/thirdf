import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
import ExcelJS from "exceljs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
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

  let text = "select recorded_at, is_ok, voltage, temp, source_file from telemetry_legacy";
  if (where.length) {
    text += " where " + where.join(" and ");
  }
  text += " order by recorded_at desc";
  text += " limit 10000";

  try {
    const client = await pool.connect();
    let rows: any[] = [];
    try {
      const resDb = await client.query(text, params);
      rows = resDb.rows;
    } finally {
      client.release();
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("telemetry");
    sheet.columns = [
      { header: "recorded_at", key: "recorded_at" },
      { header: "is_ok", key: "is_ok" },
      { header: "voltage", key: "voltage" },
      { header: "temp", key: "temp" },
      { header: "source_file", key: "source_file" },
    ];

    for (const row of rows) {
      const recorded = row.recorded_at instanceof Date ? row.recorded_at.toISOString() : String(row.recorded_at ?? "");
      sheet.addRow({
        recorded_at: recorded,
        is_ok: row.is_ok,
        voltage: row.voltage,
        temp: row.temp,
        source_file: row.source_file,
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const now = new Date();
    const ts = now.toISOString().replace(/[:.]/g, "-");

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="telemetry_legacy_${ts}.xlsx"`,
      },
    });
  } catch (e) {
    return NextResponse.json({ error: "failed to build xlsx" }, { status: 500 });
  }
}

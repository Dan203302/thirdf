import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const lat = Number.parseFloat(url.searchParams.get("lat") ?? "55.7558");
  const lon = Number.parseFloat(url.searchParams.get("lon") ?? "37.6176");
  let days = Number.parseInt(url.searchParams.get("days") ?? "7", 10);
  if (!Number.isFinite(days)) days = 7;
  if (days < 1) days = 1;
  if (days > 30) days = 30;

  const appId = process.env.ASTRO_APP_ID || "";
  const secret = process.env.ASTRO_APP_SECRET || "";
  if (!appId || !secret) {
    return NextResponse.json(
      { error: "Missing ASTRO_APP_ID/ASTRO_APP_SECRET" },
      { status: 500 }
    );
  }

  const now = new Date();
  const from = new Date(now);
  const to = new Date(now);
  to.setUTCDate(to.getUTCDate() + days);

  const formatDate = (d: Date) => d.toISOString().slice(0, 10);

  const qs = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    from: formatDate(from),
    to: formatDate(to),
  }).toString();

  const apiUrl = `https://api.astronomyapi.com/api/v2/bodies/events?${qs}`;
  const auth = Buffer.from(`${appId}:${secret}`).toString("base64");

  try {
    const res = await fetch(apiUrl, {
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
        "User-Agent": "monolith-iss/1.0",
      },
      next: { revalidate: 300 },
    });

    const raw = await res.text();
    if (!res.ok) {
      return NextResponse.json(
        { error: `HTTP ${res.status}`, code: res.status, raw },
        { status: 403 }
      );
    }

    try {
      const json = JSON.parse(raw);
      return NextResponse.json(json);
    } catch {
      return NextResponse.json({ raw }, { status: 200 });
    }
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "astro fetch failed" },
      { status: 500 }
    );
  }
}

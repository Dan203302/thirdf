import { NextRequest, NextResponse } from "next/server";

type RawOsdrRow = {
  id?: string | number;
  status?: string | null;
  updated_at?: string | null;
  inserted_at?: string | null;
  raw?: unknown;
};

type OsdrItem = {
  id: string | number | null;
  dataset_id?: string | null;
  title?: string | null;
  status?: string | null;
  updated_at?: string | null;
  inserted_at?: string | null;
  rest_url?: string | null;
  raw?: unknown;
};

function looksOsdrDict(raw: unknown): raw is Record<string, any> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return false;
  for (const [k, v] of Object.entries(raw)) {
    if (typeof k === "string" && k.startsWith("OSD-")) return true;
    if (v && typeof v === "object") {
      const o = v as Record<string, unknown>;
      if (o["REST_URL"] || o["rest_url"]) return true;
    }
  }
  return false;
}

function flattenOsdr(items: unknown[]): OsdrItem[] {
  const out: OsdrItem[] = [];
  for (const rowAny of items) {
    const row = (rowAny || {}) as RawOsdrRow & { raw?: any };
    const raw = row.raw ?? {};
    if (raw && looksOsdrDict(raw)) {
      for (const [k, vAny] of Object.entries(raw)) {
        if (!vAny || typeof vAny !== "object") continue;
        const v = vAny as Record<string, any>;
        const rest =
          (v["REST_URL"] as string | undefined) ??
          (v["rest_url"] as string | undefined) ??
          (v["rest"] as string | undefined) ??
          null;
        let title = (v["title"] as string | undefined) ?? (v["name"] as string | undefined) ?? null;
        if (!title && typeof rest === "string") {
          const trimmed = rest.replace(/\/+$/, "");
          const segments = trimmed.split("/");
          title = segments[segments.length - 1] || null;
        }
        out.push({
          id: row.id ?? null,
          dataset_id: String(k),
          title,
          status: row.status ?? null,
          updated_at: row.updated_at ?? null,
          inserted_at: row.inserted_at ?? null,
          rest_url: rest,
          raw: v,
        });
      }
    } else {
      const r = (raw && typeof raw === "object" ? (raw as Record<string, any>) : null) ?? null;
      const rest = r ? ((r["REST_URL"] as string | undefined) ?? (r["rest_url"] as string | undefined) ?? null) : null;
      const baseRow: OsdrItem = {
        id: row.id ?? null,
        status: row.status ?? null,
        updated_at: row.updated_at ?? null,
        inserted_at: row.inserted_at ?? null,
        rest_url: rest,
        raw,
      };
      out.push(baseRow);
    }
  }
  return out;
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const limit = url.searchParams.get("limit") ?? "20";
  const base = process.env.RUST_BASE || "http://rust_iss:3000";
  const src = `${base}/osdr/list?limit=${encodeURIComponent(limit)}`;

  try {
    const res = await fetch(src, { next: { revalidate: 30 } });
    if (!res.ok) {
      return NextResponse.json({ src, items: [] }, { status: 200 });
    }
    const json = (await res.json().catch(() => ({}))) as { items?: unknown[] };
    const list = Array.isArray(json.items) ? json.items : [];
    const flat = flattenOsdr(list);
    return NextResponse.json({ src, items: flat });
  } catch (e) {
    return NextResponse.json({ src, items: [] }, { status: 200 });
  }
}

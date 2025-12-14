import { NextRequest, NextResponse } from "next/server";

function pickImageUrl(v: any): string | null {
  const stack = [v];
  while (stack.length) {
    const cur = stack.pop();
    if (!cur || typeof cur !== "object") continue;
    for (const val of Object.values(cur)) {
      if (typeof val === "string" && /^https?:\/\/.*\.(jpg|jpeg|png)(\?.*)?$/i.test(val)) {
        return val;
      }
      if (val && typeof val === "object") stack.push(val as any);
    }
  }
  return null;
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const src = url.searchParams.get("source") || "jpg";
  const suffix = (url.searchParams.get("suffix") || "").trim();
  const program = (url.searchParams.get("program") || "").trim();
  const instF = (url.searchParams.get("instrument") || "").trim().toUpperCase();
  const perRaw = url.searchParams.get("perPage") || "24";
  let per = Number.parseInt(perRaw, 10);
  if (!Number.isFinite(per) || per <= 0) per = 24;
  if (per > 60) per = 60;
  const pageRaw = url.searchParams.get("page") || "1";
  let page = Number.parseInt(pageRaw, 10);
  if (!Number.isFinite(page) || page <= 0) page = 1;

  const host = (process.env.JWST_HOST || "https://api.jwstapi.com").replace(/\/+$/, "");
  const apiKey = process.env.JWST_API_KEY || "";
  const email = process.env.JWST_EMAIL || "";

  let path = "all/type/jpg";
  if (src === "suffix" && suffix !== "") {
    path = "all/suffix/" + suffix.replace(/^\/+/, "");
  }
  if (src === "program" && program !== "") {
    path = "program/id/" + encodeURIComponent(program);
  }

  const qs = new URLSearchParams({ page: String(page), perPage: String(per) }).toString();
  const apiUrl = `${host}/${path}?${qs}`;

  const headers: Record<string, string> = {};
  if (apiKey) headers["x-api-key"] = apiKey;
  if (email) headers["email"] = email;

  try {
    const res = await fetch(apiUrl, {
      headers,
      next: { revalidate: 300 },
    });
    if (!res.ok) {
      return NextResponse.json(
        { source: path, count: 0, items: [] },
        { status: 200 }
      );
    }
    const body = await res.json().catch(() => ({}));
    const list: any[] = Array.isArray(body)
      ? body
      : Array.isArray(body.body)
      ? body.body
      : Array.isArray(body.data)
      ? body.data
      : [];

    const items: any[] = [];
    for (const itAny of list) {
      const it = itAny as any;
      if (!it || typeof it !== "object") continue;

      let imgUrl: string | null = null;
      const loc = (it.location as string | undefined) || (it.url as string | undefined) || null;
      const thumb = (it.thumbnail as string | undefined) || null;
      for (const candidate of [loc, thumb]) {
        if (
          typeof candidate === "string" &&
          /\.(jpg|jpeg|png)(\?.*)?$/i.test(candidate)
        ) {
          imgUrl = candidate;
          break;
        }
      }
      if (!imgUrl) {
        imgUrl = pickImageUrl(it);
      }
      if (!imgUrl) continue;

      const instList: string[] = [];
      const instArr = (it.details && Array.isArray(it.details.instruments)
        ? it.details.instruments
        : []) as any[];
      for (const I of instArr) {
        if (I && typeof I === "object" && typeof I.instrument === "string") {
          instList.push(I.instrument.toUpperCase());
        }
      }
      if (instF && instList.length && !instList.includes(instF)) continue;

      const obs = String(
        (it.observation_id as string | undefined) ||
          (it.observationId as string | undefined) ||
          ""
      );
      const prog = String(it.program ?? "");
      const sfx = String(
        (it.details && it.details.suffix) || it.suffix || ""
      );
      const caption = `${obs || (it.id ?? "")} · P${prog || "-"}` +
        (sfx ? ` · ${sfx}` : "") +
        (instList.length ? ` · ${instList.join("/")}` : "");

      items.push({
        url: imgUrl,
        obs,
        program: prog,
        suffix: sfx,
        inst: instList,
        caption: caption.trim(),
        link: loc || imgUrl,
      });

      if (items.length >= per) break;
    }

    return NextResponse.json({ source: path, count: items.length, items });
  } catch {
    return NextResponse.json({ source: path, count: 0, items: [] }, { status: 200 });
  }
}

import { NextResponse } from "next/server";

export async function GET() {
  const base = process.env.RUST_BASE || "http://rust_iss:3000";
  const src = `${base}/last`;

  try {
    const res = await fetch(src, { next: { revalidate: 5 } });
    if (!res.ok) {
      return NextResponse.json({}, { status: 200 });
    }
    const json = await res.json().catch(() => ({}));
    return NextResponse.json(json);
  } catch {
    return NextResponse.json({}, { status: 200 });
  }
}

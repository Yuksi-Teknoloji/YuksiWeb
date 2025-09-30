import { NextResponse } from "next/server";

const API_BASE = (process.env.API_BASE || "http://40.90.226.14:8080").replace(/\/+$/, "");

export async function GET() {
  const r = await fetch(`${API_BASE}/api/Banner/get-banners`, { cache: "no-store" });
  const data = await r.json().catch(() => ({}));
  return NextResponse.json(data, { status: r.status });
}

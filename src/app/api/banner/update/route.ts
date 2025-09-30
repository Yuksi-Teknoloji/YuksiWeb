import { NextResponse } from "next/server";
const API_BASE = (process.env.API_BASE || "http://40.90.226.14:8080").replace(/\/+$/, "");

export async function PATCH(req: Request) {
  const body = await req.json();
  const r = await fetch(`${API_BASE}/api/Banner/update-banner`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await r.json().catch(() => ({}));
  return NextResponse.json(data, { status: r.status });
}

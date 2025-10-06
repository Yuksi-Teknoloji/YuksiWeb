import { NextResponse } from "next/server";
const API_BASE = (process.env.API_BASE || "http://40.90.226.14:8080").replace(/\/+$/, "");

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const r = await fetch(`${API_BASE}/api/Banner/delete-banner/${(await params).id}`, { method: "DELETE" });
  const data = await r.json().catch(() => ({}));
  return NextResponse.json(data, { status: r.status });
}

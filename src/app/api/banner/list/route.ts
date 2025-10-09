import { NextResponse } from "next/server";
import { API_BASE } from '@/configs/api'; 


export async function GET() {
  const r = await fetch(`${API_BASE}/api/Banner/get-banners`, { cache: "no-store" });
  const data = await r.json().catch(() => ({}));
  return NextResponse.json(data, { status: r.status });
}

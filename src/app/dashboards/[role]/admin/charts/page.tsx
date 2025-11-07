"use client";

import * as React from "react";
import { ChartPie } from "@/components/chart/AdminChart";
import { getAuthToken } from "@/utils/auth";

async function readJson<T = any>(res: Response): Promise<T> {
  const txt = await res.text().catch(() => "");
  try {
    return txt ? JSON.parse(txt) : ({} as any);
  } catch {
    return txt as any;
  }
}

const pickMsg = (d: any, fb: string) => d?.message || d?.detail || d?.title || fb;

export default function Charts() {
  const token = React.useMemo(getAuthToken, []);

  const headers = React.useMemo<HeadersInit>(() => {
    const h: HeadersInit = { Accept: "application/json" };
    if (token) (h as any).Authorization = `Bearer ${token}`;
    return h;
  }, [token]);

  const [data, setData] = React.useState<any>(null);
  const [error, setError] = React.useState<string | null>(null);

  const fetchUsers = React.useCallback(async () => {
    setError(null);
    try {
      const res = await fetch("/yuksi/admin/users/all", {
        cache: "no-store",
        headers,
      });

      const json = await readJson(res);

      if (!res.ok) {
        throw new Error(pickMsg(json, `HTTP ${res.status}`));
      }

      setData(json?.data?.totals ?? null);
    } catch (e: any) {
      setError(e?.message || "Veriler alınamadı.");
      setData(null);
    }
  }, [headers]);

  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  if (error) {
    return (
      <div className="p-10 text-rose-600 whitespace-pre-wrap">
        {error}
      </div>
    );
  }

  if (!data) {
    return ;
  }

  return (
    <div className="flex flex-wrap justify-between gap-15">
      <ChartPie data={data} title="Hesap Türleri" />
    </div>
  );
}

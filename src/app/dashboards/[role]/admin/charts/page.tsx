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

export default function Charts() {
  const token = React.useMemo(getAuthToken, []);

  const headers = React.useMemo<HeadersInit>(() => {
    const h: HeadersInit = { Accept: "application/json" };
    if (token) (h as any).Authorization = `Bearer ${token}`;
    return h;
  }, [token]);

  const [data, setData] = React.useState();

  const fetchUsers = React.useCallback(async () => {
    const res = await fetch("/yuksi/admin/users/all", {
      cache: "no-store",
      headers,
    });

    const json = await readJson(res);

    setData(json?.data?.totals);
  }, [headers]);

  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  if (data) {
    return (
      <div className="flex flex-wrap justify-between gap-15">
        <ChartPie data={data} title={"Hesap Türleri"} />
      </div>
    );
  }
}

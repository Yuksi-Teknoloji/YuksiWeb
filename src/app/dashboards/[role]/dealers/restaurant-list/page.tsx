//src/app/dashboards/[role]/dealers/restaurant-list/page.tsx
"use client";

import * as React from "react";
import { getAuthToken } from "@/utils/auth";

/* ================= Helpers ================= */
async function readJson<T = any>(res: Response): Promise<T> {
  const txt = await res.text();
  try {
    return txt ? JSON.parse(txt) : (null as any);
  } catch {
    return txt as any;
  }
}

const pickMsg = (d: any, fb: string) =>
  d?.message || d?.detail || d?.title || fb;

function collectErrors(x: any): string {
  const msgs: string[] = [];
  if (!x) return "";
  if (x?.message) msgs.push(String(x.message));
  if (x?.data?.message) msgs.push(String(x.data.message));
  const err = x?.errors || x?.error || x?.detail;

  if (Array.isArray(err)) {
    for (const it of err) {
      if (typeof it === "string") msgs.push(it);
      else if (it && typeof it === "object") {
        const loc = Array.isArray((it as any).loc)
          ? (it as any).loc.join(".")
          : (it as any).loc ?? "";
        const m = (it as any).msg || (it as any).message || (it as any).detail;
        if (loc && m) msgs.push(`${loc}: ${m}`);
        else if (m) msgs.push(String(m));
      }
    }
  } else if (err && typeof err === "object") {
    for (const [k, v] of Object.entries(err)) {
      if (Array.isArray(v))
        (v as any[]).forEach((m) => msgs.push(`${k}: ${m}`));
      else if (v) msgs.push(`${k}: ${v}`);
    }
  }
  return msgs.join("\n");
}

/* ================= Types ================= */
type Restaurant = {
  id: string;
  email: string;
  name: string;
  contactPerson: string;
  taxNumber: string;
  phone: string;
  fullAddress: string;
  latitude?: number | null;
  longitude?: number | null;
  openingHour?: string | null;
  closingHour?: string | null;
};

/* ================= Page ================= */
export default function DealerRestaurantListPage() {
  const token = React.useMemo(getAuthToken, []);
  const headers = React.useMemo<HeadersInit>(
    () => ({
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }),
    [token]
  );

  const [rows, setRows] = React.useState<Restaurant[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // pagination
  const [limit, setLimit] = React.useState<number | "">(50);
  const [offset, setOffset] = React.useState<number | "">(0);

  async function loadList() {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams();
      if (limit !== "") qs.set("limit", String(limit));
      if (offset !== "") qs.set("offset", String(offset));

      const res = await fetch(`/yuksi/dealer/restaurants?${qs.toString()}`, {
        headers,
        cache: "no-store",
      });
      const j: any = await readJson(res);
      if (!res.ok || j?.success === false)
        throw new Error(collectErrors(j) || pickMsg(j, `HTTP ${res.status}`));

      const list = Array.isArray(j?.data) ? j.data : [];
      const mapped: Restaurant[] = list.map((x: any) => ({
        id: String(x?.id),

        email: String(x?.email),
        name: String(x?.name),
        contactPerson: String(x?.contactPerson),
        taxNumber: String(x?.taxNumber),
        phone: String(x?.phone),
        fullAddress: String(x?.fullAddress),
        latitude: Number(x?.latitude ?? null),
        longitude: Number(x?.longitude ?? null),
        openingHour: String(x?.openingHour ?? ""),
        closingHour: String(x?.closingHour ?? ""),
      }));
      setRows(mapped);
    } catch (e: any) {
      setError(e?.message || "Kayıtlar alınamadı.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    loadList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Restoran Listesi (Bayi)
          </h1>
          <p className="text-sm text-neutral-600">
            Bayi restoranlarını görüntüle, düzenle veya sil.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={1}
            className="w-28 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-sky-200"
            value={limit}
            onChange={(e) =>
              setLimit(e.target.value === "" ? "" : Number(e.target.value))
            }
            placeholder="limit"
            title="limit"
          />
          <input
            type="number"
            min={0}
            className="w-28 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-sky-200"
            value={offset}
            onChange={(e) =>
              setOffset(e.target.value === "" ? "" : Number(e.target.value))
            }
            placeholder="offset"
            title="offset"
          />
          <button
            onClick={loadList}
            className="rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm hover:bg-neutral-50"
          >
            Yenile
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-rose-50 px-4 py-3 text-sm text-rose-700 whitespace-pre-line">
          {error}
        </div>
      )}

      {/* Table */}
      <section className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full table-fixed">
            <thead>
              <tr className="text-left text-xs text-neutral-500">
                <th className="px-6 py-3 font-medium">ID</th>
                <th className="px-6 py-3 font-medium">Yetkili Mail</th>
                <th className="px-6 py-3 font-medium">Restaurant Adı</th>
                <th className="px-6 py-3 font-medium">Yetkili Adı</th>
                <th className="px-6 py-3 font-medium">Vergi Numarası</th>
                <th className="px-6 py-3 font-medium">Telefon</th>
                <th className="px-6 py-3 font-medium">Adres</th>
                <th className="px-6 py-3 font-medium">Konum</th>
                <th className="px-6 py-3 font-medium">Açılış / Kapanış Saati</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t text-sm">
                  <td className="px-6 py-3">{r.id}</td>
                  <td className="px-6 py-3">{r.email}</td>
                  <td className="px-6 py-3">{r.name}</td>
                  <td className="px-6 py-3">{r.contactPerson}</td>
                  <td className="px-6 py-3">{r.taxNumber}</td>
                  <td className="px-6 py-3">{r.phone}</td>
                  <td className="px-6 py-3">{r.fullAddress ?? "—"}</td>
                  <td className="px-6 py-3">
                    {r.latitude + "," + r.longitude}
                  </td>
                  <td className="px-6 py-3">
                    {r.openingHour + "/" + r.closingHour}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && !loading && (
                <tr>
                  <td
                    colSpan={9}
                    className="px-6 py-10 text-center text-sm text-neutral-500"
                  >
                    Kayıt bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {loading && (
          <div className="px-6 py-3 text-sm text-neutral-500">Yükleniyor…</div>
        )}
      </section>
    </div>
  );
}

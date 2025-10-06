// src/app/dashboards/[role]/admin/restaurants/restaurant-list/page.tsx
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

type Restaurant = {
  id: number | string;
  email: string;
  name: string;
  contactPerson: string | null;
  taxNumber: string | null;
  phone: string | null;
  fullAddress: string | null;
};

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || 'http://40.90.226.14:8080').replace(/\/+$/, '');
const LIST_ENDPOINT = `${API_BASE}/api/Restaurant/list`;

export default function RestaurantListPage() {
  const { role } = useParams<{ role: string }>();

  const [rows, setRows]   = React.useState<Restaurant[]>([]);
  const [query, setQuery] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError]     = React.useState<string | null>(null);

  const [page, setPage] = React.useState(1);
  const pageSize = 10;

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res  = await fetch(LIST_ENDPOINT, { cache: 'no-store' });
        const text = await res.text();
        const data = text ? JSON.parse(text) : null;

        if (!res.ok) {
          const msg =
            data?.title || data?.message || data?.detail || `HTTP ${res.status}`;
          throw new Error(msg);
        }

        // Swagger ekranındaki gerçek yapı:
        // { status, message, data: { isSuccessful, data: [ ...list ] } }
        const listRaw =
          Array.isArray(data?.data?.data)
            ? data.data.data
            : Array.isArray(data?.data)
              ? data.data
              : Array.isArray(data) ? data : [];

        const mapped: Restaurant[] = listRaw.map((r: any, i: number) => ({
          id: r?.id ?? i + 1,
          email: r?.email ?? '',
          name: r?.name ?? '',
          contactPerson: r?.contactPerson ?? null,
          taxNumber: r?.taxNumber ?? null,
          phone: r?.phone ?? null,
          fullAddress: r?.fullAddress ?? null,
        }));

        if (!cancelled) {
          setRows(mapped);
          setPage(1);
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Restoran listesi alınamadı.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      [r.name, r.contactPerson, r.email, r.phone, r.taxNumber, r.fullAddress]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [rows, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = React.useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  const createHref = `/dashboards/${role}/admin/restaurants/create-restaurant`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Restoran Listesi</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => location.reload()}
            className="rounded-xl bg-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-300"
          >
            Yenile
          </button>
          <Link
            href={createHref}
            className="rounded-xl bg-orange-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-orange-700"
          >
            Yeni Restoran
          </Link>
        </div>
      </div>

      <section className="rounded-2xl border border-neutral-200/70 bg-white shadow-sm">
        <div className="p-6">
          <div className="space-y-2">
            <input
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
              placeholder="İsim, yetkili, e-posta, telefon, vergi no, adres…"
              className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 text-neutral-800 outline-none ring-2 ring-transparent transition placeholder:text-neutral-400 focus:bg-white focus:ring-sky-200"
            />
            <p className="text-sm text-neutral-500">
              Toplam {filtered.length} kayıt{query ? ` (filtre: “${query}”)` : ''}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-t border-neutral-200/70">
            <thead>
              <tr className="text-left text-sm text-neutral-500">
                <th className="px-6 py-3 font-medium">Ad</th>
                <th className="px-6 py-3 font-medium">Yetkili</th>
                <th className="px-6 py-3 font-medium">E-posta</th>
                <th className="px-6 py-3 font-medium">Telefon</th>
                <th className="px-6 py-3 font-medium">Vergi No</th>
                <th className="px-6 py-3 font-medium">Adres</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-neutral-500">Yükleniyor…</td>
                </tr>
              )}

              {!loading && error && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-rose-600">{error}</td>
                </tr>
              )}

              {!loading && !error && pageRows.map((r) => (
                <tr key={r.id} className="border-t border-neutral-200/70 align-top hover:bg-neutral-50">
                  <td className="px-6 py-4"><div className="font-semibold text-neutral-900">{r.name || '-'}</div></td>
                  <td className="px-6 py-4"><div className="text-neutral-900">{r.contactPerson || '-'}</div></td>
                  <td className="px-6 py-4"><div className="text-neutral-900">{r.email || '-'}</div></td>
                  <td className="px-6 py-4"><div className="text-neutral-900">{r.phone || '-'}</div></td>
                  <td className="px-6 py-4"><div className="text-neutral-900">{r.taxNumber || '-'}</div></td>
                  <td className="px-6 py-4"><div className="max-w-[520px] text-neutral-900">{r.fullAddress || '-'}</div></td>
                </tr>
              ))}

              {!loading && !error && pageRows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-neutral-500">Kayıt bulunamadı.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Sayfalama */}
        {!loading && !error && totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 text-sm text-neutral-600">
            <span>Sayfa {page} / {totalPages}</span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-lg border px-3 py-1.5 disabled:opacity-40"
              >
                ‹ Önceki
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="rounded-lg border px-3 py-1.5 disabled:opacity-40"
              >
                Sonraki ›
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

// src/app/dashboards/[role]/admin/restaurants/restaurant-list/page.tsx
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { API_BASE } from '@/configs/api';

type Restaurant = {
  id: number | string;
  email: string;
  name: string;
  contactPerson: string | null;
  taxNumber: string | null;
  phone: string | null;
  fullAddress: string | null;
};

type ListResponse = {
  isSuccessful: boolean;
  data: {
    items: Restaurant[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
  };
  message?: string | null;
  errors?: unknown;
  hasData?: boolean;
};

const PAGE_SIZE = 10;

export default function RestaurantListPage() {
  const { role } = useParams<{ role: string }>();

  const [rows, setRows] = React.useState<Restaurant[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [query, setQuery] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [totalCount, setTotalCount] = React.useState(0);

  const load = React.useCallback(async (pageNumber: number) => {
    setLoading(true);
    setError(null);
    try {
      // (Opsiyonel) auth gerekiyorsa token ekle
      const token =
        typeof window !== 'undefined'
          ? window.localStorage.getItem('yuksi_token')
          : null;

      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const url = new URL(`${API_BASE}/api/Restaurant/list`);
      url.searchParams.set('pageNumber', String(pageNumber));
      url.searchParams.set('pageSize', String(PAGE_SIZE));

      const res = await fetch(url.toString(), { cache: 'no-store', headers });
      const txt = await res.text();
      const json: ListResponse | any = txt ? JSON.parse(txt) : null;

      if (!res.ok) {
        const msg =
          (json && (json.message || json.title || json.detail)) ||
          `HTTP ${res.status}`;
        throw new Error(msg);
      }

      // Beklenen yapı: { isSuccessful, data: { items, totalCount, pageNumber, pageSize, totalPages }, ... }
      const payload = json?.data;
      const items: any[] = Array.isArray(payload?.items) ? payload.items : [];

      const mapped: Restaurant[] = items.map((r, i) => ({
        id: r?.id ?? i + 1,
        email: r?.email ?? '',
        name: r?.name ?? '',
        contactPerson: r?.contactPerson ?? null,
        taxNumber: r?.taxNumber ?? null,
        phone: r?.phone ?? null,
        fullAddress: r?.fullAddress ?? null,
      }));

      setRows(mapped);
      setPage(payload?.pageNumber ?? pageNumber);
      setTotalPages(payload?.totalPages ?? 1);
      setTotalCount(payload?.totalCount ?? mapped.length);
    } catch (e: any) {
      setError(e?.message || 'Restoran listesi alınamadı.');
      setRows([]);
      setTotalPages(1);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load(1);
  }, [load]);

  // İstemci tarafı arama (sunucu pageli liste üzerinde filtre)
  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      [r.name, r.contactPerson, r.email, r.phone, r.taxNumber, r.fullAddress]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)),
    );
  }, [rows, query]);

  const createHref = `/dashboards/${role}/admin/restaurants/create-restaurant`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Restoran Listesi</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => load(page)}
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
              onChange={(e) => setQuery(e.target.value)}
              placeholder="İsim, yetkili, e-posta, telefon, vergi no, adres…"
              className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 text-neutral-800 outline-none ring-2 ring-transparent transition placeholder:text-neutral-400 focus:bg-white focus:ring-sky-200"
            />
            <p className="text-sm text-neutral-500">
              Toplam {totalCount} kayıt • Bu sayfada {rows.length} kayıt
              {query ? ` (filtre: “${query}”)` : ''}
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
                  <td colSpan={6} className="px-6 py-8 text-center text-neutral-500">
                    Yükleniyor…
                  </td>
                </tr>
              )}

              {!loading && error && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 whitespace-pre-wrap text-center text-rose-600">
                    {error}
                  </td>
                </tr>
              )}

              {!loading &&
                !error &&
                filtered.map((r) => (
                  <tr key={r.id} className="border-t border-neutral-200/70 align-top hover:bg-neutral-50">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-neutral-900">{r.name || '-'}</div>
                    </td>
                    <td className="px-6 py-4"><div className="text-neutral-900">{r.contactPerson || '-'}</div></td>
                    <td className="px-6 py-4"><div className="text-neutral-900">{r.email || '-'}</div></td>
                    <td className="px-6 py-4"><div className="text-neutral-900">{r.phone || '-'}</div></td>
                    <td className="px-6 py-4"><div className="text-neutral-900">{r.taxNumber || '-'}</div></td>
                    <td className="px-6 py-4"><div className="max-w-[520px] text-neutral-900">{r.fullAddress || '-'}</div></td>
                  </tr>
                ))}

              {!loading && !error && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-neutral-500">
                    Kayıt bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Sunucu sayfalama */}
        {!loading && !error && totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 text-sm text-neutral-600">
            <span>
              Sayfa {page} / {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => {
                  const next = Math.max(1, page - 1);
                  setPage(next);
                  load(next);
                }}
                className="rounded-lg border px-3 py-1.5 disabled:opacity-40"
              >
                ‹ Önceki
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => {
                  const next = Math.min(totalPages, page + 1);
                  setPage(next);
                  load(next);
                }}
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

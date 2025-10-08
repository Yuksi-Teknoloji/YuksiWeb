// src/app/dashboards/[role]/admin/carriers/carrier-list/page.tsx
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || 'http://40.90.226.14:8080').replace(/\/+$/, '');

type DocsStatus =
  | ''
  | 'Evrak Bekleniyor'
  | 'İnceleme Bekliyor'
  | 'Onaylandı'
  | 'Eksik Belge'
  | 'Reddedildi';

type CarrierRow = {
  id: string;
  name: string;
  tc?: string;
  plate?: string;
  createdAt: string;
  docsStatus: DocsStatus;
  city?: string;
  active: boolean;

  vehicleType?: number | null;
  workingType?: number | null;
  vehicleCapacity?: number | null;
  vehicleModel?: number | null;
  packageStart?: string | null;
  packageEnd?: string | null;
};

type CourierApi = {
  id: number;
  firstName: string;
  lastName: string;
  vehicleType: number;
  workingType: number;
  vehicleCapacity: number;
  vehicleModel: number;
  packageStart: string;
  packageEnd: string;
};

type Paginated<T> = {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
};

export default function CarrierListPage() {
  const { role } = useParams<{ role: string }>();
  const createHref = `/dashboards/${role}/admin/dealers/create-dealer`;

  const [query, setQuery] = React.useState('');
  const [rows, setRows] = React.useState<CarrierRow[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // pagination state (backend default: page 1 size 10)
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [totalPages, setTotalPages] = React.useState(1);
  const [totalCount, setTotalCount] = React.useState(0);

  async function fetchCouriers(p = page, s = pageSize) {
    setLoading(true);
    setError(null);
    try {
      // bazı kurulumlarda query param yokmuş gibi görünüyor; ama ekledim, yoksa backend ignore eder.
      const url = `${API_BASE}/api/Admin/GetAllCouriers?pageNumber=${p}&pageSize=${s}`;
      const res = await fetch(url, { cache: 'no-store' });
      const txt = await res.text();
      const data = txt ? JSON.parse(txt) : null;

      if (!res.ok) {
        const msg = data?.message || data?.title || `HTTP ${res.status}`;
        throw new Error(msg);
      }

      const paged: Paginated<CourierApi> = data?.data || {
        items: Array.isArray(data) ? data : [],
        totalCount: Array.isArray(data) ? data.length : 0,
        pageNumber: p,
        pageSize: s,
        totalPages: 1,
      };

      const mapped: CarrierRow[] = (paged.items || []).map((c) => ({
        id: String(c.id),
        name: [c.firstName, c.lastName].filter(Boolean).join(' ').trim() || '-',
        tc: '',
        plate: '-',
        createdAt: '-',
        docsStatus: 'Evrak Bekleniyor',
        city: '',
        active: true,

        vehicleType: c.vehicleType ?? null,
        workingType: c.workingType ?? null,
        vehicleCapacity: c.vehicleCapacity ?? null,
        vehicleModel: c.vehicleModel ?? null,
        packageStart: c.packageStart ?? null,
        packageEnd: c.packageEnd ?? null,
      }));

      setRows(mapped);
      setPage(paged.pageNumber);
      setPageSize(paged.pageSize);
      setTotalPages(paged.totalPages);
      setTotalCount(paged.totalCount);
    } catch (e: any) {
      setError(e?.message || 'Kuryeler alınamadı.');
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    fetchCouriers(1, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // sayfa veya pageSize değişince yeniden çek
  React.useEffect(() => {
    fetchCouriers(page, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      [r.name, r.tc ?? '', r.plate ?? '', r.city ?? ''].some((v) =>
        v.toLowerCase().includes(q),
      ),
    );
  }, [rows, query]);

  function toggleActive(id: string) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, active: !r.active } : r)));
  }

  function onEdit(id: string) {
    alert(`Düzenle: ${id}`);
  }
  function onDelete(id: string) {
    if (confirm('Bu kullanıcıyı silmek istediğine emin misin?')) {
      setRows((prev) => prev.filter((r) => r.id !== id));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Kullanıcı Listesi</h1>
        <Link
          href={createHref}
          className="btn-accent rounded-2xl bg-orange-500 text-white px-4 py-2 text-sm font-medium shadow-sm transition active:translate-y-px"
        >
          Yeni Kullanıcı Oluştur
        </Link>
      </div>

      <section className="rounded-2xl border border-neutral-200/70 bg-white shadow-sm soft-card">
        <div className="p-6">
          <h2 className="mb-3 text-lg font-semibold">Kullanıcı İşlemleri</h2>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Arama yap"
                className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 text-neutral-800 outline-none ring-2 ring-transparent transition placeholder:text-neutral-400 focus:bg-white focus:ring-sky-200"
              />
              <p className="mt-1 text-sm text-neutral-500">Ad, Soyad, Plaka, Telefon no</p>
            </div>

            <div className="flex items-center gap-2 justify-end">
              <label className="text-sm text-neutral-600">Sayfa Boyutu</label>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="rounded-lg border border-neutral-300 bg-neutral-100 px-3 py-2 text-sm"
              >
                {[10, 20, 50].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {error && <div className="px-6 pb-4 text-sm text-rose-600">{error}</div>}

        <div className="overflow-x-auto">
          <table className="min-w-full border-t border-neutral-200/70">
            <thead>
              <tr className="text-left text-sm text-neutral-500">
                <th className="px-6 py-3 font-medium">Ad ve Soyad</th>
                <th className="px-6 py-3 font-medium">Kayıt Tarihi</th>
                <th className="px-6 py-3 font-medium">Evraklar / TCK</th>
                <th className="px-6 py-3 font-medium">Araç Tipi</th>
                <th className="px-6 py-3 font-medium">Çalışma Tipi</th>
                <th className="px-6 py-3 font-medium">Kapasite</th>
                <th className="px-6 py-3 font-medium">Model</th>
                <th className="px-6 py-3 font-medium">Paket Saatleri</th>
                <th className="px-6 py-3 font-medium">Durum</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td colSpan={10} className="px-6 py-10 text-center text-sm text-neutral-500">
                    Yükleniyor…
                  </td>
                </tr>
              )}

              {!loading &&
                filtered.map((r) => (
                  <tr key={r.id} className="border-t border-neutral-200/70 align-top hover:bg-neutral-50">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-neutral-900">{r.name}</div>
                      <div className="mt-1 text-sm text-neutral-500">
                        {r.tc || '-'}
                        <br />
                        {r.plate || '-'}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-semibold text-neutral-900">{r.createdAt}</div>
                    </td>

                    <td className="px-6 py-4">
                      <select
                        value={r.docsStatus}
                        onChange={(e) =>
                          setRows((prev) =>
                            prev.map((x) =>
                              x.id === r.id ? { ...x, docsStatus: e.target.value as DocsStatus } : x,
                            ),
                          )
                        }
                        className="w-[140px] rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 text-sm text-neutral-800 outline-none ring-2 ring-transparent transition focus:bg-white focus:ring-sky-200"
                      >
                        <option value="">Evrak / TCK</option>
                        <option value="Evrak Bekleniyor">Evrak Bekleniyor</option>
                        <option value="İnceleme Bekliyor">İnceleme Bekliyor</option>
                        <option value="Onaylandı">Onaylandı</option>
                        <option value="Eksik Belge">Eksik Belge</option>
                        <option value="Reddedildi">Reddedildi</option>
                      </select>
                    </td>

                    <td className="px-6 py-4">{r.vehicleType ?? '-'}</td>
                    <td className="px-6 py-4">{r.workingType ?? '-'}</td>
                    <td className="px-6 py-4">{r.vehicleCapacity ?? '-'}</td>
                    <td className="px-6 py-4">{r.vehicleModel ?? '-'}</td>
                    <td className="px-6 py-4">
                      {(r.packageStart || '-') + ' - ' + (r.packageEnd || '-')}
                    </td>

                    <td className="px-6 py-4">
                      <Toggle checked={r.active} onChange={() => toggleActive(r.id)} />
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onEdit(r.id)}
                          className="rounded-lg bg-emerald-500 px-3 py-1.5 text-sm font-semibold text-white shadow hover:bg-emerald-600"
                        >
                          Düzenle
                        </button>
                        <button
                          onClick={() => onDelete(r.id)}
                          className="rounded-lg bg-rose-500 px-3 py-1.5 text-sm font-semibold text-white shadow hover:bg-rose-600"
                        >
                          Sil
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-sm text-neutral-500">
                    Kayıt bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div className="flex items-center bg-white justify-between p-4 border-t border-neutral-200/70 text-sm text-neutral-600">
          <div>
            Toplam <span className="font-medium text-neutral-800">{totalCount}</span> kayıt •
            &nbsp;Sayfa {page}/{totalPages}
          </div>

          <div className="flex items-center gap-2">
            <button
              className="rounded-md px-3 py-1.5 border border-neutral-300 disabled:opacity-50"
              onClick={() => setPage(1)}
              disabled={page <= 1 || loading}
            >
              « İlk
            </button>
            <button
              className="rounded-md px-3 py-1.5 border border-neutral-300 disabled:opacity-50"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
            >
              ‹ Önceki
            </button>
            <button
              className="rounded-md px-3 py-1.5 border border-neutral-300 disabled:opacity-50"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
            >
              Sonraki ›
            </button>
            <button
              className="rounded-md px-3 py-1.5 border border-neutral-300 disabled:opacity-50"
              onClick={() => setPage(totalPages)}
              disabled={page >= totalPages || loading}
            >
              Son » 
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
      className={`relative inline-flex h-9 w-16 items-center rounded-full transition ${
        checked ? 'bg-indigo-500' : 'bg-neutral-300'
      }`}
    >
      <span
        className={`absolute left-1 top-1 h-7 w-7 rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-7' : ''
        }`}
      />
    </button>
  );
}

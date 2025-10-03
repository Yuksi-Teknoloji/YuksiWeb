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
  name: string;            // firstName + lastName
  tc?: string;
  plate?: string;
  createdAt: string;       // API vermiyor → '-' default
  docsStatus: DocsStatus;  // local state
  city?: string;

  active: boolean;         // local state

  // API alanları
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
  vehcileType: number;
  workingType: number;
  vehicleCapacity: number;
  vehicleModel: number;
  packageStart: string; // "HH:mm"
  packageEnd: string;   // "HH:mm"
};

export default function CarrierListPage() {
  const [query, setQuery] = React.useState('');
  const [rows, setRows] = React.useState<CarrierRow[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const { role } = useParams<{ role: string }>();
  const createHref = `/dashboards/${role}/admin/dealers/create-dealer`;

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/api/AdminUser/GetAllCouriers`, { cache: 'no-store' });
        const txt = await res.text();
        const data = txt ? JSON.parse(txt) : null;

        if (!res.ok) {
          const msg =
            (typeof data === 'object' && (data?.title || data?.message)) || `HTTP ${res.status}`;
          throw new Error(msg as string);
        }

        // swagger bazı endpointlerde data içinde dönebiliyor; düz dizi de olabilir
        const list: CourierApi[] = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];

        const mapped: CarrierRow[] = list.map((c) => ({
          id: String(c.id),
          name: [c.firstName, c.lastName].filter(Boolean).join(' ').trim() || '-',
          tc: '',                         // API vermiyor → boş
          plate: '-',                     // istedin diye kolon kalsın
          createdAt: '-',                 // API vermiyor → '-'
          docsStatus: 'Evrak Bekleniyor', // local varsayılan
          city: '',

          active: true, // local toggle

          // API alanları
          vehcileType: c.vehcileType ?? null,
          workingType: c.workingType ?? null,
          vehicleCapacity: c.vehicleCapacity ?? null,
          vehicleModel: c.vehicleModel ?? null,
          packageStart: c.packageStart ?? null,
          packageEnd: c.packageEnd ?? null,
        }));

        if (!cancelled) setRows(mapped);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Kuryeler alınamadı.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      [r.name, r.tc ?? '', r.plate ?? '', r.city ?? ''].some((v) => v.toLowerCase().includes(q)),
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
          className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-600 active:translate-y-px"
        >
          Yeni Kullanıcı Oluştur
        </Link>
      </div>

      <section className="rounded-2xl border border-neutral-200/70 bg-white shadow-sm soft-card">
        <div className="p-6">
          <h2 className="mb-3 text-lg font-semibold">Kullanıcı İşlemleri</h2>

          <div className="space-y-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Arama yap"
              className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 text-neutral-800 outline-none ring-2 ring-transparent transition placeholder:text-neutral-400 focus:bg-white focus:ring-sky-200"
            />
            <p className="text-sm text-neutral-500">Ad, Soyad, Plaka, Telefon no</p>
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
                    {/* Ad & alt bilgiler + plate eskisi gibi */}
                    <td className="px-6 py-4">
                      <div className="font-semibold text-neutral-900">{r.name}</div>
                      <div className="mt-1 text-sm text-neutral-500">
                        {r.tc || '-'}
                        <br />
                        {r.plate || '-'}
                      </div>
                    </td>

                    {/* Kayıt Tarihi (eski kolon, API vermiyor) */}
                    <td className="px-6 py-4">
                      <div className="font-semibold text-neutral-900">{r.createdAt}</div>
                    </td>

                    {/* Evrak / TCK select (eski) */}
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
                        className="w-[120px] rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 text-sm text-neutral-800 outline-none ring-2 ring-transparent transition focus:bg-white focus:ring-sky-200"
                      >
                        <option value="">Evrak / TCK</option>
                        <option value="Evrak Bekleniyor">Evrak Bekleniyor</option>
                        <option value="İnceleme Bekliyor">İnceleme Bekliyor</option>
                        <option value="Onaylandı">Onaylandı</option>
                        <option value="Eksik Belge">Eksik Belge</option>
                        <option value="Reddedildi">Reddedildi</option>
                      </select>
                    </td>

                    {/* Yeni API alanları */}
                    <td className="px-6 py-4">{r.vehicleType ?? '-'}</td>
                    <td className="px-6 py-4">{r.workingType ?? '-'}</td>
                    <td className="px-6 py-4">{r.vehicleCapacity ?? '-'}</td>
                    <td className="px-6 py-4">{r.vehicleModel ?? '-'}</td>
                    <td className="px-6 py-4">
                      {(r.packageStart || '-') + ' - ' + (r.packageEnd || '-')}
                    </td>

                    {/* Aktif/Pasif toggle (eski) */}
                    <td className="px-6 py-4">
                      <Toggle checked={r.active} onChange={() => toggleActive(r.id)} />
                    </td>

                    {/* Actions */}
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
      </section>
    </div>
  );
}

/* Basit Toggle */
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

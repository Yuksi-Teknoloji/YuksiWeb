'use client';

import * as React from 'react';
import { RefreshCcw, Loader2 } from 'lucide-react';
import { getAuthToken } from '@/utils/auth';

/* ================= Helpers ================= */
type HeadersDict = HeadersInit;
const bearerHeaders = (token?: string | null): HeadersDict => {
  const h: HeadersDict = { Accept: 'application/json' };
  if (token) (h as any).Authorization = `Bearer ${token}`;
  return h;
};
async function readJson<T = any>(res: Response): Promise<T> {
  const t = await res.text();
  try { return t ? JSON.parse(t) : (null as any); } catch { return (t as any); }
}
const msg = (d: any, fb: string) => d?.message || d?.detail || d?.title || fb;
const fmtDT = (iso?: string | null) => (iso ? new Date(iso).toLocaleString('tr-TR') : '—');

/* ================= API Types ================= */
/** Swagger örneğindeki response alanları */
type SubscriptionDTO = {
  subscriptionId: string;
  courierId: string;
  packageId: string;

  startDate?: string | null;   // ISO
  endDate?: string | null;     // ISO
  createdAt?: string | null;   // ISO

  isActive: boolean;

  packageName?: string | null;
  packageDescription?: string | null;
  packagePrice?: number | null;
  packageDurationDays?: number | null;

  courierFirstName?: string | null;
  courierLastName?: string | null;
  courierPhone?: string | null;
};

/* ================= Page ================= */
export default function AdminTransportPackagesPage() {
  const token = React.useMemo(getAuthToken, []);
  const headers = React.useMemo<HeadersDict>(() => bearerHeaders(token), [token]);

  const [rows, setRows] = React.useState<SubscriptionDTO[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [limit, setLimit] = React.useState<number | ''>('');
  const [offset, setOffset] = React.useState<number | ''>(0);

  const load = React.useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const qs = new URLSearchParams();
      if (limit !== '') qs.set('limit', String(limit));
      if (offset !== '') qs.set('offset', String(offset));

      // Proxy: /yuksi/...
      const res = await fetch(`/yuksi/courier/package-subscriptions?${qs.toString()}`, {
        headers,
        cache: 'no-store',
      });
      const j: any = await readJson(res);
      if (!res.ok || j?.success === false) throw new Error(msg(j, `HTTP ${res.status}`));

      const list: SubscriptionDTO[] = Array.isArray(j?.data) ? j.data : [];
      setRows(list);
    } catch (e: any) {
      setRows([]);
      setError(e?.message || 'Abonelikler getirilemedi.');
    } finally {
      setLoading(false);
    }
  }, [headers, limit, offset]);

  React.useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Kurye Paket Ödemeleri</h1>
          <p className="text-sm text-neutral-600">
            Tüm kurye paket abonelikleri ve ödeme durumları.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={1}
            className="w-28 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-sky-200"
            value={limit}
            onChange={(e) => setLimit(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="limit"
            title="limit"
          />
          <input
            type="number"
            min={0}
            className="w-28 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-sky-200"
            value={offset}
            onChange={(e) => setOffset(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="offset"
            title="offset"
          />
          <button
            onClick={load}
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm hover:bg-neutral-50"
          >
            <RefreshCcw className="h-4 w-4" /> Yenile
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* Table */}
      <section className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full table-fixed">
            <thead>
              <tr className="text-left text-xs text-neutral-500">
                <th className="px-6 py-3 font-medium">Kurye</th>
                <th className="px-6 py-3 font-medium">Telefon</th>
                <th className="px-6 py-3 font-medium">Paket</th>
                <th className="px-6 py-3 font-medium">Açıklama</th>
                <th className="px-6 py-3 font-medium">Fiyat</th>
                <th className="px-6 py-3 font-medium">Süre (gün)</th>
                <th className="px-6 py-3 font-medium">Başlangıç</th>
                <th className="px-6 py-3 font-medium">Bitiş</th>
                <th className="px-6 py-3 font-medium">Oluşturma</th>
                <th className="px-6 py-3 font-medium">Ödeme</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const fullName = [r.courierFirstName, r.courierLastName].filter(Boolean).join(' ') || '—';
                const ok = Boolean(r.isActive);
                return (
                  <tr key={r.subscriptionId} className="border-t text-sm">
                    <td className="px-6 py-3">{fullName}</td>
                    <td className="px-6 py-3">{r.courierPhone || '—'}</td>
                    <td className="px-6 py-3">{r.packageName || '—'}</td>
                    <td className="px-6 py-3">
                      <span className="line-clamp-2">{r.packageDescription || '—'}</span>
                    </td>
                    <td className="px-6 py-3">{r.packagePrice != null ? `${r.packagePrice}₺` : '—'}</td>
                    <td className="px-6 py-3">{r.packageDurationDays ?? '—'}</td>
                    <td className="px-6 py-3">{fmtDT(r.startDate)}</td>
                    <td className="px-6 py-3">{fmtDT(r.endDate)}</td>
                    <td className="px-6 py-3">{fmtDT(r.createdAt)}</td>
                    <td className="px-6 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                          ok
                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-100 text-rose-700 border border-rose-200'
                        }`}
                        title={ok ? 'isActive: true' : 'isActive: false'}
                      >
                        {ok ? 'Ödeme Başarılı' : 'Ödeme Başarısız'}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-6 py-10 text-center text-sm text-neutral-500">
                    Kayıt bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {loading && (
          <div className="flex items-center gap-2 px-6 py-3 text-sm text-neutral-600">
            <Loader2 className="h-4 w-4 animate-spin" /> Yükleniyor…
          </div>
        )}
      </section>
    </div>
  );
}

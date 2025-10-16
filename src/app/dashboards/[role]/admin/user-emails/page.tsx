// src/app/dashboards/[role]/admin/user-emails/page.tsx
'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';

/** Backend: GET /api/Contact/list?limit&offset
 * Response:
 * {
 *   success: true,
 *   message: "Mesajlar getirildi",
 *   data: [{ id, name, email, phone, subject, message, created_at }]
 * }
 */

type ApiContact = {
  id: number;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  created_at: string; // ISO
};

type Row = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  createdAt: Date | null;
};

function fmtDate(d: Date | null) {
  if (!d) return '-';
  try { return d.toLocaleString(); } catch { return '-'; }
}

async function readJson(res: Response) {
  const txt = await res.text();
  try { return txt ? JSON.parse(txt) : null; } catch { return null; }
}
function errMsgOf(j: any, fallback = 'İşlem başarısız.') {
  return j?.message || j?.title || j?.detail || fallback;
}

export default function UserEmailsPage() {
  const { role } = useParams<{ role: string }>();

  const [rows, setRows] = React.useState<Row[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // basit sayfalama (swagger’da offset var)
  const [limit, setLimit] = React.useState<number | ''>('');
  const [offset, setOffset] = React.useState<number>(0);

  const [query, setQuery] = React.useState('');
  const [selected, setSelected] = React.useState<Row | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams();
      if (limit !== '') qs.set('limit', String(limit));
      qs.set('offset', String(offset));
      // Proxy: /yuksi/Contact/list
      const res = await fetch(`/yuksi/Contact/list?${qs.toString()}`, { cache: 'no-store' });
      const j = await readJson(res);
      if (!res.ok) throw new Error(errMsgOf(j, `HTTP ${res.status}`));

      const list: ApiContact[] = Array.isArray(j?.data) ? j.data : [];
      const mapped: Row[] = list.map((c) => ({
        id: String(c.id),
        fullName: c.name ?? '-',
        email: c.email ?? '-',
        phone: c.phone ?? '-',
        subject: c.subject ?? '-',
        message: c.message ?? '',
        createdAt: c.created_at ? new Date(c.created_at) : null,
      }));

      setRows(mapped);
    } catch (e: any) {
      setError(e?.message || 'Mesajlar alınamadı.');
    } finally {
      setLoading(false);
    }
  }, [limit, offset]);

  React.useEffect(() => { load(); }, [load]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      [r.fullName, r.email, r.phone, r.subject, r.message]
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  }, [rows, query]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">İletişim Mesajları</h1>
        <div className="flex items-center gap-2">
          <label className="text-sm text-neutral-600">Limit</label>
          <input
            type="number"
            min={1}
            value={limit}
            onChange={(e) => setLimit(e.target.value === '' ? '' : Number(e.target.value))}
            className="w-24 rounded-lg border border-neutral-300 bg-neutral-100 px-2 py-1.5 text-sm"
            placeholder="-"
          />
          <label className="text-sm text-neutral-600">Offset</label>
          <input
            type="number"
            min={0}
            value={offset}
            onChange={(e) => setOffset(Number(e.target.value) || 0)}
            className="w-24 rounded-lg border border-neutral-300 bg-neutral-100 px-2 py-1.5 text-sm"
          />
          <button
            onClick={load}
            className="rounded-xl bg-neutral-200 px-4 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-300"
          >
            Yenile
          </button>
        </div>
      </div>

      <section className="rounded-2xl border border-neutral-200/70 bg-white shadow-sm">
        <div className="grid gap-3 p-4 sm:grid-cols-3">
          <div className="sm:col-span-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ara: ad, e-posta, konu, mesaj…"
              className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 text-neutral-800 outline-none ring-2 ring-transparent transition placeholder:text-neutral-400 focus:bg-white focus:ring-sky-200"
            />
          </div>
        </div>

        {error && <div className="px-4 pb-2 text-sm text-rose-600">{error}</div>}

        <div className="overflow-x-auto">
          <table className="min-w-full border-t border-neutral-200/70">
            <thead>
              <tr className="text-left text-sm text-neutral-500">
                <th className="px-4 py-3 font-medium w-[180px]">Gönderen</th>
                <th className="px-4 py-3 font-medium">Konu</th>
                <th className="px-4 py-3 font-medium w-[200px]">E-posta</th>
                <th className="px-4 py-3 font-medium w-[140px]">Telefon</th>
                <th className="px-4 py-3 font-medium w-[180px]">Tarih</th>
                <th className="px-4 py-3 font-medium w-[160px]"></th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-neutral-500">
                    Yükleniyor…
                  </td>
                </tr>
              )}

              {!loading && filtered.map((r) => (
                <tr key={r.id} className="border-t border-neutral-200/70 align-top hover:bg-neutral-50">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-neutral-900">{r.fullName}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-neutral-900">{r.subject}</div>
                    <div className="mt-1 line-clamp-2 text-sm text-neutral-600">{r.message}</div>
                  </td>
                  <td className="px-4 py-3 text-neutral-800 truncate">{r.email}</td>
                  <td className="px-4 py-3 text-neutral-800">{r.phone}</td>
                  <td className="px-4 py-3 text-neutral-800">{fmtDate(r.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelected(r)}
                        className="rounded-lg bg-sky-500 px-3 py-1.5 text-sm font-semibold text-white shadow hover:bg-sky-600"
                      >
                        Görüntüle
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-neutral-500">
                    Kayıt yok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {selected && (
        <DetailModal row={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

function DetailModal({ row, onClose }: { row: Row; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-start overflow-y-auto bg-black/50 p-4">
      <div className="mx-auto w-full max-w-3xl rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h3 className="text-xl font-semibold">Mesaj Detayı</h3>
          <button className="rounded-full p-2 hover:bg-neutral-100" onClick={onClose} aria-label="Kapat">✕</button>
        </div>

        <div className="space-y-4 p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Gönderen" value={row.fullName} />
            <Field label="Tarih" value={fmtDate(row.createdAt)} />
            <Field label="E-posta" value={row.email} />
            <Field label="Telefon" value={row.phone} />
            <Field label="Konu" value={row.subject} className="sm:col-span-2" />
          </div>

          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
            <div className="mb-2 text-sm font-medium text-neutral-700">Mesaj</div>
            <p className="whitespace-pre-line text-neutral-800">{row.message}</p>
          </div>

          <div className="flex items-center justify-end gap-2">
            <a
              href={`mailto:${encodeURIComponent(row.email)}?subject=${encodeURIComponent('Re: ' + row.subject)}`}
              className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-600"
            >
              Yanıtla (Mail)
            </a>
            <button
              onClick={onClose}
              className="rounded-lg bg-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-300"
            >
              Kapat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  className = '',
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="mb-1 text-sm font-medium text-neutral-600">{label}</div>
      <div className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-neutral-900">
        {value || '-'}
      </div>
    </div>
  );
}

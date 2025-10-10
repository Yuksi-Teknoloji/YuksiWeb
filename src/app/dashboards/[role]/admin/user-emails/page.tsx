// src/app/dashboards/[role]/admin/user-emails/page.tsx
'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { API_BASE } from '@/configs/api';

enum ContactMessageStatus {
  New = 1,
  Read = 2,
  Archived = 3,
}

type RawContact = {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: string | number;
  createdAt: string;
  // soft-delete alanları (API dönebilir)
  isActive?: boolean;
  isDeleted?: boolean;
};

type Row = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'archived';
  createdAt: Date | null;
};

function fmtDate(d: Date | null) {
  if (!d) return '-';
  try { return d.toLocaleString(); } catch { return '-'; }
}

function normalizeStatus(v: string | number | undefined | null): Row['status'] {
  if (v == null) return 'new';
  if (typeof v === 'string') {
    const s = v.trim().toLowerCase();
    if (s === 'read' || s === 'okundu') return 'read';
    const n = Number(s);
    if (Number.isFinite(n)) return normalizeStatus(n);
    return 'new';
  }
  if (v === 3) return 'archived';
  if (v === 2) return 'read';
  if (v === 1) return 'read'; // eski: 1=read, 0=new
  return 'new';
}

// DELETE yardımcıları
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

  const [query, setQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<'all' | 'new' | 'read' | 'archived'>('all');
  const [selected, setSelected] = React.useState<Row | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/Contact/messages`, { cache: 'no-store' });
      const j = await readJson(res);
      if (!res.ok) throw new Error(errMsgOf(j, `HTTP ${res.status}`));

      // Sadece aktif ve silinmemiş olanları al
      const listAll: RawContact[] = Array.isArray(j?.data) ? j.data : (Array.isArray(j) ? j : []);
      const list = listAll.filter(it => (it.isActive ?? true) === true && (it.isDeleted ?? false) === false);

      const mapped: Row[] = list.map((c) => ({
        id: String(c.id),
        fullName: c.fullName ?? '-',
        email: c.email ?? '-',
        phone: c.phone ?? '-',
        subject: c.subject ?? '-',
        message: c.message ?? '',
        status: normalizeStatus(c.status),
        createdAt: c.createdAt ? new Date(c.createdAt) : null,
      }));

      setRows(mapped);
    } catch (e: any) {
      setError(e?.message || 'Mesajlar alınamadı.');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      const byText =
        !q ||
        [r.fullName, r.email, r.phone, r.subject, r.message].join(' ').toLowerCase().includes(q);
      const byStatus = statusFilter === 'all' || r.status === statusFilter;
      return byText && byStatus;
    });
  }, [rows, query, statusFilter]);

  async function markAsRead(id: string) {
    const prev = rows;
    const already = rows.find(r => r.id === id)?.status === 'read';
    if (already) return;

    setRows((p) => p.map(r => r.id === id ? { ...r, status: 'read' } : r));

    try {
      const res = await fetch(`${API_BASE}/api/Contact/update-status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: Number(id), status: ContactMessageStatus.Read }),
      });
      if (!res.ok) {
        setRows(prev);
        const j = await readJson(res);
        throw new Error(errMsgOf(j, 'İşaretlenemedi.'));
      }
      await load();
    } catch (err) {
      alert((err as Error).message || 'İşaretlenemedi.');
    }
  }

  // === SİL (soft delete) ===
  async function removeRemote(id: string) {
    if (!confirm('Bu mesajı silmek (arşivlemek) istiyor musun?')) return;

    const prev = rows;
    // optimistic: listeden kaldır
    setRows(p => p.filter(r => r.id !== id));

    try {
      // 1) Body ile deneyelim (isActive:false, isDeleted:true)
      let res = await fetch(`${API_BASE}/api/Contact/${Number(id)}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: false, isDeleted: true }),
      });

      // 400/415 vs gelirse gövdesiz yeniden dene
      if (!res.ok && (res.status === 400 || res.status === 415 || res.status === 405)) {
        res = await fetch(`${API_BASE}/api/Contact/${Number(id)}`, { method: 'DELETE' });
      }

      if (!res.ok) {
        setRows(prev); // geri al
        const j = await readJson(res);
        throw new Error(errMsgOf(j, 'Silinemedi.'));
      }

      // başarı: yeniden yükle ve yalnızca aktif/silinmemişleri göster
      await load();
    } catch (e: any) {
      alert(e?.message || 'Silinemedi.');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">İletişim Mesajları</h1>
        <button
          onClick={load}
          className="rounded-xl bg-neutral-200 px-4 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-300"
        >
          Yenile
        </button>
      </div>

      <section className="rounded-2xl border border-neutral-200/70 bg-white shadow-sm">
        <div className="grid gap-3 p-4 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ara: ad, e-posta, konu, mesaj…"
              className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 text-neutral-800 outline-none ring-2 ring-transparent transition placeholder:text-neutral-400 focus:bg-white focus:ring-sky-200"
            />
          </div>
          <div className="flex items-center gap-2 justify-end">
            <label className="text-sm text-neutral-600">Durum</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="rounded-lg border border-neutral-300 bg-neutral-100 px-3 py-2 text-sm"
            >
              <option value="all">Tümü</option>
              <option value="new">Yeni</option>
              <option value="read">Okundu</option>
              <option value="archived">Arşiv</option>
            </select>
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
                <th className="px-4 py-3 font-medium w-[110px]">Durum</th>
                <th className="px-4 py-3 font-medium w-[220px]"></th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-sm text-neutral-500">
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
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold
                        ${r.status === 'new' ? 'bg-amber-100 text-amber-800'
                          : r.status === 'read' ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-neutral-200 text-neutral-700'}`}
                    >
                      {r.status === 'new' ? 'Yeni' : r.status === 'read' ? 'Okundu' : 'Arşiv'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelected(r)}
                        className="rounded-lg bg-sky-500 px-3 py-1.5 text-sm font-semibold text-white shadow hover:bg-sky-600"
                      >
                        Görüntüle
                      </button>
                      <button
                        onClick={() => markAsRead(r.id)}
                        disabled={r.status !== 'new'}
                        className="rounded-lg bg-indigo-500 px-3 py-1.5 text-sm font-semibold text-white shadow
                                   hover:bg-indigo-600 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {r.status === 'read' ? 'Okundu' : 'Okundu İşaretle'}
                      </button>
                      <button
                        onClick={() => removeRemote(r.id)}
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
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-neutral-500">
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

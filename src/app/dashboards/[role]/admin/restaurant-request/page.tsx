// src/app/dashboards/[role]/admin/restaurant-request/page.tsx
'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';

/* --------- auth helper (senin verdiğin) --------- */
export function getAuthToken(): string | null {
  try {
    const ls = localStorage.getItem('auth_token');
    if (ls) return ls;
  } catch {}
  if (typeof document !== 'undefined') {
    const m = document.cookie.match(/(?:^|;\s*)auth_token=([^;]+)/);
    if (m) return decodeURIComponent(m[1]);
  }
  return null;
}

/* --------- küçük yardımcılar --------- */
async function readJson<T = any>(res: Response): Promise<T> {
  const t = await res.text();
  try { return t ? JSON.parse(t) : (null as any); } catch { return (t as any); }
}
const pickMsg = (d: any, fb: string) => d?.message || d?.detail || d?.title || fb;
const fmt = (iso?: string | null) => (iso ? new Date(iso).toLocaleString('tr-TR') : '-');

/* --------- API tipleri --------- */
type TicketRow = {
  id: number;
  restaurant_id: string;
  restaurant_name: string;
  email: string;
  subject: string;
  message: string;
  reply?: string | null;
  status: string; // ör: "answered" vb.
  created_at?: string | null;
  replied_at?: string | null;
};

/* etiket renkleri */
function statusBadgeCls(s: string) {
  const v = s?.toLowerCase();
  if (v === 'answered' || v === 'closed' || v === 'resolved') return 'bg-emerald-100 text-emerald-700';
  if (v === 'in_progress' || v === 'pending') return 'bg-amber-100 text-amber-800';
  if (v === 'new' || v === 'open') return 'bg-indigo-100 text-indigo-700';
  return 'bg-neutral-200 text-neutral-700';
}

/* durum seçenekleri – backend serbest string alıyor; en yaygınları bıraktım */
const STATUS_OPTIONS = ['new', 'in_progress', 'answered', 'closed'] as const;
type StatusOpt = typeof STATUS_OPTIONS[number];

export default function RestaurantRequestAdminPage() {
  const { role } = useParams<{ role: string }>();

  const token = React.useMemo(() => getAuthToken(), []);
  const headers = React.useMemo<HeadersInit>(() => {
    const h: HeadersInit = { Accept: 'application/json' };
    if (token) (h as any).Authorization = `Bearer ${token}`;
    return h;
  }, [token]);

  const [rows, setRows] = React.useState<TicketRow[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [query, setQuery] = React.useState('');
  const [selected, setSelected] = React.useState<TicketRow | null>(null);

  async function load() {
    setLoading(true); setError(null);
    try {
      const res = await fetch('/yuksi/Ticket/admin/list', { cache: 'no-store', headers });
      const j: any = await readJson(res);
      if (!res.ok || j?.success === false) throw new Error(pickMsg(j, `HTTP ${res.status}`));
      const list: TicketRow[] = Array.isArray(j?.data) ? j.data : (Array.isArray(j) ? j : []);
      setRows(list);
    } catch (e: any) {
      setError(e?.message || 'Talepler alınamadı.');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => { load(); }, [/* headers değişirse yükle */]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(r =>
      [r.subject, r.restaurant_name, r.email, r.message, r.reply ?? '']
        .join(' ')
        .toLowerCase()
        .includes(q),
    );
  }, [rows, query]);

  async function updateStatus(id: number, next: StatusOpt) {
    try {
      const res = await fetch(`/yuksi/Ticket/status/${id}?status=${encodeURIComponent(next)}`, {
        method: 'PATCH',
        headers,
      });
      const j = await readJson(res);
      if (!res.ok || j?.success === false) throw new Error(pickMsg(j, `HTTP ${res.status}`));
      setRows(prev => prev.map(r => (r.id === id ? { ...r, status: next } : r)));
    } catch (e: any) {
      alert(e?.message || 'Durum güncellenemedi.');
    }
  }

  async function remove(id: number) {
    if (!confirm('Bu talebi silmek istiyor musun?')) return;
    const prev = rows;
    setRows(p => p.filter(r => r.id !== id));
    try {
      const res = await fetch(`/yuksi/Ticket/delete/${id}`, { method: 'DELETE', headers });
      const j = await readJson(res);
      if (!res.ok || j?.success === false) { setRows(prev); throw new Error(pickMsg(j, `HTTP ${res.status}`)); }
    } catch (e: any) {
      setRows(prev);
      alert(e?.message || 'Silinemedi.');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Restoran Talepleri (Admin)</h1>
        <div className="text-sm text-neutral-500">Rol: {role}</div>
      </div>

      <section className="rounded-2xl border border-neutral-200/70 bg-white shadow-sm">
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ara: konu, restoran adı, e-posta, mesaj…"
            className="w-full sm:max-w-md rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 text-neutral-800 outline-none ring-2 ring-transparent transition placeholder:text-neutral-400 focus:bg-white focus:ring-sky-200"
          />
          <button
            onClick={load}
            className="rounded-xl bg-neutral-200 px-3 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-300"
          >
            Yenile
          </button>
        </div>

        {error && <div className="px-6 pb-3 text-sm text-rose-600">{error}</div>}

        <div className="overflow-x-auto">
          <table className="min-w-full border-t border-neutral-200/70">
            <thead>
              <tr className="text-left text-sm text-neutral-500">
                <th className="px-4 py-3 font-medium">Konu</th>
                <th className="px-4 py-3 font-medium w-[220px]">Restoran</th>
                <th className="px-4 py-3 font-medium w-[240px]">E-posta</th>
                <th className="px-4 py-3 font-medium w-[140px]">Durum</th>
                <th className="px-4 py-3 font-medium w-[180px]">Oluşturma</th>
                <th className="px-4 py-3 font-medium w-[180px]">Cevap Tarihi</th>
                <th className="px-4 py-3 font-medium w-[160px]"></th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-sm text-neutral-500">Yükleniyor…</td>
                </tr>
              )}

              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-sm text-neutral-500">
                    Kayıt bulunamadı.
                  </td>
                </tr>
              )}

              {!loading && filtered.map(r => (
                <tr key={r.id} className="border-t border-neutral-200/70 align-top hover:bg-neutral-50">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-neutral-900">{r.subject}</div>
                    <div className="mt-1 line-clamp-2 text-sm text-neutral-600">{r.message}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-neutral-900">{r.restaurant_name}</div>
                    <div className="text-xs text-neutral-500">{r.restaurant_id}</div>
                  </td>
                  <td className="px-4 py-3">{r.email}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadgeCls(r.status)}`}>
                      {r.status || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3">{fmt(r.created_at)}</td>
                  <td className="px-4 py-3">{fmt(r.replied_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelected(r)}
                        className="rounded-lg bg-sky-500 px-3 py-1.5 text-sm font-semibold text-white shadow hover:bg-sky-600"
                      >
                        Detay / Cevap
                      </button>

                      <select
                        value={r.status}
                        onChange={(e) => updateStatus(r.id, e.target.value as StatusOpt)}
                        className="rounded-lg border border-neutral-300 bg-neutral-100 px-2 py-1.5 text-sm"
                        title="Durum değiştir"
                      >
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>

                      <button
                        onClick={() => remove(r.id)}
                        className="rounded-lg bg-rose-500 px-3 py-1.5 text-sm font-semibold text-white shadow hover:bg-rose-600"
                      >
                        Sil
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {selected && (
        <ReplyModal
          ticket={selected}
          headers={headers}
          onClose={() => setSelected(null)}
          onAfter={(patch) => {
            setRows(prev => prev.map(r => r.id === selected.id ? { ...r, ...patch } as TicketRow : r));
          }}
        />
      )}
    </div>
  );
}

/* -------------------- Reply / Detay Modal -------------------- */
function ReplyModal({
  ticket,
  headers,
  onClose,
  onAfter,
}: {
  ticket: TicketRow;
  headers: HeadersInit;
  onClose: () => void;
  onAfter: (patch: Partial<TicketRow>) => void;
}) {
  const [reply, setReply] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  async function sendReply(e: React.FormEvent) {
    e.preventDefault();
    if (!reply.trim()) return;
    setSaving(true); setErr(null);
    try {
      const res = await fetch(`/yuksi/Ticket/reply/${ticket.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({ reply: reply.trim() }),
      });
      const j = await readJson(res);
      if (!res.ok || j?.success === false) throw new Error(pickMsg(j, `HTTP ${res.status}`));
      onAfter({ reply: reply.trim(), replied_at: new Date().toISOString(), status: 'answered' });
      setReply('');
      onClose();
    } catch (e: any) {
      setErr(e?.message || 'Cevap gönderilemedi.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        className="absolute left-1/2 top-10 w-[min(900px,92vw)] -translate-x-1/2 rounded-2xl bg-white shadow-xl ring-1 ring-black/5 overflow-hidden"
      >
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div>
            <h3 className="text-lg font-semibold text-neutral-900">{ticket.subject}</h3>
            <p className="text-xs text-neutral-500">
              {ticket.restaurant_name} • {ticket.email}
            </p>
          </div>
          <button onClick={onClose} className="rounded-md p-2 hover:bg-neutral-100" aria-label="Kapat">✕</button>
        </div>

        <div className="grid gap-5 p-5 md:grid-cols-2">
          <div className="space-y-3">
            <Field label="Mesaj">
              <div className="whitespace-pre-wrap">{ticket.message || '—'}</div>
            </Field>
            <Field label="Mevcut Cevap">
              <div className="whitespace-pre-wrap">{ticket.reply || '—'}</div>
            </Field>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Field label="Oluşturma">{fmt(ticket.created_at)}</Field>
              <Field label="Cevap Tarihi">{fmt(ticket.replied_at)}</Field>
            </div>
            <Field label="Durum">
              <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadgeCls(ticket.status)}`}>
                {ticket.status || '—'}
              </span>
            </Field>
          </div>

          <form onSubmit={sendReply} className="space-y-3">
            <label className="text-sm font-medium text-neutral-700">Cevap Yaz</label>
            <textarea
              rows={8}
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Restorana gidecek cevabı yazın…"
              className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-sky-200"
            />
            {err && <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{err}</div>}
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                className="rounded-xl bg-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-300"
                onClick={onClose}
              >
                Kapat
              </button>
              <button
                type="submit"
                disabled={saving || !reply.trim()}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700 disabled:opacity-60"
              >
                {saving ? 'Gönderiliyor…' : 'Cevabı Gönder'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1 text-xs font-medium uppercase tracking-wide text-neutral-500">{label}</div>
      <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-900">
        {children || '—'}
      </div>
    </div>
  );
}

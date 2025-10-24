'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { X } from 'lucide-react';
import { getAuthToken } from '@/utils/auth';

/* ================= helpers ================= */
type SortKey = 'name' | 'price' | 'duration' | 'updatedAt';

function fmtTRY(n: number) {
  try {
    return n.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 });
  } catch {
    return String(n);
  }
}
function fmtDate(iso?: string | null) {
  if (!iso) return '-';
  const d = new Date(iso);
  try { return d.toLocaleString('tr-TR'); } catch { return d.toISOString(); }
}
function cls(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(' ');
}
async function readJson<T = any>(res: Response): Promise<T> {
  const t = await res.text();
  try { return t ? JSON.parse(t) : (null as any); } catch { return (t as any); }
}
const pickMsg = (d: any, fb: string) =>
  d?.error?.message || d?.message || d?.detail || d?.title || fb;

/* ================= API types ================= */
export type CourierPackage = {
  id: string; // UUID
  package_name: string;
  description?: string | null;
  price: number; // TRY
  duration_days: number;
  updated_at?: string | null;
  created_at?: string | null;
};

/* ================= page ================= */
export default function CourierPackagesPage() {
  const { role } = useParams<{ role: string }>();

  // token sadece client'ta
  const [token, setToken] = React.useState<string | null>(null);
  React.useEffect(() => { setToken(getAuthToken()); }, []);

  const authHeaders = React.useMemo<HeadersInit>(() => {
    const h: HeadersInit = { Accept: 'application/json' };
    if (token) (h as any).Authorization = `Bearer ${token}`;
    return h;
  }, [token]);

  const [rows, setRows] = React.useState<CourierPackage[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [q, setQ] = React.useState('');
  const [sort, setSort] = React.useState<SortKey>('updatedAt');
  const [asc, setAsc] = React.useState(false);
  const [info, setInfo] = React.useState<string | null>(null);

  const [creatingOpen, setCreatingOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<CourierPackage | null>(null);

  /* ------------ list ------------ */
  const loadList = React.useCallback(async () => {
    setLoading(true); setError(null);
    try {
      // Proxy: /yuksi/packages (rewrites to /api/packages)
      const res = await fetch('/yuksi/packages', { cache: 'no-store', headers: authHeaders });
      const j: any = await readJson(res);
      if (!res.ok || (j && j.success === false)) throw new Error(pickMsg(j, `HTTP ${res.status}`));

      // BACKEND (örnek) -> { success, message, data: [{ packageid, packagename, durationdays, price, description }] }
      const raw: any[] = Array.isArray(j?.data) ? j.data : Array.isArray(j) ? j : [];
      const list: CourierPackage[] = raw.map((x) => ({
        id: String(x?.id ?? x?.packageid ?? x?.package_id ?? ''),
        package_name: String(x?.package_name ?? x?.packagename ?? x?.name ?? ''),
        description: x?.description ?? null,
        price: Number(x?.price ?? 0),
        duration_days: Number(x?.duration_days ?? x?.durationdays ?? 0),
        created_at: x?.created_at ?? null,
      })).filter(p => p.id && p.package_name);

      setRows(list);
    } catch (e: any) {
      setError(e?.message || 'Liste alınamadı.');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [authHeaders]);

  React.useEffect(() => { if (token) loadList(); }, [token, loadList]);

  /* ------------ derived ------------ */
  const filtered = React.useMemo(() => {
    const qq = q.trim().toLowerCase();
    let arr = !qq
      ? rows
      : rows.filter(r => [r.package_name, r.description || '', r.id].join(' ').toLowerCase().includes(qq));

    arr = [...arr].sort((a, b) => {
      const dir = asc ? 1 : -1;
      if (sort === 'name') return a.package_name.localeCompare(b.package_name, 'tr') * dir;
      if (sort === 'price') return (a.price - b.price) * dir;
      if (sort === 'duration') return (a.duration_days - b.duration_days) * dir;
      if (sort === 'updatedAt') {
        const ta = a.updated_at ? new Date(a.updated_at).getTime() : (a.created_at ? new Date(a.created_at).getTime() : 0);
        const tb = b.updated_at ? new Date(b.updated_at).getTime() : (b.created_at ? new Date(b.created_at).getTime() : 0);
        return (ta - tb) * dir;
      }
      return 0;
    });

    return arr;
  }, [rows, q, sort, asc]);

  function toast(s: string) { setInfo(s); setTimeout(() => setInfo(null), 2500); }

  /* ------------ CRUD helpers ------------ */
  // POST /api/packages
  async function createPackage(p: { package_name: string; description?: string | null; price: number; duration_days: number; }) {
    const body = {
      package_name: p.package_name,
      description: p.description ?? null,
      price: p.price,
      duration_days: p.duration_days,
    };
    const res = await fetch('/yuksi/packages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify(body),
    });
    const j = await readJson(res);
    if (!res.ok || (j && (j as any).success === false)) throw new Error(pickMsg(j, `HTTP ${res.status}`));
  }

  // PUT /api/packages/{package_id}
  async function updatePackage(id: string, p: { package_name: string; description?: string | null; price: number; duration_days: number; }) {
    const body = { package_name: p.package_name, description: p.description ?? null, price: p.price, duration_days: p.duration_days };
    const res = await fetch(`/yuksi/packages/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify(body),
    });
    const j = await readJson(res);
    if (!res.ok || (j && (j as any).success === false)) throw new Error(pickMsg(j, `HTTP ${res.status}`));
  }

  // DELETE /api/packages/{package_id}
  async function deletePackage(id: string) {
    const res = await fetch(`/yuksi/packages/${encodeURIComponent(id)}`, { method: 'DELETE', headers: authHeaders });
    const j = await readJson(res);
    if (!res.ok || (j && (j as any).success === false)) throw new Error(pickMsg(j, `HTTP ${res.status}`));
  }

  return (
    <div className="space-y-6">
      {/* Top actions */}
      <section className="rounded-2xl border border-neutral-200/70 bg-white shadow-sm">
        <div className="grid gap-3 p-4 md:grid-cols-[minmax(280px,1fr)_auto]">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Ara: paket adı/ID, açıklama…"
            className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 text-neutral-800 outline-none ring-2 ring-transparent transition placeholder:text-neutral-400 focus:bg-white focus:ring-sky-200"
          />
          <div className="flex items-center justify-end">
            <button onClick={() => setCreatingOpen(true)} className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
              Yeni Paket
            </button>
          </div>
        </div>
      </section>

      {/* Table */}
      <section className="rounded-2xl border border-neutral-200/70 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full border-t border-neutral-200/70">
            <thead>
              <tr className="text-left text-sm text-neutral-500">
                <Th label="Paket" active={sort === 'name'} onClick={() => { setSort('name'); setAsc(s => sort === 'name' ? !s : true); }} />
                <Th label="Fiyat" active={sort === 'price'} onClick={() => { setSort('price'); setAsc(s => sort === 'price' ? !s : true); }} />
                <Th label="Süre (gün)" active={sort === 'duration'} onClick={() => { setSort('duration'); setAsc(s => sort === 'duration' ? !s : true); }} />
                <th className="px-4 py-3 font-medium">Açıklama</th>
                <th className="px-4 py-3 font-medium w-[160px]"></th>
              </tr>
            </thead>
            <tbody>
              {loading && (<tr><td colSpan={6} className="px-6 py-10 text-center text-sm text-neutral-500">Yükleniyor…</td></tr>)}

              {!loading && filtered.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-sm text-neutral-500">Kayıt bulunamadı.</td></tr>
              )}

              {!loading && filtered.map(r => (
                <tr key={r.id} className="border-t border-neutral-200/70 align-top hover:bg-neutral-50">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-neutral-900">{r.package_name || '(Adsız paket)'}</div>
                    <div className="font-mono text-[12px] text-neutral-500">{r.id}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
                      {fmtTRY(r.price)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">{r.duration_days}</td>
                  <td className="px-4 py-3 text-sm max-w-[360px] truncate" title={r.description || ''}>
                    {r.description || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => setEditing(r)} className="rounded-lg bg-sky-500 px-3 py-1.5 text-sm font-semibold text-white shadow hover:bg-sky-600">
                        Düzenle
                      </button>
                      <button
                        onClick={async () => {
                          if (!confirm('Bu paket silinsin mi?')) return;
                          try { await deletePackage(r.id); await loadList(); toast('Paket silindi.'); }
                          catch (e: any) { alert(e?.message || 'Silme işlemi başarısız.'); }
                        }}
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

        {error && <div className="px-6 py-3 text-sm text-rose-600">{error}</div>}
      </section>

      {/* toast */}
      {info && (
        <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm shadow-lg">
          {info}
        </div>
      )}

      {/* Create modal */}
      {creatingOpen && (
        <EditModal
          mode="create"
          title="Yeni Paket"
          initial={{ id: '', package_name: '', description: '', price: 1500, duration_days: 7 }}
          onClose={() => setCreatingOpen(false)}
          onSubmit={async (payload) => {
            try { await createPackage(payload); setCreatingOpen(false); await loadList(); toast('Paket oluşturuldu.'); }
            catch (e: any) { alert(e?.message || 'Oluşturma başarısız.'); }
          }}
        />
      )}

      {/* Edit modal */}
      {editing && (
        <EditModal
          mode="edit"
          title="Paketi Düzenle"
          initial={editing}
          onClose={() => setEditing(null)}
          onSubmit={async (payload) => {
            try { await updatePackage(editing.id, payload); setEditing(null); await loadList(); toast('Paket güncellendi.'); }
            catch (e: any) { alert(e?.message || 'Güncelleme başarısız.'); }
          }}
        />
      )}
    </div>
  );
}

function Th({ label, active, onClick }: { label: string; active?: boolean; onClick: () => void }) {
  return (
    <th className="px-4 py-3 font-medium">
      <button className={cls('inline-flex items-center gap-1', active && 'text-neutral-900')} onClick={onClick}>
        {label}
        <svg width="10" height="10" viewBox="0 0 24 24" className="opacity-60"><path fill="currentColor" d="M7 10l5-5 5 5zM7 14l5 5 5-5z" /></svg>
      </button>
    </th>
  );
}

/* =============== Edit/Create Modal =============== */
function EditModal({
  title,
  initial,
  mode,
  onClose,
  onSubmit,
}: {
  title: string;
  initial: CourierPackage;
  mode: 'create' | 'edit';
  onClose: () => void;
  onSubmit: (payload: {
    package_name: string;
    description?: string | null;
    price: number;
    duration_days: number;
  }) => Promise<void>;
}) {
  const [name, setName] = React.useState<string>(initial.package_name || '');
  const [desc, setDesc] = React.useState<string>(initial.description ?? '');
  const [price, setPrice] = React.useState<number>(initial.price || 1500);
  const [days, setDays] = React.useState<number>(initial.duration_days || 7);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { alert('Paket adı zorunludur.'); return; }
    if (Number(days) <= 0) { alert('Süre (gün) 1 veya daha büyük olmalıdır.'); return; }
    await onSubmit({
      package_name: name.trim(),
      description: (desc || '').trim() || null,
      price: Math.max(0, Math.round(Number(price || 0))),
      duration_days: Math.max(1, Math.round(Number(days || 1))),
    });
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button className="rounded-full p-2 hover:bg-neutral-100" onClick={onClose} aria-label="Kapat">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4 p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-neutral-700">Paket Adı</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-sky-200"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">Fiyat (TRY)</label>
              <input
                type="number"
                min={0}
                value={price}
                onChange={(e) => setPrice(Math.max(0, Number(e.target.value || 0)))}
                className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-sky-200"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">Süre (gün)</label>
              <input
                type="number"
                min={1}
                value={days}
                onChange={(e) => setDays(Math.max(1, Number(e.target.value || 1)))}
                className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-sky-200"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-neutral-700">Açıklama</label>
              <input
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-sky-200"
              />
            </div>
          </div>

          <div className="mt-2 flex items-center justify-end gap-3">
            <button type="button" onClick={onClose} className="rounded-xl bg-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-300">
              İptal
            </button>
            <button type="submit" className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700">
              Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

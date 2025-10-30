// src/app/dashboards/[role]/admin/companies/company-list/page.tsx
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getAuthToken } from '@/utils/auth';

/* ---------- API tipleri ---------- */
type ApiCompany = {
  id: string;
  companyTrackingNo: string;
  companyName: string;
  companyPhone: string;
  stateId: number;        // IL (state)
  cityId: number;         // ILÇE (city)
  location?: string;
  description?: string;
  isVisible?: boolean;
  canReceivePayments?: boolean;
  specialCommissionRate: number;
  assignedKilometers: number;
  consumedKilometers?: number;
  remainingKilometers?: number;
  status?: string;
};

type ListResp =
  | { success: true; data: ApiCompany[] }
  | { success?: false; message?: string; error?: { message?: string } }
  | ApiCompany[];

/* === helpers === */
async function readJson<T = any>(res: Response): Promise<T> {
  const t = await res.text();
  try { return t ? JSON.parse(t) : (null as any); } catch { return (t as any); }
}
const pickMsg = (d: any, fb: string) =>
  d?.error?.message || d?.message || d?.detail || d?.title || fb;
function bearerHeaders(token?: string | null): HeadersInit {
  const h: HeadersInit = { Accept: 'application/json' };
  if (token) (h as any).Authorization = `Bearer ${token}`;
  return h;
}

const PAGE_SIZE = 10;

export default function CompanyListPage() {
  const { role } = useParams<{ role: string }>();

  /* auth */
  const token = React.useMemo(getAuthToken, []);
  const headers = React.useMemo<HeadersInit>(() => bearerHeaders(token), [token]);

  /* state */
  const [rows, setRows] = React.useState<ApiCompany[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [query, setQuery] = React.useState('');
  const [statusQ, setStatusQ] = React.useState('');
  const [page, setPage] = React.useState(1);

  /* IL/ILÇE ad haritaları */
  const [stateMap, setStateMap] = React.useState<Record<number, string>>({});
  const [cityMapByState, setCityMapByState] = React.useState<Record<number, Record<number, string>>>({});
  const nameOfState = (sid?: number) => (sid && stateMap[sid]) || (sid ?? '—');
  const nameOfCity  = (sid?: number, cid?: number) =>
    (sid && cid && cityMapByState[sid]?.[cid]) || (cid ?? '—');

  /* iller */
  React.useEffect(() => {
    (async () => {
      try {
        const url = new URL('/yuksi/geo/states', location.origin);
        url.searchParams.set('country_id', '225');
        url.searchParams.set('limit', '500');
        url.searchParams.set('offset', '0');
        const res = await fetch(url.toString(), { headers, cache: 'no-store' });
        const j = await readJson(res);
        if (!res.ok) throw new Error(pickMsg(j, `HTTP ${res.status}`));
        const list: any[] = Array.isArray(j) ? j : Array.isArray(j?.data) ? j.data : [];
        const map: Record<number, string> = {};
        list.forEach((s) => { if (s?.id && s?.name) map[Number(s.id)] = String(s.name); });
        setStateMap(map);
      } catch { /* sessiz */ }
    })();
  }, [headers]);

  /* liste */
  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url = new URL('/yuksi/admin/companies', location.origin);
      url.searchParams.set('limit', String(200)); // server’dan bol çek, client’ta sayfalayalım
      url.searchParams.set('offset', '0');
      if (statusQ) url.searchParams.set('status', statusQ);
      const res = await fetch(url.toString(), { headers, cache: 'no-store' });
      const j: ListResp = await readJson(res);
      if (!res.ok || (j as any)?.success === false) throw new Error(pickMsg(j, `HTTP ${res.status}`));
      const data: ApiCompany[] = Array.isArray(j) ? j as ApiCompany[] : Array.isArray((j as any).data) ? (j as any).data : [];
      // remaining yoksa hesapla
      const norm = data.map(d => ({
        ...d,
        remainingKilometers: typeof d.remainingKilometers === 'number'
          ? d.remainingKilometers
          : Math.max(0, (Number(d.assignedKilometers)||0) - (Number(d.consumedKilometers)||0)),
      }));
      setRows(norm);
      setPage(1);
    } catch (e: any) {
      setError(e?.message || 'Şirket listesi alınamadı.');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [headers, statusQ]);

  React.useEffect(() => { load(); }, [load]);

  /* GÖRÜNEN İLLERİN İLÇELERİNİ CACHELE — FIX: stateId kullan */
  React.useEffect(() => {
    const neededStateIds = Array.from(new Set(rows.map(r => Number(r.stateId)).filter(Number.isFinite)));
    const missing = neededStateIds.filter((sid) => !cityMapByState[sid]);
    if (missing.length === 0) return;
    (async () => {
      try {
        const bag: Record<number, Record<number, string>> = {};
        for (const sid of missing) {
          const url = new URL('/yuksi/geo/cities', location.origin);
          url.searchParams.set('state_id', String(sid)); // doğru: state_id = IL
          url.searchParams.set('limit', '1000');
          url.searchParams.set('offset', '0');
          const res = await fetch(url.toString(), { headers, cache: 'no-store' });
          const j = await readJson(res);
          if (!res.ok) throw new Error(pickMsg(j, `HTTP ${res.status}`));
          const list: any[] = Array.isArray(j) ? j : Array.isArray(j?.data) ? j.data : [];
          const cmap: Record<number, string> = {};
          list.forEach((c) => { if (c?.id && c?.name) cmap[Number(c.id)] = String(c.name); });
          bag[sid] = cmap;
        }
        setCityMapByState(prev => ({ ...prev, ...bag }));
      } catch { /* sessiz */ }
    })();
  }, [rows, headers, cityMapByState]);

  /* arama + client-side sayfalama */
  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      [r.companyName, r.companyPhone, r.companyTrackingNo].filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)),
    );
  }, [rows, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = React.useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  /* PATCH / DELETE */
  const [editing, setEditing] = React.useState<ApiCompany | null>(null);
  const [busyId, setBusyId] = React.useState<string | null>(null);

  async function onDelete(id: string) {
    if (!confirm('Şirketi silmek istiyor musunuz?')) return;
    setBusyId(id);
    try {
      const res = await fetch(`/yuksi/admin/companies/${id}`, { method: 'DELETE', headers });
      const j = await readJson(res);
      if (!res.ok) throw new Error(pickMsg(j, `HTTP ${res.status}`));
      await load();
    } catch (e: any) {
      alert(e?.message || 'Silme işlemi başarısız.');
    } finally {
      setBusyId(null);
    }
  }

  async function onUpdateSubmit(id: string, body: Partial<ApiCompany>) {
    setBusyId(id);
    try {
      // zorunlu alanları mevcut satırdan tamamla
      const cur = rows.find(r => r.id === id);
      if (!cur) throw new Error('Kayıt bulunamadı.');
      const payload: any = {
        companyTrackingNo: body.companyTrackingNo ?? cur.companyTrackingNo ?? '',
        assignedKilometers: body.assignedKilometers ?? cur.assignedKilometers ?? 0,
        consumedKilometers: body.consumedKilometers ?? cur.consumedKilometers ?? 0,
        specialCommissionRate: body.specialCommissionRate ?? cur.specialCommissionRate ?? 0,
        isVisible: body.isVisible ?? (cur.isVisible ?? true),
        canReceivePayments: body.canReceivePayments ?? (cur.canReceivePayments ?? true),
        stateId: body.stateId ?? cur.stateId,
        cityId: body.cityId ?? cur.cityId,
        location: body.location ?? cur.location ?? '',
        companyName: body.companyName ?? cur.companyName ?? '',
        companyPhone: body.companyPhone ?? cur.companyPhone ?? '',
        description: body.description ?? cur.description ?? '',
        status: (body.status ?? cur.status ?? 'active') as string,
      };

      const res = await fetch(`/yuksi/admin/companies/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify(payload),
      });
      const j = await readJson(res);
      if (!res.ok) {
        const errs = Array.isArray((j as any)?.errors)
          ? (j as any).errors.map((e: any) => `${e?.loc?.join('.')} → ${e?.msg}`).join('\n')
          : pickMsg(j, `HTTP ${res.status}`);
        throw new Error(errs);
      }
      setEditing(null);
      await load();
    } catch (e: any) {
      alert(e?.message || 'Güncelleme başarısız.');
    } finally {
      setBusyId(null);
    }
  }

  const createHref = `/dashboards/${role}/admin/companies/create-company`;

  return (
    <div className="space-y-6">
      {/* başlık ve aksiyonlar */}
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Şirket Listesi</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="rounded-xl bg-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-300"
          >
            Yenile
          </button>
          <Link
            href={createHref}
            className="rounded-xl bg-orange-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-orange-700"
          >
            Yeni Şirket
          </Link>
        </div>
      </div>

      {/* filtre kartı (restoran sayfası stili) */}
      <section className="rounded-2xl border border-neutral-200/70 bg-white shadow-sm">
        <div className="p-6">
          <div className="grid gap-3 sm:grid-cols-[1fr_200px] items-end">
            <div className="space-y-2">
              <input
                value={query}
                onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                placeholder="Ad, telefon, takip no…"
                className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 text-neutral-800 outline-none ring-2 ring-transparent transition placeholder:text-neutral-400 focus:bg-white focus:ring-sky-200"
              />
              <p className="text-sm text-neutral-500">
                Toplam {filtered.length} kayıt • Bu sayfada {pageRows.length} kayıt
                {query ? ` (filtre: “${query}”)` : ''}
              </p>
            </div>
            <div className="flex gap-2">
              <select
                value={statusQ}
                onChange={(e) => { setStatusQ(e.target.value); }}
                className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 text-neutral-800 outline-none ring-2 ring-transparent transition focus:bg-white focus:ring-sky-200"
              >
                <option value="">Durum: Tümü</option>
                <option value="active">Aktif</option>
                <option value="inactive">Pasif</option>
              </select>
              <button
                onClick={load}
                className="rounded-xl bg-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-300"
              >
                Uygula
              </button>
            </div>
          </div>
        </div>

        {/* tablo */}
        <div className="overflow-x-auto">
          <table className="min-w-full border-t border-neutral-200/70">
            <thead>
              <tr className="text-left text-sm text-neutral-500">
                <th className="px-6 py-3 font-medium">Şirket</th>
                <th className="px-6 py-3 font-medium">Telefon</th>
                <th className="px-6 py-3 font-medium">İl</th>
                <th className="px-6 py-3 font-medium">İlçe</th>
                <th className="px-6 py-3 font-medium">Komisyon (%)</th>
                <th className="px-6 py-3 font-medium">KM (Atanan/Kalan)</th>
                <th className="px-6 py-3 font-medium">Durum</th>
                <th className="px-6 py-3 font-medium w-[180px]"></th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={8} className="px-6 py-8 text-center text-neutral-500">Yükleniyor…</td></tr>
              )}

              {!loading && error && (
                <tr>
                  <td colSpan={8} className="px-6 py-8 whitespace-pre-wrap text-center text-rose-600">
                    {error}
                  </td>
                </tr>
              )}

              {!loading && !error && pageRows.map((c) => {
                const active = (c.status || '').toLowerCase() === 'active';
                return (
                  <tr key={c.id} className="border-t border-neutral-200/70 align-top hover:bg-neutral-50">
                    <td className="px-3 py-4">
                      <div className="font-semibold text-neutral-900 truncate">{c.companyName || '-'}</div>
                      <div className="text-xs text-neutral-500 truncate">#{c.companyTrackingNo}</div>
                    </td>
                    <td className="px-3 py-4"><div className="text-neutral-900">{c.companyPhone || '-'}</div></td>
                    <td className="px-3 py-4"><div className="text-neutral-900">{nameOfState(c.stateId)}</div></td>
                    <td className="px-3 py-4"><div className="text-neutral-900">{nameOfCity(c.stateId, c.cityId)}</div></td>
                    <td className="px-3 py-4"><div className="text-neutral-900">{Number(c.specialCommissionRate ?? 0)}</div></td>
                    <td className="px-3 py-4">
                      <div className="text-neutral-900">
                        {Number(c.assignedKilometers ?? 0).toLocaleString('tr-TR')} / {Number(c.remainingKilometers ?? 0).toLocaleString('tr-TR')}
                      </div>
                    </td>
                    <td className="px-3 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                        active ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                               : 'bg-neutral-100 text-neutral-700 ring-1 ring-neutral-300'
                      }`}>
                        {c.status || '—'}
                      </span>
                    </td>
                    <td className="px-3 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditing(c)}
                          className="rounded-lg bg-amber-500 px-3 py-1.5 text-sm font-semibold text-white shadow hover:bg-amber-600"
                        >
                          Düzenle
                        </button>
                        <button
                          onClick={() => onDelete(c.id)}
                          disabled={busyId === c.id}
                          className="rounded-lg bg-rose-500 px-3 py-1.5 text-sm font-semibold text-white shadow hover:bg-rose-600 disabled:opacity-60"
                        >
                          {busyId === c.id ? 'Siliniyor…' : 'Sil'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {!loading && !error && pageRows.length === 0 && (
                <tr><td colSpan={8} className="px-6 py-12 text-center text-sm text-neutral-500">Kayıt bulunamadı.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Client-side sayfalama */}
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

      {editing && (
        <EditCompanyModal
          row={editing}
          onClose={() => setEditing(null)}
          onSubmit={(payload) => onUpdateSubmit(editing.id, payload)}
        />
      )}
    </div>
  );
}

/* === Düzenleme Modalı — tüm alanlar PATCH ile gönderilebilir === */
function EditCompanyModal({
  row,
  onClose,
  onSubmit,
}: {
  row: ApiCompany;
  onClose: () => void;
  onSubmit: (payload: Partial<ApiCompany>) => void;
}) {
  const [form, setForm] = React.useState<Partial<ApiCompany>>({
    ...row,
    isVisible: row.isVisible ?? true,
    canReceivePayments: row.canReceivePayments ?? true,
    status: row.status ?? 'active',
    location: row.location ?? '',
    description: row.description ?? '',
    consumedKilometers: row.consumedKilometers ?? Math.max(0, (row.assignedKilometers || 0) - (row.remainingKilometers || 0)),
  });

  const set = (k: keyof ApiCompany, v: any) => setForm((p) => ({ ...p, [k]: v }));

  function save(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(form);
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h3 className="text-lg font-semibold">Şirketi Düzenle</h3>
          <button className="rounded-full p-2 hover:bg-neutral-100" onClick={onClose} aria-label="Kapat">✕</button>
        </div>

        <form onSubmit={save} className="space-y-4 p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* text fields */}
            {([
              ['companyTrackingNo','Takip No'],
              ['companyName','Şirket Adı'],
              ['companyPhone','Telefon'],
              ['location','Konum'],
              ['description','Açıklama'],
            ] as const).map(([key,label]) => (
              <div key={key}>
                <div className="mb-1 text-sm font-medium text-neutral-700">{label}</div>
                <input
                  value={(form as any)[key] ?? ''}
                  onChange={(e) => set(key, e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-sky-200"
                />
              </div>
            ))}

            {/* numeric fields */}
            <FieldNumber label="İl ID" value={form.stateId ?? 0} onChange={(v) => set('stateId', v)} />
            <FieldNumber label="İlçe ID" value={form.cityId ?? 0} onChange={(v) => set('cityId', v)} />
            <FieldNumber label="Atanan KM" value={form.assignedKilometers ?? 0} onChange={(v) => set('assignedKilometers', v)} />
            <FieldNumber label="Tüketilen KM" value={form.consumedKilometers ?? 0} onChange={(v) => set('consumedKilometers', v)} />
            <FieldNumber label="Komisyon (%)" step="0.01" value={form.specialCommissionRate ?? 0} onChange={(v) => set('specialCommissionRate', v)} />

            {/* selects / checkboxes */}
            <div>
              <div className="mb-1 text-sm font-medium text-neutral-700">Durum</div>
              <select
                value={form.status ?? 'active'}
                onChange={(e) => set('status', e.target.value)}
                className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-sky-200"
              >
                <option value="active">Aktif</option>
                <option value="inactive">Pasif</option>
              </select>
            </div>
            <div className="flex items-center gap-2 pt-7">
              <input
                id="isVisible"
                type="checkbox"
                checked={!!form.isVisible}
                onChange={(e) => set('isVisible', e.target.checked)}
              />
              <label htmlFor="isVisible" className="text-sm">Görünür</label>
            </div>
            <div className="flex items-center gap-2 pt-7">
              <input
                id="canReceivePayments"
                type="checkbox"
                checked={!!form.canReceivePayments}
                onChange={(e) => set('canReceivePayments', e.target.checked)}
              />
              <label htmlFor="canReceivePayments" className="text-sm">Ödeme Alabilir</label>
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

function FieldNumber({
  label, value, onChange, step,
}: { label: string; value: number; onChange: (v: number) => void; step?: string }) {
  return (
    <div>
      <div className="mb-1 text-sm font-medium text-neutral-700">{label}</div>
      <input
        type="number"
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-sky-200"
      />
    </div>
  );
}

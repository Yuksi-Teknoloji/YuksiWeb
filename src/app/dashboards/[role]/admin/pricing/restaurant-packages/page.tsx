// src/app/dashboards/[role]/admin/pricing/restaurant-packages/page.tsx
'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';

/* ================= helpers ================= */
type Currency = 'TRY';
type SortKey = 'name' | 'unitPrice' | 'updatedAt';

function fmtTRY(n: number) {
  return n.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 });
}
function fmtDate(iso?: string | null) {
  if (!iso) return '-';
  const d = new Date(iso);
  return d.toLocaleString('tr-TR');
}
function cls(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(' ');
}
function getAuthToken(): string | null {
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

/* ================= types ================= */
type RestaurantRow = {
  id: string;                         // restaurant UUID
  name: string;
  email?: string | null;
  contact?: string | null;

  // negotiated pricing:
  unitPriceTRY: number;               // agreed unit price PER PACKAGE (TRY)
  currency: Currency;                 // TRY
  minPackages?: number | null;
  maxPackages?: number | null;

  note?: string | null;
  updatedAt?: string | null;          // ISO
};

/* ================= demo datasource =================
   Gerçekte:
   - GET   /api/Admin/Pricing/list
   - PATCH /api/Admin/Pricing/{restaurant_id}
   - POST  /api/Admin/Pricing/bulk_set_default
   - vs.
   Aşağıda localStorage üzerinde bir koleksiyon simülasyonu var.
=====================================================*/
const LS_KEY = 'demo_restaurant_pricing_v1';

function seedDemo(): RestaurantRow[] {
  return [
    { id: crypto.randomUUID(), name: 'Berkay Kebap', email: 'berkay@kebap.com', contact: '0532 000 00 00', unitPriceTRY: 80, currency: 'TRY', minPackages: 10, note: 'Açılış promosyonu', updatedAt: new Date().toISOString() },
    { id: crypto.randomUUID(), name: 'Yemekhanem', email: 'info@yemekhanem.com', unitPriceTRY: 90, currency: 'TRY', minPackages: 10, updatedAt: new Date().toISOString() },
    { id: crypto.randomUUID(), name: 'Pideci Usta', email: 'info@pideci.com', unitPriceTRY: 85, currency: 'TRY', minPackages: 20, note: '', updatedAt: new Date().toISOString() },
    { id: crypto.randomUUID(), name: 'Sushi Park', email: 'hello@sushipark.com', unitPriceTRY: 110, currency: 'TRY', minPackages: 10, updatedAt: new Date().toISOString() },
  ];
}

function loadLS(): RestaurantRow[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) {
      const s = seedDemo();
      localStorage.setItem(LS_KEY, JSON.stringify(s));
      return s;
    }
    const arr = JSON.parse(raw) as RestaurantRow[];
    return Array.isArray(arr) ? arr : seedDemo();
  } catch {
    const s = seedDemo();
    try { localStorage.setItem(LS_KEY, JSON.stringify(s)); } catch {}
    return s;
  }
}
function saveLS(rows: RestaurantRow[]) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(rows)); } catch {}
}

/* ================= page ================= */
export default function AdminRestaurantPackagePricingPage() {
  const { role } = useParams<{ role: string }>();
  const token = React.useMemo(() => getAuthToken(), []);
  // token'i gerçek çağrılarda headers.authorization için kullanacaksın.

  const [rows, setRows] = React.useState<RestaurantRow[]>([]);
  const [q, setQ] = React.useState('');
  const [sort, setSort] = React.useState<SortKey>('name');
  const [asc, setAsc] = React.useState(true);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [editing, setEditing] = React.useState<RestaurantRow | null>(null);
  const [bulkDefault, setBulkDefault] = React.useState<number>(80);
  const [info, setInfo] = React.useState<string | null>(null);

  React.useEffect(() => {
    setRows(loadLS());
  }, []);

  const filtered = React.useMemo(() => {
    const qq = q.trim().toLowerCase();
    let arr = !qq
      ? rows
      : rows.filter(r =>
          [r.name, r.email || '', r.contact || ''].join(' ').toLowerCase().includes(qq),
        );
    arr = [...arr].sort((a, b) => {
      const dir = asc ? 1 : -1;
      if (sort === 'name') return a.name.localeCompare(b.name) * dir;
      if (sort === 'unitPrice') return (a.unitPriceTRY - b.unitPriceTRY) * dir;
      if (sort === 'updatedAt') {
        const ta = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const tb = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        return (ta - tb) * dir;
      }
      return 0;
    });
    return arr;
  }, [rows, q, sort, asc]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = React.useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page, pageSize],
  );

  function onSaveEdit(next: RestaurantRow) {
    setRows(prev => {
      const updated = prev.map(r => (r.id === next.id ? next : r));
      saveLS(updated);
      return updated;
    });
    setEditing(null);
    toast('Fiyat güncellendi (DEMO).');
  }

  function applyBulkDefault() {
    setRows(prev => {
      const updated = prev.map(r => ({
        ...r,
        unitPriceTRY: bulkDefault,
        updatedAt: new Date().toISOString(),
      }));
      saveLS(updated);
      return updated;
    });
    toast(`Tüm restoranlara ${fmtTRY(bulkDefault)} birim fiyat atandı (DEMO).`);
  }

  function toast(s: string) {
    setInfo(s);
    setTimeout(() => setInfo(null), 2500);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Paket Fiyatları (Admin)</h1>
        <div className="text-sm text-neutral-500">Panel: {role} {token ? '• auth hazır' : ''}</div>
      </div>

      {/* Top actions */}
      <section className="rounded-2xl border border-neutral-200/70 bg-white shadow-sm">
        <div className="grid gap-3 p-4 md:grid-cols-3">
          <div className="md:col-span-2">
            <input
              value={q}
              onChange={(e) => { setQ(e.target.value); setPage(1); }}
              placeholder="Ara: restoran adı, e-posta, kişi…"
              className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 text-neutral-800 outline-none ring-2 ring-transparent transition placeholder:text-neutral-400 focus:bg-white focus:ring-sky-200"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-neutral-600">Sayfa Boyutu</label>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="rounded-lg border border-neutral-300 bg-neutral-100 px-3 py-2 text-sm"
            >
              {[10, 20, 50].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>

        {/* Bulk default */}
        <div className="flex flex-col gap-3 border-t p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-neutral-700">
            Tüm restoranlara varsayılan **birim paket fiyatı** ata (DEMO).
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              value={bulkDefault}
              onChange={(e) => setBulkDefault(Math.max(1, Number(e.target.value || 1)))}
              className="w-28 rounded-xl border border-neutral-300 bg-white px-3 py-2 text-right outline-none focus:ring-2 focus:ring-sky-200"
            />
            <span className="text-sm">TL / paket</span>
            <button
              onClick={applyBulkDefault}
              className="rounded-xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Uygula (Demo)
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
                <Th label="Restoran" active={sort==='name'} onClick={() => { setSort('name'); setAsc(s => sort==='name' ? !s : true); }} />
                <th className="px-4 py-3 font-medium">E-posta</th>
                <Th label="Birim Fiyat" active={sort==='unitPrice'} onClick={() => { setSort('unitPrice'); setAsc(s => sort==='unitPrice' ? !s : true); }} />
                <th className="px-4 py-3 font-medium">Min/Max</th>
                <Th label="Güncelleme" active={sort==='updatedAt'} onClick={() => { setSort('updatedAt'); setAsc(s => sort==='updatedAt' ? !s : true); }} />
                <th className="px-4 py-3 font-medium w-[120px]"></th>
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-neutral-500">
                    Kayıt bulunamadı.
                  </td>
                </tr>
              )}
              {pageRows.map(r => (
                <tr key={r.id} className="border-t border-neutral-200/70 align-top hover:bg-neutral-50">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-neutral-900">{r.name}</div>
                    {r.note ? <div className="mt-0.5 text-xs text-neutral-500">{r.note}</div> : null}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-neutral-800">{r.email || '-'}</div>
                    <div className="text-xs text-neutral-500">{r.contact || ''}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
                      {fmtTRY(r.unitPriceTRY)} / paket
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {(r.minPackages ?? '-') + ' / ' + (r.maxPackages ?? '-')}
                  </td>
                  <td className="px-4 py-3 text-sm">{fmtDate(r.updatedAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end">
                      <button
                        onClick={() => setEditing(r)}
                        className="rounded-lg bg-sky-500 px-3 py-1.5 text-sm font-semibold text-white shadow hover:bg-sky-600"
                      >
                        Düzenle
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* footer / pager */}
        <div className="flex items-center justify-between border-t p-4 text-sm text-neutral-600">
          <div>Toplam <span className="font-medium text-neutral-800">{filtered.length}</span> restoran • Sayfa {page}/{totalPages}</div>
          <div className="flex items-center gap-2">
            <button className="rounded-md border px-3 py-1.5 disabled:opacity-50" onClick={() => setPage(1)} disabled={page<=1}>« İlk</button>
            <button className="rounded-md border px-3 py-1.5 disabled:opacity-50" onClick={() => setPage(p=>Math.max(1,p-1))} disabled={page<=1}>‹ Önceki</button>
            <button className="rounded-md border px-3 py-1.5 disabled:opacity-50" onClick={() => setPage(p=>Math.min(totalPages,p+1))} disabled={page>=totalPages}>Sonraki ›</button>
            <button className="rounded-md border px-3 py-1.5 disabled:opacity-50" onClick={() => setPage(totalPages)} disabled={page>=totalPages}>Son »</button>
          </div>
        </div>
      </section>

      {/* toast */}
      {info && (
        <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm shadow-lg">
          {info}
        </div>
      )}

      {/* edit modal */}
      {editing && (
        <EditModal
          row={editing}
          onClose={() => setEditing(null)}
          onSave={(next) => onSaveEdit(next)}
        />
      )}
    </div>
  );
}

function Th({ label, active, onClick }: { label: string; active?: boolean; onClick: () => void }) {
  return (
    <th className="px-4 py-3 font-medium">
      <button
        className={cls('inline-flex items-center gap-1', active && 'text-neutral-900')}
        onClick={onClick}
      >
        {label}
        <svg width="10" height="10" viewBox="0 0 24 24" className="opacity-60"><path fill="currentColor" d="M7 10l5-5 5 5zM7 14l5 5 5-5z"/></svg>
      </button>
    </th>
  );
}

/* =============== Edit Modal =============== */
function EditModal({
  row,
  onClose,
  onSave,
}: {
  row: RestaurantRow;
  onClose: () => void;
  onSave: (next: RestaurantRow) => void;
}) {
  const [unitPrice, setUnitPrice] = React.useState<number>(row.unitPriceTRY);
  const [minP, setMinP] = React.useState<number | ''>(row.minPackages ?? '');
  const [maxP, setMaxP] = React.useState<number | ''>(row.maxPackages ?? '');
  const [note, setNote] = React.useState<string>(row.note ?? '');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: RestaurantRow = {
      ...row,
      unitPriceTRY: Math.max(1, Math.round(Number(unitPrice || 1))),
      minPackages: minP === '' ? null : Math.max(1, Number(minP)),
      maxPackages: maxP === '' ? null : Math.max(1, Number(maxP)),
      note: note.trim() || null,
      updatedAt: new Date().toISOString(),
    };
    onSave(next);

    /** Gerçek entegrasyon (örnek):
     *  const token = getAuthToken();
     *  await fetch(`/yuksi/api/Admin/Pricing/${row.id}`, {
     *    method: 'PATCH',
     *    headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
     *    body: JSON.stringify({ unit_price_try: next.unitPriceTRY, min_packages: next.minPackages, max_packages: next.maxPackages, note: next.note }),
     *  });
     */
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div>
            <h3 className="text-lg font-semibold">Fiyat Düzenle</h3>
            <div className="text-xs text-neutral-500">{row.name} • {row.email || '-'}</div>
          </div>
          <button className="rounded-full p-2 hover:bg-neutral-100" onClick={onClose} aria-label="Kapat">✕</button>
        </div>

        <form onSubmit={submit} className="space-y-4 p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">Birim Fiyat (TRY)</label>
              <input
                type="number"
                min={1}
                value={unitPrice}
                onChange={(e) => setUnitPrice(Math.max(1, Number(e.target.value || 1)))}
                className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-sky-200"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">Min Paket (opsiyonel)</label>
              <input
                type="number"
                min={1}
                value={minP}
                onChange={(e) => setMinP(e.target.value === '' ? '' : Math.max(1, Number(e.target.value)))}
                className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-sky-200"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">Max Paket (opsiyonel)</label>
              <input
                type="number"
                min={1}
                value={maxP}
                onChange={(e) => setMaxP(e.target.value === '' ? '' : Math.max(1, Number(e.target.value)))}
                className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-sky-200"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-neutral-700">Not (opsiyonel)</label>
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-sky-200"
              />
            </div>
          </div>

          <div className="mt-2 flex items-center justify-end gap-3">
            <button type="button" onClick={onClose} className="rounded-xl bg-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-300">
              İptal
            </button>
            <button type="submit" className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700">
              Kaydet (Demo)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

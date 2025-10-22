'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { X } from 'lucide-react';
import { getAuthToken } from '@/utils/auth';

/* ================= helpers ================= */
type SortKey = 'restaurant' | 'unitPrice' | 'updatedAt';

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
async function readJson<T = any>(res: Response): Promise<T> {
  const t = await res.text();
  try { return t ? JSON.parse(t) : (null as any); } catch { return (t as any); }
}
const pickMsg = (d: any, fb: string) =>
  d?.error?.message || d?.message || d?.detail || d?.title || fb;

/* ================= API types ================= */
type PackagePriceRow = {
  id: number;
  restaurant_id: string;     // uuid
  unit_price: number;        // TRY
  min_package?: number | null;
  max_package?: number | null;
  note?: string | null;
  updated_at?: string | null; // ISO
};

type ListResponse = {
  success?: boolean;
  message?: string;
  data?: PackagePriceRow[];
};

type RestaurantListItem = {
  id: string;
  name?: string | null;
  email?: string | null;
  contactPerson?: string | null;
};

/* ================= page ================= */
export default function AdminRestaurantPackagePricingPage() {
  const { role } = useParams<{ role: string }>();

  // token sadece client'ta
  const [token, setToken] = React.useState<string | null>(null);
  React.useEffect(() => {
    setToken(getAuthToken());
  }, []);

  const authHeaders = React.useMemo<HeadersInit>(() => {
    const h: HeadersInit = { Accept: 'application/json' };
    if (token) (h as any).Authorization = `Bearer ${token}`;
    return h;
  }, [token]);

  const [rows, setRows] = React.useState<PackagePriceRow[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // 🔽 restoran isim haritası
  const [restaurantMap, setRestaurantMap] = React.useState<Record<string, string>>({});
  const [rLoading, setRLoading] = React.useState(false);
  const [rError, setRError] = React.useState<string | null>(null);

  const [q, setQ] = React.useState('');
  const [sort, setSort] = React.useState<SortKey>('updatedAt');
  const [asc, setAsc] = React.useState(false);

  const [info, setInfo] = React.useState<string | null>(null);

  const [creatingOpen, setCreatingOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<PackagePriceRow | null>(null);

  /* ------------ restoran listesi (id->isim) ------------ */
  const loadRestaurants = React.useCallback(async () => {
    setRLoading(true); setRError(null);
    try {
      const res = await fetch('/yuksi/Restaurant/list', { headers: authHeaders, cache: 'no-store' });
      const data = await readJson<any>(res);
      if (!res.ok) throw new Error(pickMsg(data, `HTTP ${res.status}`));
      const arr: any[] = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
      const map: Record<string, string> = {};
      for (const x of arr) {
        const id = String(x?.id || '');
        if (!id) continue;
        const name = String(x?.name ?? '').trim() || '(İsimsiz restoran)';
        map[id] = name;
      }
      setRestaurantMap(map);
    } catch (e: any) {
      setRError(e?.message || 'Restoran listesi alınamadı.');
      setRestaurantMap({});
    } finally {
      setRLoading(false);
    }
  }, [authHeaders]);

  /* ------------ fiyat listesi ------------ */
  const loadList = React.useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch('/yuksi/PackagePrice/list', { cache: 'no-store', headers: authHeaders });
      const j = await readJson<ListResponse>(res);
      if (!res.ok || (j && (j as any).success === false)) throw new Error(pickMsg(j, `HTTP ${res.status}`));
      const list = Array.isArray(j?.data) ? j!.data! : Array.isArray(j) ? (j as any as PackagePriceRow[]) : [];
      setRows(list);
    } catch (e: any) {
      setError(e?.message || 'Liste alınamadı.');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [authHeaders]);

  React.useEffect(() => {
    if (!token) return;
    // iki çağrıyı paralel başlat
    loadRestaurants();
    loadList();
  }, [token, loadList, loadRestaurants]);

  /* ------------ derived ------------ */
  const filtered = React.useMemo(() => {
    const qq = q.trim().toLowerCase();
    let arr = !qq
      ? rows
      : rows.filter(r => {
          const name = restaurantMap[r.restaurant_id] || '';
          return [r.restaurant_id, name, r.note || ''].join(' ').toLowerCase().includes(qq);
        });

    arr = [...arr].sort((a, b) => {
      const dir = asc ? 1 : -1;
      if (sort === 'restaurant') {
        const an = restaurantMap[a.restaurant_id] || a.restaurant_id;
        const bn = restaurantMap[b.restaurant_id] || b.restaurant_id;
        return an.localeCompare(bn, 'tr') * dir;
      }
      if (sort === 'unitPrice') return (a.unit_price - b.unit_price) * dir;
      if (sort === 'updatedAt') {
        const ta = a.updated_at ? new Date(a.updated_at).getTime() : 0;
        const tb = b.updated_at ? new Date(b.updated_at).getTime() : 0;
        return (ta - tb) * dir;
      }
      return 0;
    });

    return arr;
  }, [rows, q, sort, asc, restaurantMap]);

  function toast(s: string) {
    setInfo(s);
    setTimeout(() => setInfo(null), 2500);
  }

  /* ------------ CRUD helpers ------------ */
  async function createPrice(p: {
    restaurant_id: string;
    unit_price: number;
    min_package?: number | null;
    max_package?: number | null;
    note?: string | null;
  }) {
    const body = {
      restaurant_id: p.restaurant_id,
      unit_price: p.unit_price,
      min_package: p.min_package ?? null,
      max_package: p.max_package ?? null,
      note: p.note ?? null,
    };
    const res = await fetch('/yuksi/PackagePrice/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify(body),
    });
    const j = await readJson(res);
    if (!res.ok || (j && (j as any).success === false)) throw new Error(pickMsg(j, `HTTP ${res.status}`));
  }

  async function updatePrice(id: number, p: {
    restaurant_id: string;
    unit_price: number;
    min_package?: number | null;
    max_package?: number | null;
    note?: string | null;
  }) {
    const body = {
      restaurant_id: p.restaurant_id,
      unit_price: p.unit_price,
      min_package: p.min_package ?? null,
      max_package: p.max_package ?? null,
      note: p.note ?? null,
    };
    const res = await fetch(`/yuksi/PackagePrice/update/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify(body),
    });
    const j = await readJson(res);
    if (!res.ok || (j && (j as any).success === false)) throw new Error(pickMsg(j, `HTTP ${res.status}`));
  }

  async function deleteByRestaurant(restaurant_id: string) {
    const res = await fetch(`/yuksi/PackagePrice/delete/${restaurant_id}`, {
      method: 'DELETE',
      headers: authHeaders,
    });
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
            placeholder="Ara: restoran adı/ID, not…"
            className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 text-neutral-800 outline-none ring-2 ring-transparent transition placeholder:text-neutral-400 focus:bg-white focus:ring-sky-200"
          />
          <div className="flex items-center justify-end">
            <button
              onClick={() => setCreatingOpen(true)}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Yeni Fiyat Kaydı
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
                <Th
                  label="Restoran"
                  active={sort === 'restaurant'}
                  onClick={() => { setSort('restaurant'); setAsc(s => sort === 'restaurant' ? !s : true); }}
                />
                <Th
                  label="Birim Fiyat"
                  active={sort === 'unitPrice'}
                  onClick={() => { setSort('unitPrice'); setAsc(s => sort === 'unitPrice' ? !s : true); }}
                />
                <th className="px-4 py-3 font-medium">Min/Max</th>
                <Th
                  label="Güncelleme"
                  active={sort === 'updatedAt'}
                  onClick={() => { setSort('updatedAt'); setAsc(s => sort === 'updatedAt' ? !s : true); }}
                />
                <th className="px-4 py-3 font-medium">Not</th>
                <th className="px-4 py-3 font-medium w-[160px]"></th>
              </tr>
            </thead>
            <tbody>
              {(loading || rLoading) && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-neutral-500">Yükleniyor…</td>
                </tr>
              )}

              {!loading && !rLoading && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-neutral-500">
                    Kayıt bulunamadı{rError ? ` • ${rError}` : ''}.
                  </td>
                </tr>
              )}

              {!loading && !rLoading && filtered.map(r => {
                const name = restaurantMap[r.restaurant_id] || '(Restoran bulunamadı)';
                return (
                  <tr key={r.id} className="border-t border-neutral-200/70 align-top hover:bg-neutral-50">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-neutral-900">{name}</div>
                      <div className="font-mono text-[12px] text-neutral-500">{r.restaurant_id}</div>
                      <div className="text-[11px] text-neutral-400">#{r.id}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
                        {fmtTRY(r.unit_price)} / paket
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {(r.min_package ?? '-') + ' / ' + (r.max_package ?? '-')}
                    </td>
                    <td className="px-4 py-3 text-sm">{fmtDate(r.updated_at)}</td>
                    <td className="px-4 py-3 text-sm max-w-[360px] truncate" title={r.note || ''}>
                      {r.note || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditing(r)}
                          className="rounded-lg bg-sky-500 px-3 py-1.5 text-sm font-semibold text-white shadow hover:bg-sky-600"
                        >
                          Düzenle
                        </button>
                        <button
                          onClick={async () => {
                            if (!confirm('Bu restoranın paket fiyat kaydını silmek istiyor musunuz?')) return;
                            try {
                              await deleteByRestaurant(r.restaurant_id);
                              await loadList();
                              toast('Kayıt silindi.');
                            } catch (e: any) {
                              alert(e?.message || 'Silme işlemi başarısız.');
                            }
                          }}
                          className="rounded-lg bg-rose-500 px-3 py-1.5 text-sm font-semibold text-white shadow hover:bg-rose-600"
                        >
                          Sil
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
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
          title="Yeni Fiyat Kaydı"
          initial={{
            id: 0,
            restaurant_id: '',
            unit_price: 80,
            min_package: 10,
            max_package: null,
            note: '',
          } as PackagePriceRow}
          authHeaders={authHeaders}
          onClose={() => setCreatingOpen(false)}
          onSubmit={async (payload) => {
            try {
              await createPrice(payload);
              setCreatingOpen(false);
              await loadList();
              toast('Kayıt oluşturuldu.');
              // yeni eklenen kayıtta isim görünmesi için tekrar restoran haritasını da tazele
              await loadRestaurants();
            } catch (e: any) {
              alert(e?.message || 'Kayıt oluşturma başarısız.');
            }
          }}
        />
      )}

      {/* Edit modal */}
      {editing && (
        <EditModal
          mode="edit"
          title="Fiyatı Düzenle"
          initial={editing}
          authHeaders={authHeaders}
          onClose={() => setEditing(null)}
          onSubmit={async (payload) => {
            try {
              await updatePrice(editing.id, payload);
              setEditing(null);
              await loadList();
              toast('Kayıt güncellendi.');
              await loadRestaurants();
            } catch (e: any) {
              alert(e?.message || 'Güncelleme başarısız.');
            }
          }}
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
  authHeaders,
  onClose,
  onSubmit,
}: {
  title: string;
  initial: PackagePriceRow;
  mode: 'create' | 'edit';
  authHeaders: HeadersInit;
  onClose: () => void;
  onSubmit: (payload: {
    restaurant_id: string;
    unit_price: number;
    min_package?: number | null;
    max_package?: number | null;
    note?: string | null;
  }) => Promise<void>;
}) {
  const [restaurantId, setRestaurantId] = React.useState<string>(initial.restaurant_id || '');
  const [unitPrice, setUnitPrice] = React.useState<number>(initial.unit_price || 80);
  const [minP, setMinP] = React.useState<number | ''>(initial.min_package ?? '');
  const [maxP, setMaxP] = React.useState<number | ''>(initial.max_package ?? '');
  const [note, setNote] = React.useState<string>(initial.note ?? '');

  // yalnızca "create" modunda restoran listesi çek
  const [rLoading, setRLoading] = React.useState(false);
  const [rError, setRError] = React.useState<string | null>(null);
  const [restaurants, setRestaurants] = React.useState<RestaurantListItem[]>([]);

  React.useEffect(() => {
    if (mode !== 'create') return;
    let cancelled = false;
    (async () => {
      setRLoading(true); setRError(null);
      try {
        const res = await fetch('/yuksi/Restaurant/list', { headers: authHeaders, cache: 'no-store' });
        const data = await readJson<any>(res);
        if (!res.ok) throw new Error(pickMsg(data, `HTTP ${res.status}`));
        const arr: any[] = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
        const mapped: RestaurantListItem[] = arr.map((x) => ({
          id: String(x?.id || ''),
          name: x?.name ?? null,
          email: x?.email ?? null,
          contactPerson: x?.contactPerson ?? null,
        })).filter(r => r.id);
        if (!cancelled) {
          setRestaurants(mapped);
          if (!restaurantId && mapped.length > 0) setRestaurantId(mapped[0].id);
        }
      } catch (e: any) {
        if (!cancelled) setRError(e?.message || 'Restoran listesi alınamadı.');
      } finally {
        if (!cancelled) setRLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [mode, authHeaders]); // restaurantId dependency değil

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!restaurantId || restaurantId.length < 10) {
      alert('Geçerli bir restoran seçiniz.');
      return;
    }
    await onSubmit({
      restaurant_id: restaurantId,
      unit_price: Math.max(1, Math.round(Number(unitPrice || 1))),
      min_package: minP === '' ? null : Math.max(1, Number(minP)),
      max_package: maxP === '' ? null : Math.max(1, Number(maxP)),
      note: note.trim() || null,
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
              {mode === 'create' ? (
                <>
                  <label className="mb-1 block text-sm font-medium text-neutral-700">Restoran</label>
                  <select
                    value={restaurantId}
                    onChange={(e) => setRestaurantId(e.target.value)}
                    disabled={rLoading}
                    className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-sky-200"
                  >
                    {rLoading && <option value="">Yükleniyor…</option>}
                    {rError && <option value="">{rError}</option>}
                    {!rLoading && !rError && restaurants.length === 0 && (
                      <option value="">Kayıt bulunamadı</option>
                    )}
                    {!rLoading && !rError && restaurants.map(r => (
                      <option key={r.id} value={r.id}>
                        {r.name || '(İsimsiz)'} — {r.id}
                      </option>
                    ))}
                  </select>
                </>
              ) : (
                <>
                  <label className="mb-1 block text-sm font-medium text-neutral-700">Restoran ID (UUID)</label>
                  <input
                    value={restaurantId}
                    readOnly
                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 font-mono text-[13px] text-neutral-700 outline-none"
                  />
                </>
              )}
            </div>

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
              Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

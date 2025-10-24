'use client';

import * as React from 'react';
import { getAuthToken } from '@/utils/auth';

/* ========= helpers ========= */
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

function fmtTRY(n?: number | null) {
  if (n == null) return '-';
  try { return n.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }); }
  catch { return String(n); }
}
function fmtDate(iso?: string | null) {
  if (!iso) return '-';
  try { return new Date(iso).toLocaleString('tr-TR'); } catch { return iso; }
}
function badgeColor(kind?: string) {
  if (kind === 'immediate') return 'bg-indigo-50 text-indigo-700 ring-indigo-100';
  if (kind === 'appointment') return 'bg-amber-50 text-amber-700 ring-amber-100';
  return 'bg-neutral-100 text-neutral-700 ring-neutral-200';
}

/* ========= API types ========= */
type ApiJob = {
  id: string;
  deliveryType: 'immediate' | 'appointment' | string;
  carrierType?: string | null;
  vehicleType?: string | null;
  pickupAddress?: string | null;
  dropoffAddress?: string | null;
  specialNotes?: string | null;
  totalPrice?: number | null;
  paymentMethod?: 'cash' | 'card' | 'transfer' | string | null;
  createdAt?: string | null;
  // back-end başka alanlar dönerse sorun olmaz
};
type ListResponse = { success?: boolean; message?: string; data?: ApiJob[] };

/* ========= page ========= */
export default function ShippingListPage() {
  const token = React.useMemo(getAuthToken, []);
  const headers = React.useMemo<HeadersInit>(() => bearerHeaders(token), [token]);

  // filters / paging
  const [limit, setLimit] = React.useState<number | ''>('');
  const [offset, setOffset] = React.useState<number>(0);
  const [deliveryType, setDeliveryType] = React.useState<'' | 'immediate' | 'appointment'>('');
  const [q, setQ] = React.useState('');

  // data
  const [rows, setRows] = React.useState<ApiJob[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // UI
  const [selected, setSelected] = React.useState<ApiJob | null>(null);
  const [editing, setEditing] = React.useState<ApiJob | null>(null);
  const [info, setInfo] = React.useState<string | null>(null);

  function toast(s: string) { setInfo(s); setTimeout(() => setInfo(null), 2500); }

  const load = React.useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const url = new URL('/yuksi/admin/jobs', location.origin);
      if (limit !== '') url.searchParams.set('limit', String(limit));
      url.searchParams.set('offset', String(offset));
      if (deliveryType) url.searchParams.set('deliveryType', deliveryType);
      const res = await fetch(url.toString(), { headers, cache: 'no-store' });
      const j = await readJson<ListResponse>(res);
      if (!res.ok || (j && (j as any).success === false)) {
        throw new Error(pickMsg(j, `HTTP ${res.status}`));
      }
      const list = Array.isArray(j?.data) ? j!.data! : Array.isArray(j) ? (j as any as ApiJob[]) : [];
      setRows(list);
    } catch (e: any) {
      setError(e?.message || 'Yük listesi alınamadı.');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [headers, limit, offset, deliveryType]);

  React.useEffect(() => { load(); }, [load]);

  const filtered = React.useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return rows;
    return rows.filter(r =>
      [
        r.pickupAddress || '',
        r.dropoffAddress || '',
        r.specialNotes || '',
        r.paymentMethod || '',
        r.deliveryType || '',
      ].join(' ').toLowerCase().includes(qq)
    );
  }, [rows, q]);

  // CRUD
  async function onDelete(id: string) {
    if (!confirm('Bu yük kaydını silmek istiyor musunuz?')) return;
    try {
      const res = await fetch(`/yuksi/admin/jobs/${id}`, { method: 'DELETE', headers });
      const j = await readJson(res);
      if (!res.ok || (j && (j as any).success === false)) throw new Error(pickMsg(j, `HTTP ${res.status}`));
      await load();
      toast('Kayıt silindi.');
    } catch (e: any) {
      alert(e?.message || 'Silme işlemi başarısız.');
    }
  }

  async function onUpdate(id: string, payload: Partial<ApiJob>) {
    // PUT bekliyor: create ile aynı alanlar; elimizdeki + düzenlenenlerle gönderiyoruz
    const r = rows.find(x => x.id === id);
    if (!r) return;

    const body = {
      deliveryType: r.deliveryType,
      carrierType: r.carrierType ?? 'courier',
      vehicleType: r.vehicleType ?? 'motorcycle',
      pickupAddress: payload.pickupAddress ?? r.pickupAddress ?? '',
      dropoffAddress: payload.dropoffAddress ?? r.dropoffAddress ?? '',
      specialNotes: payload.specialNotes ?? r.specialNotes ?? '',
      campaignCode: undefined,
      extraServices: [],
      extraServicesTotal: 0,
      totalPrice: payload.totalPrice ?? r.totalPrice ?? 0,
      paymentMethod: (payload.paymentMethod ?? r.paymentMethod ?? 'cash'),
      imageFileIds: [],
    };

    try {
      const res = await fetch(`/yuksi/admin/jobs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify(body),
      });
      const j = await readJson(res);
      if (!res.ok || (j && (j as any).success === false)) throw new Error(pickMsg(j, `HTTP ${res.status}`));
      setEditing(null);
      await load();
      toast('Kayıt güncellendi.');
    } catch (e: any) {
      alert(e?.message || 'Güncelleme başarısız.');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Yük Listesi</h1>
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
          <label className="text-sm text-neutral-600">Tip</label>
          <select
            value={deliveryType}
            onChange={(e) => setDeliveryType(e.target.value as any)}
            className="rounded-lg border border-neutral-300 bg-white px-2 py-1.5 text-sm"
          >
            <option value="">Tümü</option>
            <option value="immediate">immediate</option>
            <option value="appointment">appointment</option>
          </select>
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
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Ara: adres, ödeme türü, not…"
              className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 text-neutral-800 outline-none ring-2 ring-transparent transition placeholder:text-neutral-400 focus:bg-white focus:ring-sky-200"
            />
          </div>
        </div>

        {error && <div className="px-4 pb-2 text-sm text-rose-600">{error}</div>}

        <div className="overflow-x-auto">
          <table className="min-w-full border-t border-neutral-200/70">
            <thead>
              <tr className="text-left text-sm text-neutral-500">
                <th className="px-4 py-3 font-medium">Alış / Teslim</th>
                <th className="px-4 py-3 font-medium">Teslimat Tipi</th>
                <th className="px-4 py-3 font-medium">Ödeme</th>
                <th className="px-4 py-3 font-medium">Toplam</th>
                <th className="px-4 py-3 font-medium">Oluşturma</th>
                <th className="px-4 py-3 font-medium w-[200px]"></th>
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
                    <div className="text-neutral-900 font-medium line-clamp-2">{r.pickupAddress || '-'}</div>
                    <div className="mt-1 text-sm text-neutral-700 line-clamp-2">→ {r.dropoffAddress || '-'}</div>
                    {r.specialNotes && <div className="mt-1 text-xs text-neutral-500">{r.specialNotes}</div>}
                    <div className="text-[11px] text-neutral-400 mt-1">#{r.id}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${badgeColor(r.deliveryType)}`}>
                      {r.deliveryType || '-'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">{r.paymentMethod || '-'}</td>
                  <td className="px-4 py-3 font-semibold">{fmtTRY(r.totalPrice)}</td>
                  <td className="px-4 py-3 text-sm">{fmtDate(r.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelected(r)}
                        className="rounded-lg bg-sky-500 px-3 py-1.5 text-sm font-semibold text-white shadow hover:bg-sky-600"
                      >
                        Görüntüle
                      </button>
                      <button
                        onClick={() => setEditing(r)}
                        className="rounded-lg bg-amber-500 px-3 py-1.5 text-sm font-semibold text-white shadow hover:bg-amber-600"
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
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-neutral-500">
                    Kayıt yok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* toast */}
      {info && (
        <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm shadow-lg">
          {info}
        </div>
      )}

      {selected && <DetailModal row={selected} onClose={() => setSelected(null)} />}

      {editing && (
        <EditModal
          row={editing}
          onClose={() => setEditing(null)}
          onSubmit={(payload) => onUpdate(editing.id, payload)}
        />
      )}
    </div>
  );
}

/* ======== Modals ======== */
function DetailModal({ row, onClose }: { row: ApiJob; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-start overflow-y-auto bg-black/50 p-4">
      <div className="mx-auto w-full max-w-3xl rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h3 className="text-xl font-semibold">Yük Detayı</h3>
          <button className="rounded-full p-2 hover:bg-neutral-100" onClick={onClose} aria-label="Kapat">✕</button>
        </div>

        <div className="space-y-4 p-5">
          <Field label="Teslimat Tipi" value={row.deliveryType} />
          <Field label="Ödeme" value={row.paymentMethod} />
          <Field label="Toplam Ücret" value={fmtTRY(row.totalPrice)} />
          <Field label="Oluşturma" value={fmtDate(row.createdAt)} />
          <Field label="Alış Adresi" value={row.pickupAddress} />
          <Field label="Teslim Adresi" value={row.dropoffAddress} />
          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
            <div className="mb-2 text-sm font-medium text-neutral-700">Not</div>
            <p className="whitespace-pre-line text-neutral-800">{row.specialNotes || '-'}</p>
          </div>

          <div className="flex items-center justify-end">
            <button onClick={onClose} className="rounded-lg bg-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-300">
              Kapat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EditModal({
  row,
  onClose,
  onSubmit,
}: {
  row: ApiJob;
  onClose: () => void;
  onSubmit: (payload: Partial<ApiJob>) => void;
}) {
  const [pickup, setPickup] = React.useState(row.pickupAddress || '');
  const [dropoff, setDropoff] = React.useState(row.dropoffAddress || '');
  const [notes, setNotes] = React.useState(row.specialNotes || '');
  const [payment, setPayment] = React.useState<'cash' | 'card' | 'transfer' | ''>((row.paymentMethod as any) || '');
  const [total, setTotal] = React.useState<number | ''>(row.totalPrice ?? '');

  function save(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      pickupAddress: pickup,
      dropoffAddress: dropoff,
      specialNotes: notes,
      paymentMethod: payment || undefined,
      totalPrice: total === '' ? 0 : Number(total),
    });
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h3 className="text-lg font-semibold">Kaydı Düzenle</h3>
          <button className="rounded-full p-2 hover:bg-neutral-100" onClick={onClose} aria-label="Kapat">✕</button>
        </div>

        <form onSubmit={save} className="space-y-4 p-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Alış Adresi</label>
            <input
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
              className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-sky-200"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Teslim Adresi</label>
            <input
              value={dropoff}
              onChange={(e) => setDropoff(e.target.value)}
              className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-sky-200"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Not</label>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-sky-200"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">Ödeme Yöntemi</label>
              <select
                value={payment}
                onChange={(e) => setPayment(e.target.value as any)}
                className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-sky-200"
              >
                <option value="">Seçiniz</option>
                <option value="cash">cash</option>
                <option value="card">card</option>
                <option value="transfer">transfer</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">Toplam Ücret (₺)</label>
              <input
                type="number"
                min={0}
                value={total}
                onChange={(e) => setTotal(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))}
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

function Field({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1 text-sm font-medium text-neutral-600">{label}</div>
      <div className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-neutral-900">
        {value ?? '-'}
      </div>
    </div>
  );
}

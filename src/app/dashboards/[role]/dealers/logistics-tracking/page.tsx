// src/app/dashboards/[role]/dealers/logistics-tracking/page.tsx
'use client';

import * as React from 'react';
import { getAuthToken } from '@/utils/auth';

/* ================= Helpers ================= */
async function readJson<T = any>(res: Response): Promise<T> {
  const txt = await res.text();
  try {
    return txt ? JSON.parse(txt) : (null as any);
  } catch {
    return (txt as any);
  }
}
const pickMsg = (d: any, fb: string) =>
  d?.message || d?.detail || d?.title || fb;

function collectErrors(x: any): string {
  const msgs: string[] = [];
  if (!x) return '';
  if (x?.message) msgs.push(String(x.message));
  if (x?.data?.message) msgs.push(String(x.data.message));
  const err = x?.errors || x?.error || x?.detail;

  if (Array.isArray(err)) {
    for (const it of err) {
      if (typeof it === 'string') msgs.push(it);
      else if (it && typeof it === 'object') {
        const loc = Array.isArray((it as any).loc) ? (it as any).loc.join('.') : (it as any).loc ?? '';
        const m = (it as any).msg || (it as any).message || (it as any).detail;
        if (loc && m) msgs.push(`${loc}: ${m}`);
        else if (m) msgs.push(String(m));
      }
    }
  } else if (err && typeof err === 'object') {
    for (const [k, v] of Object.entries(err)) {
      if (Array.isArray(v)) (v as any[]).forEach((m) => msgs.push(`${k}: ${m}`));
      else if (v) msgs.push(`${k}: ${v}`);
    }
  }
  return msgs.join('\n');
}

const fmtDT = (iso?: string) => (iso ? new Date(iso).toLocaleString('tr-TR') : '—');

/* ================= Types ================= */
type DealerJob = {
  id: string;

  deliveryType: 'immediate' | 'scheduled';
  carrierType: string;
  vehicleType: string;

  pickupAddress: string;
  dropoffAddress: string;

  specialNotes?: string;

  totalPrice?: number;
  paymentMethod?: 'cash' | 'card' | 'transfer';

  createdAt?: string;
  imageFileIds?: string[];

  deliveryDate?: string | null; // "DD.MM.YYYY" (only for scheduled)
  deliveryTime?: string | null; // "HH:mm"     (only for scheduled)
};

/* ================= Page ================= */
export default function DealerLogisticsTrackingPage() {
  const token = React.useMemo(getAuthToken, []);
  const headers: HeadersInit = React.useMemo(
    () => ({
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }),
    [token]
  );

  const [rows, setRows] = React.useState<DealerJob[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [ok, setOk] = React.useState<string | null>(null);

  // pagination
  const [limit, setLimit] = React.useState<number | ''>(50);
  const [offset, setOffset] = React.useState<number | ''>(0);

  // edit modal
  const [editOpen, setEditOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<DealerJob | null>(null);
  const [busyId, setBusyId] = React.useState<string | null>(null);

  async function loadList() {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams();
      if (limit !== '') qs.set('limit', String(limit));
      if (offset !== '') qs.set('offset', String(offset));

      const res = await fetch(`/yuksi/dealer/jobs?${qs.toString()}`, {
        headers,
        cache: 'no-store',
      });
      const j: any = await readJson(res);
      if (!res.ok || j?.success === false)
        throw new Error(pickMsg(j, `HTTP ${res.status}`));

      const list = Array.isArray(j?.data) ? j.data : [];
      const mapped: DealerJob[] = list.map((x: any) => ({
        id: String(x?.id),

        deliveryType: x?.deliveryType === 'scheduled' ? 'scheduled' : 'immediate',
        carrierType: String(x?.carrierType ?? ''),
        vehicleType: String(x?.vehicleType ?? ''),

        pickupAddress: String(x?.pickupAddress ?? ''),
        dropoffAddress: String(x?.dropoffAddress ?? ''),

        specialNotes: x?.specialNotes ?? '',

        totalPrice: x?.totalPrice != null ? Number(x.totalPrice) : undefined,
        paymentMethod: x?.paymentMethod ?? undefined,

        createdAt: x?.createdAt ?? undefined,
        imageFileIds: Array.isArray(x?.imageFileIds) ? x.imageFileIds : undefined,

        deliveryDate: x?.deliveryDate ?? null,
        deliveryTime: x?.deliveryTime ?? null,
      }));
      setRows(mapped);
    } catch (e: any) {
      setError(e?.message || 'Kayıtlar alınamadı.');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    loadList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openEdit(r: DealerJob) {
    setEditing(r);
    setEditOpen(true);
  }

  async function handleUpdate(updated: DealerJob) {
    if (!updated?.id) return;
    setBusyId(updated.id);
    setError(null);
    setOk(null);
    try {
      // PUT body — endpoint tüm alanları istiyor, mevcut veriyi tam gönderiyoruz
      const body = {
        deliveryType: updated.deliveryType,
        carrierType: updated.carrierType,
        vehicleType: updated.vehicleType,

        pickupAddress: updated.pickupAddress,
        dropoffAddress: updated.dropoffAddress,

        specialNotes: updated.specialNotes ?? '',

        campaignCode: '', // opsiyonel alan, yoksa boş
        extraServices: [], // şimdilik boş
        extraServicesTotal: 0,

        totalPrice: Number(updated.totalPrice ?? 0),
        paymentMethod: updated.paymentMethod ?? 'cash',

        imageFileIds: updated.imageFileIds ?? [],

        // scheduled ise doldur, değilse boş string gönder (swagger örneği string)
        deliveryDate: updated.deliveryType === 'scheduled' ? (updated.deliveryDate ?? '') : '',
        deliveryTime: updated.deliveryType === 'scheduled' ? (updated.deliveryTime ?? '') : '',
      };

      const res = await fetch(`/yuksi/dealer/jobs/${updated.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify(body),
      });
      const j = await readJson(res);
      if (!res.ok || j?.success === false) {
        throw new Error(collectErrors(j) || pickMsg(j, `HTTP ${res.status}`));
      }

      setOk('Yük güncellendi.');
      setEditOpen(false);
      setEditing(null);
      await loadList();
    } catch (e: any) {
      setError(e?.message || 'Güncelleme başarısız.');
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Bu yük kaydını silmek istiyor musun?')) return;
    setBusyId(id);
    setError(null);
    setOk(null);
    try {
      const res = await fetch(`/yuksi/dealer/jobs/${id}`, {
        method: 'DELETE',
        headers,
      });
      const j = await readJson(res);
      if (!res.ok || j?.success === false) {
        throw new Error(pickMsg(j, `HTTP ${res.status}`));
      }
      setOk('Kayıt silindi.');
      setRows((p) => p.filter((x) => x.id !== id));
    } catch (e: any) {
      setError(e?.message || 'Silme işlemi başarısız.');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Yük Listesi (Bayi)</h1>
          <p className="text-sm text-neutral-600">Kendi oluşturduğun yükleri görüntüle, düzenle veya sil.</p>
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
            onClick={loadList}
            className="rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm hover:bg-neutral-50"
          >
            Yenile
          </button>
        </div>
      </div>

      {ok && <div className="rounded-md bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{ok}</div>}
      {error && <div className="rounded-md bg-rose-50 px-4 py-3 text-sm text-rose-700 whitespace-pre-line">{error}</div>}

      {/* Table */}
      <section className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full table-fixed">
            <thead>
              <tr className="text-left text-xs text-neutral-500">
                <th className="px-6 py-3 font-medium">ID</th>
                <th className="px-6 py-3 font-medium">Teslim Tipi</th>
                <th className="px-6 py-3 font-medium">Taşıyıcı / Araç</th>
                <th className="px-6 py-3 font-medium">Alım</th>
                <th className="px-6 py-3 font-medium">Teslim</th>
                <th className="px-6 py-3 font-medium">Fiyat</th>
                <th className="px-6 py-3 font-medium">Ödeme</th>
                <th className="px-6 py-3 font-medium">Oluşturma</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t text-sm">
                  <td className="px-6 py-3">{r.id}</td>
                  <td className="px-6 py-3">
                    {r.deliveryType === 'immediate' ? 'immediate' : (
                      <span title={`${r.deliveryDate ?? ''} ${r.deliveryTime ?? ''}`}>scheduled</span>
                    )}
                  </td>
                  <td className="px-6 py-3">{r.carrierType} • {r.vehicleType}</td>
                  <td className="px-6 py-3">{r.pickupAddress}</td>
                  <td className="px-6 py-3">{r.dropoffAddress}</td>
                  <td className="px-6 py-3">{r.totalPrice != null ? `${r.totalPrice}₺` : '—'}</td>
                  <td className="px-6 py-3">{r.paymentMethod ?? '—'}</td>
                  <td className="px-6 py-3">{fmtDT(r.createdAt)}</td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(r)}
                        className="rounded-md bg-green-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-600"
                        disabled={busyId === r.id}
                      >
                        Düzenle
                      </button>
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="rounded-md bg-red-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-600 disabled:opacity-60"
                        disabled={busyId === r.id}
                      >
                        Sil
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && !loading && (
                <tr>
                  <td colSpan={9} className="px-6 py-10 text-center text-sm text-neutral-500">Kayıt bulunamadı.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {loading && <div className="px-6 py-3 text-sm text-neutral-500">Yükleniyor…</div>}
      </section>

      {editOpen && editing && (
        <EditJobModal
          job={editing}
          onClose={() => { setEditOpen(false); setEditing(null); }}
          onSave={handleUpdate}
        />
      )}
    </div>
  );
}

/* ================= Edit Modal ================= */
function EditJobModal({
  job,
  onClose,
  onSave,
}: {
  job: DealerJob;
  onClose: () => void;
  onSave: (j: DealerJob) => void;
}) {
  const [model, setModel] = React.useState<DealerJob>({ ...job });

  function set<K extends keyof DealerJob>(k: K, v: DealerJob[K]) {
    setModel((p) => ({ ...p, [k]: v }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    onSave(model);
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
      <div className="w-full max-w-3xl rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h3 className="text-lg font-semibold">Yükü Düzenle</h3>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-neutral-100">✕</button>
        </div>

        <form onSubmit={submit} className="space-y-4 p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Teslim Tipi</label>
              <select
                value={model.deliveryType}
                onChange={(e) => set('deliveryType', e.target.value as any)}
                className="w-full rounded-xl border border-neutral-300 px-3 py-2"
              >
                <option value="immediate">immediate</option>
                <option value="scheduled">scheduled</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Taşıyıcı Tipi</label>
              <input
                value={model.carrierType}
                onChange={(e) => set('carrierType', e.target.value)}
                className="w-full rounded-xl border border-neutral-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Araç Tipi</label>
              <input
                value={model.vehicleType}
                onChange={(e) => set('vehicleType', e.target.value)}
                className="w-full rounded-xl border border-neutral-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Ödeme Yöntemi</label>
              <select
                value={model.paymentMethod ?? ''}
                onChange={(e) => set('paymentMethod', (e.target.value || undefined) as any)}
                className="w-full rounded-xl border border-neutral-300 px-3 py-2"
              >
                <option value="">Seçiniz</option>
                <option value="cash">cash</option>
                <option value="card">card</option>
                <option value="transfer">transfer</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Alım Adresi</label>
              <textarea
                rows={2}
                value={model.pickupAddress}
                onChange={(e) => set('pickupAddress', e.target.value)}
                className="w-full rounded-xl border border-neutral-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Teslim Adresi</label>
              <textarea
                rows={2}
                value={model.dropoffAddress}
                onChange={(e) => set('dropoffAddress', e.target.value)}
                className="w-full rounded-xl border border-neutral-300 px-3 py-2"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium">Toplam Fiyat (₺)</label>
              <input
                type="number"
                value={model.totalPrice ?? 0}
                onChange={(e) => set('totalPrice', Number(e.target.value))}
                className="w-full rounded-xl border border-neutral-300 px-3 py-2"
              />
            </div>

            {model.deliveryType === 'scheduled' && (
              <>
                <div>
                  <label className="mb-1 block text-sm font-medium">Teslim Tarihi (DD.MM.YYYY)</label>
                  <input
                    value={model.deliveryDate ?? ''}
                    onChange={(e) => set('deliveryDate', e.target.value)}
                    className="w-full rounded-xl border border-neutral-300 px-3 py-2"
                    placeholder="27.01.2025"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Teslim Saati (HH:mm)</label>
                  <input
                    value={model.deliveryTime ?? ''}
                    onChange={(e) => set('deliveryTime', e.target.value)}
                    className="w-full rounded-xl border border-neutral-300 px-3 py-2"
                    placeholder="10:00"
                  />
                </div>
              </>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Özel Notlar</label>
            <textarea
              rows={3}
              value={model.specialNotes ?? ''}
              onChange={(e) => set('specialNotes', e.target.value)}
              className="w-full rounded-xl border border-neutral-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Görsel ID’ler (virgülle ayır)</label>
            <input
              value={(model.imageFileIds ?? []).join(',')}
              onChange={(e) => set('imageFileIds', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
              className="w-full rounded-xl border border-neutral-300 px-3 py-2"
              placeholder="uuid1, uuid2, uuid3"
            />
          </div>

          <div className="mt-2 flex items-center justify-end gap-3">
            <button
              type="submit"
              className="rounded-xl bg-emerald-500 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
            >
              Kaydet
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-neutral-100 px-5 py-2 text-sm hover:bg-neutral-200"
            >
              İptal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

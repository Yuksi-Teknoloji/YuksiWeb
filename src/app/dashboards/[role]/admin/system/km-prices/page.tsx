// src/app/dashboards/[role]/admin/system/km-prices/page.tsx
'use client';

import * as React from 'react';
import { getAuthToken } from '@/utils/auth';

type CompanyPackage = {
  id: string;
  carrier_km: number;
  requested_km: number;
  price: number;
  created_at?: string;
  is_active?: boolean;
};

/* ---------------- Helper Functions ---------------- */
async function readJson<T = any>(res: Response): Promise<T> {
  const txt = await res.text();
  try {
    return txt ? JSON.parse(txt) : (null as any);
  } catch {
    return (txt as any);
  }
}

const pickMsg = (data: any, fallback: string) =>
  data?.message || data?.detail || data?.title || fallback;

/* ---------------- Page Component ---------------- */
export default function KmPricesPage() {
  const token = getAuthToken();
  const headers: HeadersInit = React.useMemo(
    () => ({
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }),
    [token]
  );

  const [rows, setRows] = React.useState<CompanyPackage[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState<string | null>(null);
  const [openCreate, setOpenCreate] = React.useState(false);

  // EDIT modal state
  const [editRow, setEditRow] = React.useState<CompanyPackage | null>(null);

  const [busyId, setBusyId] = React.useState<string | null>(null);

  async function loadList() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/yuksi/admin/company-packages', { headers, cache: 'no-store' });
      const j: any = await readJson(res);
      if (!res.ok || j?.success === false) throw new Error(pickMsg(j, `HTTP ${res.status}`));

      const data: CompanyPackage[] = (j?.data || []).map((x: any) => ({
        id: String(x?.id),
        carrier_km: Number(x?.carrier_km ?? 0),
        requested_km: Number(x?.requested_km ?? 0),
        price: Number(x?.price ?? 0),
        created_at: x?.created_at ?? '',
        is_active: x?.is_active ?? true,
      }));
      setRows(data);
    } catch (err: any) {
      setError(err.message || 'Veri alınamadı');
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    loadList();
  }, []);

  async function createPackage(item: { carrier_km: number; requested_km: number; price: number }) {
    try {
      const res = await fetch('/yuksi/admin/company-packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify(item),
      });
      const j = await readJson(res);
      if (!res.ok) throw new Error(pickMsg(j, `HTTP ${res.status}`));
      setMessage('Paket başarıyla eklendi.');
      loadList();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function updatePackage(id: string, body: Partial<CompanyPackage>) {
    setBusyId(id);
    try {
      const res = await fetch(`/yuksi/admin/company-packages/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify(body),
      });
      const j = await readJson(res);
      if (!res.ok) throw new Error(pickMsg(j, `HTTP ${res.status}`));
      setMessage('Paket güncellendi.');
      await loadList();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function deletePackage(id: string) {
    if (!confirm('Bu paketi silmek istiyor musun?')) return;
    setBusyId(id);
    try {
      const res = await fetch(`/yuksi/admin/company-packages/${id}`, {
        method: 'DELETE',
        headers,
      });
      const j = await readJson(res);
      if (!res.ok) throw new Error(pickMsg(j, `HTTP ${res.status}`));
      setMessage('Paket silindi.');
      setRows((p) => p.filter((r) => r.id !== id));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  // OPEN edit modal
  function openEditDialog(r: CompanyPackage) {
    setEditRow(r);
  }

  // SAVE from edit modal
  function onEditSave(data: { carrier_km: number; requested_km: number; price: number; is_active?: boolean }) {
    if (!editRow) return;
    updatePackage(editRow.id, data);
    setEditRow(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2 sm:px-0">
        <h1 className="text-2xl font-semibold tracking-tight">KM Paketleri</h1>
        <div className="flex gap-2">
          <button
            onClick={loadList}
            className="rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm hover:bg-neutral-50"
          >
            Yenile
          </button>
          <button
            onClick={() => setOpenCreate(true)}
            className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-600"
          >
            Yeni Paket Ekle
          </button>
        </div>
      </div>

      {message && <div className="rounded-md bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div>}
      {error && <div className="rounded-md bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

      <section className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full table-fixed">
            <thead>
              <tr className="text-left text-sm text-neutral-500">
                <th className="px-6 py-3 font-medium">Taşıyıcı KM</th>
                <th className="px-6 py-3 font-medium">Talep Edilen KM</th>
                <th className="px-6 py-3 font-medium">Fiyat (₺)</th>
                <th className="px-6 py-3 font-medium">Oluşturulma</th>
                <th className="px-6 py-3 font-medium">Aktif</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-neutral-200 text-sm">
                  <td className="px-6 py-4 font-semibold">{r.carrier_km}</td>
                  <td className="px-6 py-4 font-semibold">{r.requested_km}</td>
                  <td className="px-6 py-4 font-semibold">{r.price}</td>
                  <td className="px-6 py-4">{r.created_at ? new Date(r.created_at).toLocaleString('tr-TR') : '-'}</td>
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={r.is_active ?? true}
                      onChange={(e) => updatePackage(r.id, { is_active: e.target.checked })}
                      disabled={busyId === r.id}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditDialog(r)}
                        disabled={busyId === r.id}
                        className="rounded-md bg-green-500 px-3 py-2 text-white text-sm hover:bg-green-600 disabled:opacity-60"
                      >
                        Düzenle
                      </button>
                      <button
                        onClick={() => deletePackage(r.id)}
                        disabled={busyId === r.id}
                        className="rounded-md bg-red-500 px-3 py-2 text-white text-sm hover:bg-red-600 disabled:opacity-60"
                      >
                        Sil
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-neutral-500">
                    Henüz paket bulunmuyor.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {loading && <div className="px-6 py-4 text-sm text-neutral-500">Yükleniyor…</div>}
      </section>

      {openCreate && (
        <AddPackageModal onClose={() => setOpenCreate(false)} onCreate={createPackage} />
      )}

      {editRow && (
        <EditPackageModal
          row={editRow}
          onClose={() => setEditRow(null)}
          onSave={onEditSave}
        />
      )}
    </div>
  );
}

/* ---------------- Create Modal ---------------- */
function AddPackageModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (data: { carrier_km: number; requested_km: number; price: number }) => void;
}) {
  const [carrier_km, setCarrierKm] = React.useState<number | ''>('');
  const [requested_km, setRequestedKm] = React.useState<number | ''>('');
  const [price, setPrice] = React.useState<number | ''>('');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (carrier_km === '' || requested_km === '' || price === '') return;
    onCreate({ carrier_km: Number(carrier_km), requested_km: Number(requested_km), price: Number(price) });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h3 className="text-lg font-semibold">Yeni Paket Ekle</h3>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-neutral-100">✕</button>
        </div>
        <form onSubmit={submit} className="space-y-4 p-5">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Taşıyıcı KM</label>
            <input
              type="number"
              value={carrier_km}
              onChange={(e) => setCarrierKm(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full rounded-xl border border-neutral-300 px-3 py-2 focus:ring-2 focus:ring-sky-200 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Talep Edilen KM</label>
            <input
              type="number"
              value={requested_km}
              onChange={(e) => setRequestedKm(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full rounded-xl border border-neutral-300 px-3 py-2 focus:ring-2 focus:ring-sky-200 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Fiyat (₺)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full rounded-xl border border-neutral-300 px-3 py-2 focus:ring-2 focus:ring-sky-200 outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="submit" className="rounded-xl bg-emerald-500 px-4 py-2 text-sm text-white hover:bg-emerald-600">
              Kaydet
            </button>
            <button type="button" onClick={onClose} className="rounded-xl bg-neutral-100 px-4 py-2 text-sm hover:bg-neutral-200">
              İptal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ---------------- Edit Modal ---------------- */
function EditPackageModal({
  row,
  onClose,
  onSave,
}: {
  row: CompanyPackage;
  onClose: () => void;
  onSave: (data: { carrier_km: number; requested_km: number; price: number; is_active?: boolean }) => void;
}) {
  const [carrier_km, setCarrierKm] = React.useState<number | ''>(row.carrier_km);
  const [requested_km, setRequestedKm] = React.useState<number | ''>(row.requested_km);
  const [price, setPrice] = React.useState<number | ''>(row.price);
  const [is_active, setIsActive] = React.useState<boolean>(row.is_active ?? true);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (carrier_km === '' || requested_km === '' || price === '') return;
    onSave({
      carrier_km: Number(carrier_km),
      requested_km: Number(requested_km),
      price: Number(price),
      is_active,
    });
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h3 className="text-lg font-semibold">Paketi Düzenle</h3>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-neutral-100">✕</button>
        </div>

        <form onSubmit={submit} className="space-y-4 p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Taşıyıcı KM</label>
              <input
                type="number"
                value={carrier_km}
                onChange={(e) => setCarrierKm(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full rounded-xl border border-neutral-300 px-3 py-2 focus:ring-2 focus:ring-sky-200 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Talep Edilen KM</label>
              <input
                type="number"
                value={requested_km}
                onChange={(e) => setRequestedKm(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full rounded-xl border border-neutral-300 px-3 py-2 focus:ring-2 focus:ring-sky-200 outline-none"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Fiyat (₺)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full rounded-xl border border-neutral-300 px-3 py-2 focus:ring-2 focus:ring-sky-200 outline-none"
              />
            </div>
            <label className="mt-6 inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={is_active}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              <span className="text-sm text-neutral-700">Aktif</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="submit"
              className="rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
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

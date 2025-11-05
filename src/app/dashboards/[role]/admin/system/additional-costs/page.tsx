// src/app/dashboards/[role]/admin/system/additional-costs/page.tsx
'use client';

import * as React from 'react';
import { Loader2, Plus, RefreshCcw, Trash2, Pencil } from 'lucide-react';
import { getAuthToken } from '@/utils/auth';

/* =============== Helpers =============== */
type HeadersDict = HeadersInit;
const bearerHeaders = (token?: string | null): HeadersDict => {
  const h: HeadersDict = { Accept: 'application/json' };
  if (token) (h as any).Authorization = `Bearer ${token}`;
  return h;
};
async function readJson<T = any>(res: Response): Promise<T> {
  const t = await res.text();
  try { return t ? JSON.parse(t) : (null as any); } catch { return (t as any); }
}
const msg = (d: any, fb: string) => d?.message || d?.detail || d?.title || fb;

/* =============== API Types (admin/extra-services) =============== */
type ExtraServiceDTO = {
  id: string;
  service_name: string;
  price: number;
  carrier_type: string;      // ör: "courier"
  created_at?: string;
};
type CreateDTO = {
  serviceName: string;       // POST/PUT body alanları
  price: number;
  carrierType: string;       // ör: "courier"
};
type UpdateDTO = CreateDTO;

/* =============== UI Types =============== */
type Row = {
  id: string;
  serviceName: string;
  price: number;
  carrierType: string;
};

function dtoToRow(x: ExtraServiceDTO): Row {
  return {
    id: String(x.id),
    serviceName: x.service_name,
    price: Number(x.price) || 0,
    carrierType: x.carrier_type,
  };
}
function rowToDTO(x: Omit<Row, 'id'>): CreateDTO {
  return {
    serviceName: x.serviceName.trim(),
    price: Number(x.price) || 0,
    carrierType: x.carrierType.trim(),
  };
}

/* ===================================== */
/*                PAGE                    */
/* ===================================== */
export default function AdditionalCostsPage() {
  const token = React.useMemo(getAuthToken, []);
  const headers = React.useMemo<HeadersDict>(() => bearerHeaders(token), [token]);

  const [rows, setRows] = React.useState<Row[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [modalOpen, setModalOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);

  const [formCarrier, setFormCarrier] = React.useState<string>('');  // raw string (örn: "courier")
  const [formService, setFormService] = React.useState<string>('');
  const [formPrice, setFormPrice]     = React.useState<string>('');

  const canSave = formCarrier.trim() !== '' && formService.trim() !== '' && formPrice.trim() !== '';

  const resetForm = () => {
    setEditingId(null);
    setFormCarrier('');
    setFormService('');
    setFormPrice('');
  };

  /* -------- LISTE -------- */
  const load = React.useCallback(async () => {
    setLoading(true); setError(null);
    try {
      // GET /api/admin/extra-services
      const res = await fetch('/yuksi/admin/extra-services', { cache: 'no-store', headers });
      const j: any = await readJson(res);
      if (!res.ok || j?.success === false) throw new Error(msg(j, `HTTP ${res.status}`));

      const list: ExtraServiceDTO[] = Array.isArray(j?.data) ? j.data : (Array.isArray(j) ? j : []);
      setRows(list.map(dtoToRow));
    } catch (e: any) {
      setRows([]);
      setError(e?.message || 'Ek hizmetler getirilemedi.');
    } finally { setLoading(false); }
  }, [headers]);

  React.useEffect(() => { load(); }, [load]);

  /* -------- CREATE / UPDATE -------- */
  async function submitForm(e: React.FormEvent) {
    e.preventDefault();
    if (!canSave) return;

    const body: CreateDTO | UpdateDTO = rowToDTO({
      serviceName: formService,
      price: Number(formPrice),
      carrierType: formCarrier,
    });

    try {
      if (editingId) {
        // PUT /api/admin/extra-services/{service_id}
        const res = await fetch(`/yuksi/admin/extra-services/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', ...headers },
          body: JSON.stringify(body),
        });
        const j = await readJson(res);
        if (!res.ok || (j as any)?.success === false) throw new Error(msg(j, `HTTP ${res.status}`));
      } else {
        // POST /api/admin/extra-services
        const res = await fetch('/yuksi/admin/extra-services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...headers },
          body: JSON.stringify(body),
        });
        const j = await readJson(res);
        if (!res.ok || (j as any)?.success === false) throw new Error(msg(j, `HTTP ${res.status}`));
      }
      await load();
      setModalOpen(false);
      resetForm();
    } catch (e: any) {
      alert(e?.message || 'Kaydetme başarısız.');
    }
  }

  /* -------- DELETE -------- */
  async function handleDelete(id: string) {
    if (typeof window !== 'undefined') {
      const ok = window.confirm('Bu ek hizmeti silmek istiyor musun?');
      if (!ok) return;
    }
    try {
      // DELETE /api/admin/extra-services/{service_id}
      const res = await fetch(`/yuksi/admin/extra-services/${id}`, { method: 'DELETE', headers });
      const j = await readJson(res);
      if (!res.ok || (j as any)?.success === false) throw new Error(msg(j, `HTTP ${res.status}`));
      setRows(prev => prev.filter(r => r.id !== id));
    } catch (e: any) {
      alert(e?.message || 'Silinemedi.');
    }
  }

  /* -------- EDIT -------- */
  function openCreate() {
    resetForm();
    setEditingId(null);
    setModalOpen(true);
  }
  function openEdit(row: Row) {
    setEditingId(row.id);
    setFormCarrier(row.carrierType);     // backend’de raw string (örn: "courier")
    setFormService(row.serviceName);
    setFormPrice(String(row.price));
    setModalOpen(true);
  }

  return (
    <div className="space-y-4">
      {/* Başlık */}
      <div className="px-2 sm:px-0 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Ek Hizmetler</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm hover:bg-neutral-50"
          >
            <RefreshCcw className="h-4 w-4" /> Yenile
          </button>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" /> Yeni Ekle
          </button>
        </div>
      </div>

      {/* Kart */}
      <section className="rounded-2xl border border-neutral-200/70 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full table-fixed">
            <thead>
              <tr className="text-left text-sm text-neutral-500">
                <th className="px-2 py-2 font-medium">Taşıycı Türü</th>
                <th className="px-2 py-2 font-medium">Hizmet Adı</th>
                <th className="w-60 px-6 py-2 font-medium">Ücret</th>
                <th className="w-64 px-6 py-2" />
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id} className="border-t border-neutral-200/70 align-middle">
                  <td className="px-6 py-4">
                    <span className="text-neutral-800">{r.carrierType}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-neutral-900">{r.serviceName}</span>
                  </td>
                  <td className="px-6 py-4 text-neutral-900 font-semibold">{r.price}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(r)}
                        className="inline-flex items-center gap-2 rounded-md bg-sky-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-700"
                      >
                        <Pencil className="h-4 w-4" /> Düzenle
                      </button>
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="inline-flex items-center gap-2 rounded-md bg-rose-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-rose-700"
                      >
                        <Trash2 className="h-4 w-4" /> Sil
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-sm text-neutral-500">
                    Kayıt yok. <strong>“Yeni Ekle”</strong> ile oluşturabilirsin.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {loading && (
          <div className="flex items-center gap-2 px-6 py-3 text-sm text-neutral-600">
            <Loader2 className="h-4 w-4 animate-spin" /> Yükleniyor…
          </div>
        )}
        {error && (
          <div className="m-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </div>
        )}
      </section>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl overflow-hidden">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <h3 className="text-xl font-semibold">
                {editingId ? 'Ek Hizmet Düzenle' : 'Yeni Ek Hizmet'}
              </h3>
              <button
                className="rounded-full p-2 hover:bg-neutral-100"
                onClick={() => { setModalOpen(false); resetForm(); }}
                aria-label="Kapat"
              >
                ✕
              </button>
            </div>

            <form onSubmit={submitForm} className="space-y-4 p-5">
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">Taşıyıcı Türü</label>
                <input
                  value={formCarrier}
                  onChange={(e) => setFormCarrier(e.target.value)}
                  placeholder='örn: "courier"'
                  className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-neutral-800 outline-none ring-2 ring-transparent transition focus:border-neutral-300 focus:ring-sky-200"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">Hizmet Adı</label>
                <input
                  value={formService}
                  onChange={(e) => setFormService(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-neutral-800 outline-none ring-2 ring-transparent transition focus:border-neutral-300 focus:ring-sky-200"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">Ücret</label>
                <input
                  type="number"
                  inputMode="decimal"
                  value={formPrice}
                  onChange={(e) => setFormPrice(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-neutral-800 outline-none ring-2 ring-transparent transition focus:border-neutral-300 focus:ring-sky-200"
                />
              </div>

              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="submit"
                  disabled={!canSave}
                  className="rounded-xl bg-emerald-600 px-6 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700 disabled:opacity-50"
                >
                  Kaydet
                </button>
                <button
                  type="button"
                  onClick={() => { setModalOpen(false); resetForm(); }}
                  className="rounded-xl bg-rose-100 px-6 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-200"
                >
                  İptal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

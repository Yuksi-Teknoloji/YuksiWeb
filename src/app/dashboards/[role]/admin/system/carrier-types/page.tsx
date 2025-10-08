// src/app/dashboards/[role]/admin/system/carrier-types/page.tsx
'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || 'http://40.90.226.14:8080').replace(/\/+$/, '');

type VehicleTypeApi = {
  id: number;
  name: string;
  description: string;
  baseKm: number;
  baseFare: number;
  fareForPerKm: number;
  fileId?: number;
  filePath?: string;
  fileName?: string;
};

type Row = {
  id: number;
  name: string;
  description: string;
  baseKm: number;
  baseFare: number;
  fareForPerKm: number;
  fileId?: number;
  imageUrl?: string | null;
  fileName?: string | null;
};

function toFullUrl(path?: string | null) {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
}

export default function CarrierTypesPage() {
  const { role } = useParams<{ role: string }>();

  const [rows, setRows] = React.useState<Row[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [openCreate, setOpenCreate] = React.useState(false);
  const [editRow, setEditRow] = React.useState<Row | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/Vehicle/types`, { cache: 'no-store' });
      const txt = await res.text();
      const j = txt ? JSON.parse(txt) : null;

      if (!res.ok) {
        const msg = j?.message || j?.title || `HTTP ${res.status}`;
        throw new Error(msg);
      }

      const list: VehicleTypeApi[] = Array.isArray(j?.data) ? j.data : (Array.isArray(j) ? j : []);
      const mapped: Row[] = list.map(v => ({
        id: v.id,
        name: v.name,
        description: v.description,
        baseKm: v.baseKm,
        baseFare: v.baseFare,
        fareForPerKm: v.fareForPerKm,
        fileId: v.fileId,
        imageUrl: toFullUrl(v.filePath),
        fileName: v.fileName ?? null,
      }));

      setRows(mapped);
    } catch (e: any) {
      setError(e?.message || 'Taşıyıcı türleri alınamadı.');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { load(); }, [load]);

  async function handleDelete(id: number) {
    if (!confirm('Bu kaydı silmek istediğine emin misin?')) return;
    const prev = rows;
    setRows(p => p.filter(r => r.id !== id)); // optimistic
    try {
      const res = await fetch(`${API_BASE}/api/Vehicle/types/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        setRows(prev);
        const t = await res.text();
        let msg = 'Silinemedi.';
        try { msg = (t && JSON.parse(t)?.message) || msg; } catch {}
        throw new Error(msg);
      }
    } catch (e: any) {
      alert(e?.message || 'Silinemedi.');
    }
  }

  return (
    <main className="card">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 p-6">
        <h2 className="text-lg font-semibold">Taşıyıcı Türleri</h2>
        <button
          onClick={() => setOpenCreate(true)}
          className="btn-accent rounded-2xl bg-orange-500 text-white px-4 py-2 text-sm font-medium shadow-sm transition active:translate-y-px"
        >
          Yeni Taşıyıcı Türü Ekle
        </button>
      </div>

      <div className="h-px w-full bg-neutral-200" />

      {error && <div className="px-6 py-3 text-sm text-rose-600">{error}</div>}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full table-fixed text-[13px]">
          <thead>
            <tr className="text-left text-sm text-neutral-500">
              <th className="px-3 py-2 font-medium">Resim</th>
              <th className="px-3 py-2 font-medium">Taşıyıcı Türü</th>
              <th className="px-3 py-2 font-medium">Açıklama</th>
              <th className="px-3 py-2 font-medium">Açılış Km</th>
              <th className="px-3 py-2font-medium">Açılış Fiyatı</th>
              <th className="px-3 py-2 font-medium">Km Fiyatı</th>
              <th className="px-3 py-2" />
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

            {!loading && rows.map(r => (
              <tr key={r.id} className="border-t border-neutral-200 align-middle">
                <td className="px-6 py-5">
                  {r.imageUrl ? (
                    <img
                      src={r.imageUrl}
                      alt={r.fileName || r.name}
                      className="h-16 w-auto rounded-xl bg-white object-contain ring-1 ring-neutral-200"
                    />
                  ) : (
                    <div className="grid h-16 w-24 place-items-center rounded-xl bg-neutral-100 text-xs text-neutral-500 ring-1 ring-neutral-200">
                      Görsel yok
                    </div>
                  )}
                </td>
                <td className="px-6 py-5">
                  <div className="font-semibold text-neutral-900">{r.name}</div>
                </td>
                <td className="px-6 py-5 text-neutral-700">{r.description}</td>
                <td className="px-6 py-5 text-neutral-900">{r.baseKm}</td>
                <td className="px-6 py-5 text-neutral-900">{r.baseFare}</td>
                <td className="px-6 py-5 text-neutral-900">{r.fareForPerKm}</td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditRow(r)}
                      className="rounded-xl bg-emerald-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-600 active:translate-y-px"
                    >
                      Düzenle
                    </button>
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="rounded-xl bg-red-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-600 active:translate-y-px"
                      aria-label={`Sil: ${r.name}`}
                    >
                      Sil
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-sm text-neutral-500">
                  Henüz kayıt yok. Sağ üstten <strong>“Yeni Taşıyıcı Türü Ekle”</strong> ile ekleyebilirsin.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {openCreate && (
        <UpsertModal
          mode="create"
          onClose={() => setOpenCreate(false)}
          onSaved={async () => { setOpenCreate(false); await load(); }}
        />
      )}

      {editRow && (
        <UpsertModal
          mode="edit"
          row={editRow}
          onClose={() => setEditRow(null)}
          onSaved={async () => { setEditRow(null); await load(); }}
        />
      )}
    </main>
  );
}

/* ---------------------- Create / Edit Modal ---------------------- */

function UpsertModal({
  mode,
  row,
  onClose,
  onSaved,
}: {
  mode: 'create' | 'edit';
  row?: Row;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = React.useState(row?.name ?? '');
  const [description, setDescription] = React.useState(row?.description ?? '');
  const [baseKm, setBaseKm] = React.useState<number | ''>(row?.baseKm ?? '');
  const [baseFare, setBaseFare] = React.useState<number | ''>(row?.baseFare ?? '');
  const [fareForPerKm, setFareForPerKm] = React.useState<number | ''>(row?.fareForPerKm ?? '');
  const [fileId, setFileId] = React.useState<number | ''>(row?.fileId ?? '');

  const [saving, setSaving] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setErr(null);
    try {
      const payload: VehicleTypeApi = {
        id: row?.id ?? 0,
        name,
        description,
        baseKm: Number(baseKm || 0),
        baseFare: Number(baseFare || 0),
        fareForPerKm: Number(fareForPerKm || 0),
        fileId: fileId === '' ? 0 : Number(fileId),
      };

      const res = await fetch(`${API_BASE}/api/Vehicle/types`, {
        method: mode === 'create' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const txt = await res.text();
      const j = txt ? JSON.parse(txt) : null;

      if (!res.ok) {
        const msg = j?.message || j?.title || `HTTP ${res.status}`;
        throw new Error(msg);
      }

      onSaved();
    } catch (e: any) {
      setErr(e?.message || 'Kaydedilemedi.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-3xl rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h3 className="text-xl font-semibold">
            {mode === 'create' ? 'Yeni Taşıyıcı Türü Ekle' : `Taşıyıcı Türünü Düzenle (ID: ${row?.id})`}
          </h3>
          <button className="rounded-full p-2 hover:bg-neutral-100" onClick={onClose} aria-label="Kapat">✕</button>
        </div>

        {/* Body */}
        <form onSubmit={submit} className="space-y-4 p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label">Ad</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 text-neutral-800 outline-none ring-2 ring-transparent transition focus:bg-white focus:ring-sky-200"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="label">Açıklama</label>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 text-neutral-800 outline-none ring-2 ring-transparent transition focus:bg-white focus:ring-sky-200"
              />
            </div>

            <div>
              <label className="label">Açılış Km</label>
              <input
                type="number"
                value={baseKm}
                onChange={(e) => setBaseKm(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 outline-none ring-2 ring-transparent transition focus:bg-white focus:ring-sky-200"
              />
            </div>

            <div>
              <label className="label">Açılış Fiyatı</label>
              <input
                type="number"
                value={baseFare}
                onChange={(e) => setBaseFare(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 outline-none ring-2 ring-transparent transition focus:bg-white focus:ring-sky-200"
              />
            </div>

            <div>
              <label className="label">Km Fiyatı</label>
              <input
                type="number"
                value={fareForPerKm}
                onChange={(e) => setFareForPerKm(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 outline-none ring-2 ring-transparent transition focus:bg-white focus:ring-sky-200"
              />
            </div>

            <div>
              <label className="label">File Id (opsiyonel)</label>
              <input
                type="number"
                value={fileId}
                onChange={(e) => setFileId(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 outline-none ring-2 ring-transparent transition focus:bg-white focus:ring-sky-200"
              />
              <p className="mt-1 text-xs text-neutral-500">
                Görsel upload endpoint’iniz varsa oradan dönen <strong>fileId</strong>’yi girin.
              </p>
            </div>
          </div>

          {err && <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{err}</div>}

          {/* Footer */}
          <div className="mt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              className="rounded-xl bg-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-300"
              onClick={onClose}
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={saving || !name}
              className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-600 disabled:opacity-50"
            >
              {saving ? 'Kaydediliyor…' : (mode === 'create' ? 'Kaydet' : 'Güncelle')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
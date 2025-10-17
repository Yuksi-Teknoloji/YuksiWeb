// src/app/dashboards/[role]/admin/system/carrier-types/page.tsx
'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { API_BASE } from '@/configs/api';

/* ---------------- helpers ---------------- */
type JwtPayload = { userId?: string; sub?: string };
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  const keys = ['auth_token', 'token', 'access_token', 'jwt', 'auth'];
  for (const k of keys) {
    const v = localStorage.getItem(k);
    if (v && v.trim()) return v.replace(/^Bearer\s+/i, '').trim();
  }
  return null;
}
function parseUserIdFromToken(tok: string | null): string | null {
  if (!tok) return null;
  const p = tok.split('.');
  if (p.length < 2) return null;
  try {
    const json = atob(p[1].replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(p[1].length / 4) * 4, '='));
    const payload: JwtPayload = JSON.parse(json || '{}');
    return (payload.userId || payload.sub || '') || null;
  } catch { return null; }
}
async function readJson<T = any>(res: Response): Promise<T> {
  const t = await res.text();
  try { return t ? JSON.parse(t) : (null as any); } catch { return (t as any); }
}
const pickMsg = (d: any, fallback: string) => d?.message || d?.detail || d?.title || d?.error || fallback;

/* ---------- API models (CarrierType service) ---------- */
type CarrierApi = {
  id: number;
  name: string;
  start_km: number;
  start_price: number;
  km_price: number;
  image_file_id?: string | null;
  // bazı servisler URL de döndürüyor olabilir:
  image_url?: string | null;
};

type Row = {
  id: number;
  name: string;
  start_km: number;
  start_price: number;
  km_price: number;
  image_file_id?: string | null;
  image_url?: string | null;
};

export default function CarrierTypesPage() {
  const { role } = useParams<{ role: string }>();

  const [rows, setRows] = React.useState<Row[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [openCreate, setOpenCreate] = React.useState(false);
  const [editRow, setEditRow] = React.useState<Row | null>(null);

  const token = React.useMemo(() => getAuthToken(), []);
  const authHeader = React.useMemo<HeadersInit>(() => {
    const h: HeadersInit = { Accept: 'application/json' };
    if (token) (h as any).Authorization = `Bearer ${token}`;
    return h;
  }, [token]);

  const load = React.useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`/yuksi/CarrierType/list`, { cache: 'no-store', headers: authHeader });
      const j: any = await readJson(res);
      if (!res.ok || j?.success === false) {
        throw new Error(pickMsg(j, `HTTP ${res.status}`));
      }
      const data: CarrierApi[] = Array.isArray(j?.data) ? j.data : (Array.isArray(j) ? j : []);
      const mapped: Row[] = data.map(d => ({
        id: Number(d.id),
        name: d.name,
        start_km: Number(d.start_km ?? 0),
        start_price: Number(d.start_price ?? 0),
        km_price: Number(d.km_price ?? 0),
        image_file_id: d.image_file_id ?? null,
        image_url: d.image_url ?? null,
      }));
      setRows(mapped);
    } catch (e: any) {
      setError(e?.message || 'Taşıyıcı türleri alınamadı.');
    } finally {
      setLoading(false);
    }
  }, [authHeader]);

  React.useEffect(() => { load(); }, [load, role]);

  async function handleDelete(id: number) {
    if (!confirm('Bu taşıyıcı türü silinsin mi?')) return;
    const prev = rows;
    setRows(p => p.filter(r => r.id !== id)); // optimistic
    try {
      const res = await fetch(`/yuksi/CarrierType/delete/${id}`, {
        method: 'DELETE',
        headers: authHeader,
      });
      const j = await readJson(res);
      if (!res.ok || j?.success === false) {
        setRows(prev);
        throw new Error(pickMsg(j, `HTTP ${res.status}`));
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
              <th className="px-3 py-2 font-medium">Görsel</th>
              <th className="px-3 py-2 font-medium">Ad</th>
              <th className="px-3 py-2 font-medium">Açılış Km</th>
              <th className="px-3 py-2 font-medium">Açılış Ücreti</th>
              <th className="px-3 py-2 font-medium">Km Ücreti</th>
              <th className="px-3 py-2" />
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

            {!loading && rows.map(r => (
              <tr key={r.id} className="border-t border-neutral-200 align-middle">
                <td className="px-6 py-5">
                  {r.image_url ? (
                    <img
                      src={r.image_url}
                      alt={r.name}
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
                  {r.image_file_id && (
                    <div className="text-xs text-neutral-500">file_id: {r.image_file_id}</div>
                  )}
                </td>
                <td className="px-6 py-5 tabular-nums">{r.start_km}</td>
                <td className="px-6 py-5 tabular-nums">{r.start_price}</td>
                <td className="px-6 py-5 tabular-nums">{r.km_price}</td>
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
                <td colSpan={6} className="px-6 py-12 text-center text-sm text-neutral-500">
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
          authHeader={authHeader}
          onClose={() => setOpenCreate(false)}
          onSaved={async () => { setOpenCreate(false); await load(); }}
        />
      )}

      {editRow && (
        <UpsertModal
          mode="edit"
          authHeader={authHeader}
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
  authHeader,
  onClose,
  onSaved,
}: {
  mode: 'create' | 'edit';
  row?: Row;
  authHeader: HeadersInit;
  onClose: () => void;
  onSaved: () => void;
}) {
  const token = React.useMemo(() => getAuthToken(), []);
  const userId = React.useMemo(() => parseUserIdFromToken(token) || 'unknown', [token]);

  const [name, setName] = React.useState(row?.name ?? '');
  const [startKm, setStartKm] = React.useState<number | ''>(row?.start_km ?? '');
  const [startPrice, setStartPrice] = React.useState<number | ''>(row?.start_price ?? '');
  const [kmPrice, setKmPrice] = React.useState<number | ''>(row?.km_price ?? '');
  const [imageFileId, setImageFileId] = React.useState<string | null>(row?.image_file_id ?? null);
  const [imagePreview, setImagePreview] = React.useState<string | null>(row?.image_url ?? null);
  const [uploading, setUploading] = React.useState(false);

  const [saving, setSaving] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  async function handleUpload(file: File) {
  setUploading(true);
  setErr(null);
  try {
    const token = getAuthToken(); // mevcut aldığın token
    const fd = new FormData();
    fd.append('user_id', userId);       // swagger’da zorunlu
    fd.append('file', file);            // binary

    const res = await fetch('/yuksi/file/upload', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: fd, // Content-Type'ı fetch ayarlasın
    });

    const txt = await res.text();
    let j: any = null;
    try { j = txt ? JSON.parse(txt) : null; } catch {}

    if (!res.ok) {
      throw new Error((j && (j.message || j.title || j.detail)) || `HTTP ${res.status}`);
    }

    // Swagger: { id: "uuid" }
    const returnedId =
      (j && (j.id || j.file_id || j.data || j?.data?.id)) || '';

    if (!returnedId) throw new Error('Yükleme başarılı ama dosya id gelmedi.');

    setImageFileId(String(returnedId));
    setImagePreview(URL.createObjectURL(file));
  } catch (e: any) {
    setErr(e?.message || 'Dosya yüklenemedi.');
  } finally {
    setUploading(false);
  }
}

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setErr(null);
    try {
      const payload = {
        name,
        start_km: Number(startKm || 0),
        start_price: Number(startPrice || 0),
        km_price: Number(kmPrice || 0),
        image_file_id: imageFileId ?? '',
      };

      const url =
        mode === 'create'
          ? `/yuksi/CarrierType/create`
          : `/yuksi/CarrierType/update/${row!.id}`;

      const res = await fetch(url, {
        method: mode === 'create' ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify(payload),
      });

      const j = await readJson(res);
      if (!res.ok || j?.success === false) {
        throw new Error(pickMsg(j, `HTTP ${res.status}`));
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

            <div>
              <label className="label">Açılış Km (start_km)</label>
              <input
                type="number"
                value={startKm}
                onChange={(e) => setStartKm(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 outline-none ring-2 ring-transparent transition focus:bg-white focus:ring-sky-200"
              />
            </div>

            <div>
              <label className="label">Açılış Ücreti (start_price)</label>
              <input
                type="number"
                value={startPrice}
                onChange={(e) => setStartPrice(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 outline-none ring-2 ring-transparent transition focus:bg-white focus:ring-sky-200"
              />
            </div>

            <div>
              <label className="label">Km Ücreti (km_price)</label>
              <input
                type="number"
                value={kmPrice}
                onChange={(e) => setKmPrice(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 outline-none ring-2 ring-transparent transition focus:bg-white focus:ring-sky-200"
              />
            </div>

            <div>
              <label className="label">Görsel (image_file_id)</label>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void handleUpload(f);
                  }}
                />
                {uploading && <span className="text-sm text-neutral-600">Yükleniyor…</span>}
              </div>
              {imageFileId && (
                <div className="mt-2 text-xs text-neutral-600">
                  Yüklendi: <span className="font-mono">{imageFileId}</span>
                </div>
              )}
              {imagePreview && (
                <img src={imagePreview} alt="Önizleme" className="mt-2 h-20 w-auto rounded-lg ring-1 ring-neutral-200 object-contain bg-white" />
              )}
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

/* ---------------- small utilities (styles) ---------------- */
declare global {
  // tailwind yardımcı class adlarını kullandım
  interface HTMLElementTagNameMap { }
}

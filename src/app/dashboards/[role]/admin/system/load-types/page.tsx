// src/app/dashboards/[role]/admin/system/load-types/page.tsx
'use client';

import * as React from 'react';
import { getAuthToken } from '@/utils/auth';

/* ===== API tipleri ===== */
type ApiCargoType = {
  id: number;
  name: string;
  price: number;
  description: string;
};

type Row = {
  id: number;
  name: string;        // Çeşit Adı
  extraPrice: number;  // price
  description: string;
};

/* ===== yardımcılar ===== */
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

export default function LoadTypesPage() {
  const token = React.useMemo(getAuthToken, []);
  const headers = React.useMemo<HeadersInit>(() => bearerHeaders(token), [token]);

  const [rows, setRows] = React.useState<Row[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [open, setOpen] = React.useState<false | { mode: 'create' } | { mode: 'edit'; row: Row }>(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Proxy: /yuksi + (swagger’daki /api/CargoType -> /CargoType)
      const res = await fetch('/yuksi/CargoType', { cache: 'no-store', headers });
      const json = await readJson(res);
      if (!res.ok) throw new Error(pickMsg(json, `HTTP ${res.status}`));

      const list: ApiCargoType[] = Array.isArray(json?.data)
        ? json.data
        : Array.isArray(json) ? json : [];

      const mapped: Row[] = list.map((it) => ({
        id: Number(it.id),
        name: String(it.name ?? '-'),
        extraPrice: Number(it.price) || 0,
        description: String(it.description ?? ''),
      }));

      setRows(mapped);
    } catch (e: any) {
      setError(e?.message || 'Yük tipleri alınamadı.');
    } finally {
      setLoading(false);
    }
  }, [headers]);

  React.useEffect(() => { load(); }, [load]);

  async function handleDelete(id: number) {
    if (!confirm('Bu yük tipini silmek istiyor musun?')) return;

    const prev = rows;
    setRows((p) => p.filter((r) => r.id !== id)); // optimistic

    try {
      const res = await fetch(`/yuksi/CargoType/${id}`, { method: 'DELETE', headers });
      const j = await readJson(res);
      if (!res.ok) {
        setRows(prev);
        throw new Error(pickMsg(j, `HTTP ${res.status}`));
      }
    } catch (e: any) {
      alert(e?.message || 'Silinemedi.');
    }
  }

  return (
    <div className="space-y-4">
      <div className="px-2 sm:px-0">
        <h1 className="text-2xl font-semibold tracking-tight">Yük Tipleri</h1>
      </div>

      <section className="rounded-2xl border border-neutral-200/70 bg-white shadow-sm">
        <div className="flex items-center justify-between p-5 sm:p-6">
          <button
            onClick={() => setOpen({ mode: 'create' })}
            className="btn-accent rounded-2xl bg-orange-500 text-white px-4 py-2 text-sm font-medium shadow-sm transition active:translate-y-px"
          >
            Ana Çeşit Ekle
          </button>
          <button
            onClick={load}
            className="rounded-xl bg-neutral-200 px-4 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-300"
          >
            Yenile
          </button>
        </div>

        {error && <div className="px-6 pb-2 text-sm text-rose-600">{error}</div>}

        <div className="h-px w-full bg-neutral-200/70" />

        <div className="overflow-x-auto">
          <table className="min-w-full table-fixed text-[13px]">
            <thead>
              <tr className="text-left text-sm text-neutral-500">
                <th className="px-4 py-3 font-medium">Çeşit Adı</th>
                <th className="w-40 px-4 py-3 font-medium">Ekstra Fiyat</th>
                <th className="px-4 py-3 font-medium">Açıklama</th>
                <th className="w-44 px-4 py-3" />
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-neutral-500">
                    Yükleniyor…
                  </td>
                </tr>
              )}

              {!loading && rows.map((r) => (
                <tr key={r.id} className="border-t border-neutral-200/70 align-middle">
                  <td className="px-4 py-3">
                    <span className="font-semibold text-neutral-900">{r.name}</span>
                  </td>
                  <td className="px-4 py-3 text-neutral-900">
                    {Number.isFinite(r.extraPrice) ? r.extraPrice : 0}
                  </td>
                  <td className="px-4 py-3 text-neutral-700">
                    <div className="line-clamp-2">{r.description || '-'}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setOpen({ mode: 'edit', row: r })}
                        className="rounded-md bg-emerald-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-600"
                      >
                        Düzenle
                      </button>
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="rounded-md bg-red-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-600 active:translate-y-px"
                      >
                        Sil
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-sm text-neutral-500">
                    Henüz yük tipi yok. Üstteki <strong>“Ana Çeşit Ekle”</strong> ile ekleyebilirsin.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-5 pb-5">
          <div className="h-2 rounded-full bg-purple-200/60">
            <div className="h-2 w-24 rounded-full bg-purple-400/60" />
          </div>
        </div>
      </section>

      {open && (
        <UpsertLoadTypeModal
          mode={open.mode}
          row={open.mode === 'edit' ? open.row : undefined}
          headers={headers}
          onClose={() => setOpen(false)}
          onSaved={async () => { setOpen(false); await load(); }}
        />
      )}
    </div>
  );
}

/* ---------------- Modal: Ekle/Düzenle (JSON) ---------------- */

function UpsertLoadTypeModal({
  mode,
  row,
  headers,
  onClose,
  onSaved,
}: {
  mode: 'create' | 'edit';
  row?: Row;
  headers: HeadersInit;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = React.useState(row?.name ?? '');
  const [price, setPrice] = React.useState<string>(row ? String(row.extraPrice) : '');
  const [description, setDescription] = React.useState(row?.description ?? '');
  const [saving, setSaving] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErr(null);
    try {
      const body = {
        name: name.trim(),
        price: price === '' ? 0 : Number(price),
        description: description.trim(),
      };

      const url =
        mode === 'create'
          ? '/yuksi/CargoType'
          : `/yuksi/CargoType/${row!.id}`;

      const res = await fetch(url, {
        method: mode === 'create' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify(body),
      });
      const j = await readJson(res);
      if (!res.ok) throw new Error(pickMsg(j, `HTTP ${res.status}`));

      await onSaved();
    } catch (e: any) {
      setErr(e?.message || 'Kayıt kaydedilemedi.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-4xl rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h3 className="text-2xl font-semibold">
            {mode === 'create' ? 'Yeni yük tipi ekle' : `Yük tipini düzenle (ID: ${row?.id})`}
          </h3>
          <button className="rounded-full p-2 hover:bg-neutral-100" onClick={onClose} aria-label="Kapat">✕</button>
        </div>

        <form onSubmit={submit} className="space-y-4 p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-neutral-700">Yük Tipi</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-neutral-800 outline-none ring-2 ring-transparent transition focus:border-neutral-300 focus:ring-sky-200"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">Ekstra Fiyat</label>
              <input
                type="number"
                inputMode="decimal"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-neutral-800 outline-none ring-2 ring-transparent transition focus:border-neutral-300 focus:ring-sky-200"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">Açıklama</label>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-neutral-800 outline-none ring-2 ring-transparent transition focus:border-neutral-300 focus:ring-sky-200"
              />
            </div>
          </div>

          {err && (
            <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {err}
            </div>
          )}

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="submit"
              className="rounded-xl bg-emerald-500 px-6 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-600 disabled:opacity-50"
              disabled={!name.trim() || saving}
            >
              {saving ? 'Kaydediliyor…' : (mode === 'create' ? 'Kaydet' : 'Güncelle')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-rose-100 px-6 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-200"
            >
              İptal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

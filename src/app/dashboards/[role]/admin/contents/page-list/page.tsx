// src/app/dashboards/[role]/admin/contents/page-list/page.tsx
'use client';

import * as React from 'react';
import MiniRTE from '@/components/subsect/MiniRTE';

/* ---------- API tipleri ---------- */
type ApiSubSection = {
  id: number;
  title: string;
  contentType: string | number;  // GET: string, PUT: number
  showInMenu: boolean;
  showInFooter: boolean;
  content: string;
  isActive: boolean;
  isDeleted: boolean;
};

type ContentRow = {
  id: string;
  title: string;
  type: 'page' | 'post';
  badge?: string;
  raw: ApiSubSection;
};

/* ---------- ContentType eşleştirme (string <-> enum) ---------- */
const CONTENT_TYPES: { value: number; label: string }[] = [
  { value: 1, label: 'Destek' },
  { value: 2, label: 'Hakkimizda' },
  { value: 3, label: 'Iletisim' },
  { value: 4, label: 'GizlilikPolitikasi' },
  { value: 5, label: 'KullanimKosullari' },
];

const enumToLabel = (v: number) =>
  CONTENT_TYPES.find(x => x.value === v)?.label ?? 'Destek';

const labelToEnum = (lbl: string) =>
  CONTENT_TYPES.find(
    x => x.label.toLowerCase() === String(lbl).trim().toLowerCase()
  )?.value ?? 1;

/* ---------- API BASE ---------- */
const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || 'http://40.90.226.14:8080').replace(/\/+$/, '');

export default function ContentPageList() {
  const [rows, setRows] = React.useState<ContentRow[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [openCreate, setOpenCreate] = React.useState(false);
  const [editRow, setEditRow] = React.useState<ContentRow | null>(null);

  const [okMsg, setOkMsg] = React.useState<string | null>(null);
  const [globalErr, setGlobalErr] = React.useState<string | null>(null);

  /* -------- LIST (GET /api/SubSection) -------- */
  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch(`${API_BASE}/api/SubSection`, { cache: 'no-store' });
      const t = await r.text();
      const j = t ? JSON.parse(t) : null;
      if (!r.ok) throw new Error(j?.message || j?.title || `HTTP ${r.status}`);

      let list: ApiSubSection[] = Array.isArray(j?.data) ? j.data : [];

      // 🔎 Sadece aktif ve silinmemiş kayıtlar
      list = list.filter(it => it.isActive === true && it.isDeleted === false);

      const mapped: ContentRow[] = list.map(it => ({
        id: String(it.id),
        title: it.title ?? '-',
        type: 'page',
        badge: it.showInMenu || it.showInFooter ? 'YÜKSİ' : undefined,
        raw: it,
      }));
      setRows(mapped);
    } catch (e: any) {
      setError(e?.message || 'Alt bölüm listesi alınamadı.');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { load(); }, [load]);

  /* -------- SOFT DELETE (Delete /api/SubSection/{Id}) -------- */

  function toNumericId(rowOrId: { id?: any } | string | number): number | null {
  const raw = typeof rowOrId === 'object' && rowOrId !== null ? (rowOrId as any).id : rowOrId;
  const n = Number(String(raw).trim());
  return Number.isFinite(n) ? n : null; }

  async function readProblem(res: Response): Promise<any> {
  const txt = await res.text();
  try { return txt ? JSON.parse(txt) : null; } catch { return txt || null; }
}

  async function handleDelete(idOrStr: string | number) {
  setGlobalErr(null);
  setOkMsg(null);
  try {
    const r = rows.find(x => String(x.id) === String(idOrStr));
    const subId = toNumericId(r ?? idOrStr);
    if (subId == null) throw new Error('Bu kayıt için sayısal Id bulunamadı.');

    if (!confirm('Silmek istediğine emin misin?')) return;

    const res = await fetch(`${API_BASE}/api/SubSection/${subId}`, { method: 'DELETE' });
    if (!res.ok) {
      const prob = await readProblem(res);
      const msg = typeof prob === 'string' ? prob : (prob?.title || prob?.message || `HTTP ${res.status}`);
      throw new Error(`Silinemedi: ${msg}`);
    }

    // UI’dan anında çıkar (optimistic)
    setRows(prev => prev.filter(x => toNumericId(x) !== subId));


    await load();

    setOkMsg('Kayıt silindi.');
  } catch (e: any) {
    setGlobalErr(e?.message || 'Silme işlemi başarısız.');
  }
}

  /* -------- EDIT open -------- */
  const openEdit = (id: string) => {
    const r = rows.find(x => x.id === id) || null;
    if (r) setEditRow(r);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2 sm:px-0">
        <h1 className="text-2xl font-semibold tracking-tight">İçerik Listesi</h1>
        <div className="flex items-center gap-2">
          <button onClick={load} className="rounded-xl bg-neutral-200 px-4 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-300">
            Yenile
          </button>
          <button onClick={() => setOpenCreate(true)} className="btn-accent rounded-2xl bg-orange-500 text-white px-4 py-2 text-sm font-medium shadow-sm transition active:translate-y-px">
            Yeni Ekle
          </button>
        </div>
      </div>

      <section className="rounded-2xl border border-neutral-200/70 bg-white shadow-sm soft-card">
        <div className="overflow-x-auto">
          <table className="min-w-full table-fixed">
            <thead>
              <tr className="text-left text-sm text-neutral-500">
                <th className="px-6 py-3 font-medium">İçerik Başlığı</th>
                <th className="w-40 px-6 py-3 font-medium">Tür</th>
                <th className="w-60 px-6 py-3" />
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={3} className="px-6 py-10 text-center text-neutral-500">Yükleniyor…</td></tr>
              )}
              {!loading && error && (
                <tr><td colSpan={3} className="px-6 py-10 text-center text-rose-600">{error}</td></tr>
              )}
              {!loading && !error && rows.map(r => (
                <tr key={r.id} className="border-t border-neutral-200/70 align-middle">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {r.badge && <span className="inline-flex items-center rounded-sm bg-orange-500 px-2 py-0.5 text-[11px] font-semibold text-white">{r.badge}</span>}
                      <span className="font-semibold text-neutral-900">{r.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-neutral-700">
                    {typeof r.raw.contentType === 'number'
                      ? enumToLabel(r.raw.contentType)
                      : enumToLabel(labelToEnum(String(r.raw.contentType)))}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="rounded-md bg-red-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-600 active:translate-y-px"
                      >
                        Sil
                      </button>
                      <button
                        onClick={() => openEdit(r.id)}
                        className="rounded-md bg-green-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-600 active:translate-y-px"
                      >
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && !error && rows.length === 0 && (
                <tr><td colSpan={3} className="px-6 py-12 text-center text-sm text-neutral-500">Kayıt yok. Sağ üstten <strong>“Yeni Ekle”</strong> ile ekleyebilirsin.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {openCreate && (
        <CreateModal
          onClose={() => setOpenCreate(false)}
          onCreated={async () => {
            setOpenCreate(false);
            await load();
          }}
        />
      )}

      {editRow && (
        <EditModal
          row={editRow}
          onClose={() => setEditRow(null)}
          onUpdated={async () => {
            setEditRow(null);
            await load();
          }}
        />
      )}
    </div>
  );
}

/* ---------------------- CREATE (POST /api/SubSection) ---------------------- */
function CreateModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (created: ApiSubSection) => void;
}) {
  const [title, setTitle] = React.useState('');
  const [contentType, setContentType] = React.useState<number>(1); // Destek
  const [content, setContent] = React.useState('');

  const [saving, setSaving] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setErr(null);
    try {
      // yeni kayıtlar default aktif / silinmemiş
      const payload = {
        title,
        contentType,
        content,
        isActive: true,
        isDeleted: false,
      };
      const r = await fetch(`${API_BASE}/api/SubSection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        cache: 'no-store',
      });
      const t = await r.text();
      const d = t ? JSON.parse(t) : null;
      if (!r.ok) throw new Error(d?.message || d?.title || `HTTP ${r.status}`);

      const created: ApiSubSection = (d?.data ?? d) as ApiSubSection;
      onCreated(created);
    } catch (e: any) {
      setErr(e?.message || 'Kayıt oluşturulamadı.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-start overflow-y-auto bg-black/50 p-4">
      <div className="mx-auto w-full max-w-6xl rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h3 className="text-xl font-semibold">Yeni Alt Bölüm Oluştur</h3>
          <button className="rounded-full p-2 hover:bg-neutral-100" onClick={onClose} aria-label="Kapat">✕</button>
        </div>

        <form onSubmit={submit} className="space-y-6 p-5">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Başlık"
            className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-neutral-800 outline-none ring-2 ring-transparent transition focus:border-neutral-300 focus:ring-sky-200"
          />

          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700">Content Type</label>
            <select
              value={contentType}
              onChange={(e) => setContentType(Number(e.target.value))}
              className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2"
            >
              {CONTENT_TYPES.map(ct => (
                <option key={ct.value} value={ct.value}>{ct.label}</option>
              ))}
            </select>
          </div>

          <div className="rounded-xl border border-neutral-300">
            <MiniRTE value={content} onChange={setContent} height={280} />
          </div>

          {err && <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{err}</div>}

          <div className="flex items-center gap-3">
            <button type="button" onClick={onClose} className="rounded-xl px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100">Kapat</button>
            <button type="submit" disabled={saving || !title} className="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-600 disabled:opacity-60">
              {saving ? 'Kaydediliyor…' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ---------------------- EDIT (PUT /api/SubSection/{id}) ---------------------- */
function EditModal({
  onClose,
  row,
  onUpdated,
}: {
  onClose: () => void;
  row: ContentRow;
  onUpdated: (updated: ApiSubSection) => void;
}) {
  // GET’te contentType string gelebilir; PUT için integer’a çeviriyoruz.
  const initialTypeNumber =
    typeof row.raw.contentType === 'number'
      ? row.raw.contentType
      : labelToEnum(String(row.raw.contentType));

  const [title, setTitle] = React.useState(row.raw.title ?? '');
  const [contentType, setContentType] = React.useState<number>(initialTypeNumber);
  const [content, setContent] = React.useState(row.raw.content ?? '');
  const [saving, setSaving] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setErr(null);
    try {
      const payload = {
        id: Number(row.id),
        title,
        contentType,        // PUT’ta integer
        content,
        isActive: true,
        isDeleted: false,
      };
      const r = await fetch(`${API_BASE}/api/SubSection/${row.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        cache: 'no-store',
      });
      const t = await r.text();
      const d = t ? JSON.parse(t) : null;
      if (!r.ok) throw new Error(d?.message || d?.title || `HTTP ${r.status}`);

      const updated: ApiSubSection = (d?.data ?? d) as ApiSubSection;
      onUpdated(updated);
    } catch (e: any) {
      setErr(e?.message || 'Güncelleme başarısız.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-start overflow-y-auto bg-black/50 p-4">
      <div className="mx-auto w-full max-w-6xl rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h3 className="text-xl font-semibold">Alt Bölüm Düzenle (ID: {row.id})</h3>
          <button className="rounded-full p-2 hover:bg-neutral-100" onClick={onClose} aria-label="Kapat">✕</button>
        </div>

        <form onSubmit={submit} className="space-y-6 p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-neutral-700">Başlık</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2" />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-700">Content Type</label>
              <select value={contentType} onChange={(e) => setContentType(Number(e.target.value))} className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2">
                {CONTENT_TYPES.map(ct => <option key={ct.value} value={ct.value}>{ct.label}</option>)}
              </select>
            </div>
            <br />
          </div>

          <div className="rounded-xl border border-neutral-300">
            <MiniRTE value={content} onChange={setContent} height={280} />
          </div>

          {err && <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{err}</div>}

          <div className="flex items-center gap-3">
            <button type="button" onClick={onClose} className="rounded-xl px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100">Kapat</button>
            <button type="submit" disabled={saving || !title} className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">
              {saving ? 'Kaydediliyor…' : 'Güncelle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

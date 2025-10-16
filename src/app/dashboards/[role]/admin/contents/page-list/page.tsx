// src/app/dashboards/[role]/admin/contents/page-list/page.tsx
'use client';

import * as React from 'react';
import MiniRTE from '@/components/subsect/MiniRTE';

/* ---------- Enum & yardımcılar ---------- */
// Backend enum’u
// 1: Destek, 2: Hakkimizda, 3: Iletisim, 4: GizlilikPolitikasi,
// 5: KullanimKosullari, 6: KuryeGizlilikSözlesmesi, 7: KuryeTasiyiciSözlesmesi
type ContentType = 1 | 2 | 3 | 4 | 5 | 6 | 7;

const CT_OPTIONS: { value: ContentType; label: string }[] = [
  { value: 1, label: 'Destek' },
  { value: 2, label: 'Hakkimizda' },
  { value: 3, label: 'Iletisim' },
  { value: 4, label: 'GizlilikPolitikasi' },
  { value: 5, label: 'KullanimKosullari' },
  { value: 6, label: 'KuryeGizlilikSözlesmesi' },
  { value: 7, label: 'KuryeTasiyiciSözlesmesi' },
];

const ctLabel = (v: ContentType) =>
  CT_OPTIONS.find(o => o.value === v)?.label ?? String(v);

/** API bazen string label dönerse de yakalayalım */
const ctFromAny = (raw: unknown): ContentType => {
  if (typeof raw === 'number') {
    const n = Math.trunc(raw);
    return ([1,2,3,4,5,6,7] as number[]).includes(n) ? (n as ContentType) : 1;
  }
  const s = String(raw || '').trim().toLowerCase();
  const hit = CT_OPTIONS.find(o => o.label.toLowerCase() === s);
  return (hit?.value ?? 1) as ContentType;
};

/* ---------- API tipleri (artık enum/int) ---------- */
type ApiSubSection = {
  id: number;
  title: string;
  content_type: ContentType;   // ← INT
  show_in_menu: boolean;
  show_in_footer: boolean;
  content: string;
  created_at?: string;
  updated_at?: string;
};

type ContentRow = {
  id: string;
  title: string;
  type: 'page';
  badge?: string;
  raw: ApiSubSection;
};

/* ---------- küçük yardımcılar ---------- */
async function readJson(res: Response) {
  const t = await res.text();
  try { return t ? JSON.parse(t) : null; } catch { return null; }
}
const pickMsg = (d: any, fallback: string) =>
  d?.message || d?.title || d?.detail || d?.error?.message || fallback;

export default function ContentPageList() {
  const [rows, setRows] = React.useState<ContentRow[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [openCreate, setOpenCreate] = React.useState(false);
  const [editRow, setEditRow] = React.useState<ContentRow | null>(null);

  const [okMsg, setOkMsg] = React.useState<string | null>(null);
  const [globalErr, setGlobalErr] = React.useState<string | null>(null);

  /* -------- LIST (GET /api/SubSection/all) -------- */
  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/yuksi/SubSection/all', { cache: 'no-store' });
      const j = await readJson(res);
      if (!res.ok) throw new Error(pickMsg(j, `HTTP ${res.status}`));

      // j.data[] içindeki content_type hem string hem int gelebilir → normalize et
      const arr: any[] = Array.isArray(j?.data) ? j.data : [];
      const mapped: ContentRow[] = arr.map((it) => {
        const ct: ContentType = ctFromAny(it?.content_type);
        const raw: ApiSubSection = {
          id: Number(it.id),
          title: it.title ?? '-',
          content_type: ct,
          show_in_menu: !!it.show_in_menu,
          show_in_footer: !!it.show_in_footer,
          content: String(it.content ?? ''),
          created_at: it.created_at,
          updated_at: it.updated_at,
        };
        return {
          id: String(raw.id),
          title: raw.title,
          type: 'page',
          badge: raw.show_in_menu || raw.show_in_footer ? 'YÜKSİ' : undefined,
          raw,
        };
      });

      setRows(mapped);
    } catch (e: any) {
      setError(e?.message || 'Alt bölüm listesi alınamadı.');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { load(); }, [load]);

  /* -------- DELETE (DELETE /api/SubSection/delete/{id}) -------- */
  async function handleDelete(idOrStr: string | number) {
    setGlobalErr(null);
    setOkMsg(null);
    try {
      const numericId = Number(String(idOrStr));
      if (!Number.isFinite(numericId)) throw new Error('Sayısal Id bulunamadı.');
      if (!confirm('Silmek istediğine emin misin?')) return;

      const res = await fetch(`/yuksi/SubSection/delete/${numericId}`, { method: 'DELETE' });
      const d = await readJson(res);
      if (!res.ok) throw new Error(pickMsg(d, `HTTP ${res.status}`));

      setRows((prev) => prev.filter((x) => Number(x.id) !== numericId));
      setOkMsg('Kayıt silindi.');
    } catch (e: any) {
      setGlobalErr(e?.message || 'Silme işlemi başarısız.');
    }
  }

  /* -------- EDIT open -------- */
  const openEdit = (id: string) => {
    const r = rows.find((x) => x.id === id) || null;
    if (r) setEditRow(r);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2 sm:px-0">
        <h1 className="text-2xl font-semibold tracking-tight">İçerik Listesi</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="rounded-xl bg-neutral-200 px-4 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-300"
          >
            Yenile
          </button>
          <button
            onClick={() => setOpenCreate(true)}
            className="btn-accent rounded-2xl bg-orange-500 text-white px-4 py-2 text-sm font-medium shadow-sm transition active:translate-y-px"
          >
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
              {!loading && !error && rows.map((r) => (
                <tr key={r.id} className="border-t border-neutral-200/70 align-middle">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {r.badge && (
                        <span className="inline-flex items-center rounded-sm bg-orange-500 px-2 py-0.5 text-[11px] font-semibold text-white">
                          {r.badge}
                        </span>
                      )}
                      <span className="font-semibold text-neutral-900">{r.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-neutral-700">{ctLabel(r.raw.content_type)}</td>
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
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-sm text-neutral-500">
                    Kayıt yok. Sağ üstten <strong>“Yeni Ekle”</strong> ile ekleyebilirsin.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {openCreate && (
        <CreateModal
          onClose={() => setOpenCreate(false)}
          onCreated={async () => { setOpenCreate(false); await load(); }}
        />
      )}

      {editRow && (
        <EditModal
          row={editRow}
          onClose={() => setEditRow(null)}
          onUpdated={async () => { setEditRow(null); await load(); }}
        />
      )}

      {(okMsg || globalErr) && (
        <div className="text-sm">
          {okMsg && (
            <div className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-700">
              {okMsg}
            </div>
          )}
          {globalErr && (
            <div className="mt-3 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-rose-700">
              {globalErr}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------------------- CREATE (POST /api/SubSection/create) ---------------------- */
function CreateModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (created: ApiSubSection) => void;
}) {
  const [title, setTitle] = React.useState('');
  const [contentType, setContentType] = React.useState<ContentType>(1); // Destek
  const [showInMenu, setShowInMenu] = React.useState(false);
  const [showInFooter, setShowInFooter] = React.useState(false);
  const [content, setContent] = React.useState('');

  const [saving, setSaving] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setErr(null);
    try {
      const payload = {
        title,
        content_type: contentType,       // ← INT
        show_in_menu: showInMenu,
        show_in_footer: showInFooter,
        content,
      };
      const r = await fetch('/yuksi/SubSection/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        cache: 'no-store',
      });
      const d = await readJson(r);
      if (!r.ok) throw new Error(pickMsg(d, `HTTP ${r.status}`));

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
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-neutral-700">Başlık</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Başlık"
                className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-700">Content Type</label>
              <select
                value={contentType}
                onChange={(e) => setContentType(Number(e.target.value) as ContentType)}
                className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2"
              >
                {CT_OPTIONS.map((ct) => (
                  <option key={ct.value} value={ct.value}>{ct.label}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-4">
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" checked={showInMenu} onChange={(e) => setShowInMenu(e.target.checked)} />
                Menüde Göster
              </label>
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" checked={showInFooter} onChange={(e) => setShowInFooter(e.target.checked)} />
                Footer’da Göster
              </label>
            </div>
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

/* ---------------------- EDIT (PATCH /api/SubSection/update) ---------------------- */
function EditModal({
  onClose,
  row,
  onUpdated,
}: {
  onClose: () => void;
  row: ContentRow;
  onUpdated: (updated: ApiSubSection) => void;
}) {
  const [title, setTitle] = React.useState(row.raw.title ?? '');
  const [contentType, setContentType] = React.useState<ContentType>(row.raw.content_type);
  const [showInMenu, setShowInMenu] = React.useState<boolean>(!!row.raw.show_in_menu);
  const [showInFooter, setShowInFooter] = React.useState<boolean>(!!row.raw.show_in_footer);
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
        content_type: contentType,   // ← INT
        show_in_menu: showInMenu,
        show_in_footer: showInFooter,
        content,
      };
      const r = await fetch('/yuksi/SubSection/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        cache: 'no-store',
      });
      const d = await readJson(r);
      if (!r.ok) throw new Error(pickMsg(d, `HTTP ${r.status}`));

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
              <select
                value={contentType}
                onChange={(e) => setContentType(Number(e.target.value) as ContentType)}
                className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2"
              >
                {CT_OPTIONS.map((ct) => <option key={ct.value} value={ct.value}>{ct.label}</option>)}
              </select>
            </div>

            <div className="flex items-center gap-4">
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" checked={showInMenu} onChange={(e) => setShowInMenu(e.target.checked)} />
                Menüde Göster
              </label>
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" checked={showInFooter} onChange={(e) => setShowInFooter(e.target.checked)} />
                Footer’da Göster
              </label>
            </div>
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

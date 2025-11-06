'use client';

import * as React from 'react';
import { X, Pencil, Trash2, Plus, RefreshCw } from 'lucide-react';
import { getAuthToken } from '@/utils/auth';

/* ================= Helpers ================= */
async function readJson<T = any>(res: Response): Promise<T> {
  const t = await res.text();
  try { return t ? JSON.parse(t) : (null as any); } catch { return (t as any); }
}
const pickMsg = (d: any, fb: string) => d?.message || d?.detail || d?.title || d?.error?.message || fb;

/* ================= API Types ================= */
type ApiCampaign = {
  id: string;
  title: string;
  discount_rate: number;
  rule: string;
  content: string;
  created_at?: string;
};

type ApiListResp = { success: boolean; message?: string; data?: ApiCampaign[] };

/* ================= UI Types ================= */
type Row = {
  id: string;
  title: string;
  discount: number;
  rule: string;
  content: string;
  createdAt?: string;
};

type FormState = {
  title: string;
  discount_rate: number | string;
  rule: string;
  content: string;
};

/* ================= Page ================= */
export default function CampaignsPage() {
  // auth
  const bearer = React.useMemo(() => getAuthToken(), []);
  const headers = React.useMemo<HeadersInit>(() => {
    const h: HeadersInit = { Accept: 'application/json' };
    if (bearer) (h as any).Authorization = `Bearer ${bearer}`;
    return h;
  }, [bearer]);

  // data
  const [rows, setRows] = React.useState<Row[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [q, setQ] = React.useState('');

  // modal
  const [isOpen, setIsOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  const [form, setForm] = React.useState<FormState>({
    title: '',
    discount_rate: '',
    rule: '',
    content: '',
  });

  function setFormKey<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  /* --------- LIST --------- */
  const load = React.useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch('/yuksi/admin/campaigns', { cache: 'no-store', headers });
      const j = await readJson<ApiListResp>(res);
      if (!res.ok || j?.success === false) throw new Error(pickMsg(j, `HTTP ${res.status}`));
      const list = Array.isArray(j?.data) ? j!.data! : (Array.isArray(j) ? (j as any) : []);
      const mapped: Row[] = (list as ApiCampaign[]).map((c: ApiCampaign) => ({
        id: c.id,
        title: c.title,
        discount: Number(c.discount_rate ?? 0),
        rule: c.rule,
        content: c.content,
        createdAt: c.created_at,
      }));
      setRows(mapped);
    } catch (e: any) {
      setError(e?.message || 'Kampanya listesi alınamadı.');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [headers]);

  React.useEffect(() => { load(); }, [load]);

  /* --------- MODAL --------- */
  function openCreate() {
    setEditingId(null);
    setForm({ title: '', discount_rate: '', rule: '', content: '' });
    setIsOpen(true);
  }
  function openEdit(r: Row) {
    setEditingId(r.id);
    setForm({
      title: r.title,
      discount_rate: r.discount,
      rule: r.rule,
      content: r.content,
    });
    setIsOpen(true);
  }
  function closeModal() { setIsOpen(false); }

  /* --------- CRUD --------- */
  async function save() {
    if (!form.title.trim()) return alert('Başlık zorunlu.');
    const payload = {
      title: String(form.title).trim(),
      discount_rate: Number(form.discount_rate || 0),
      rule: String(form.rule || ''),
      content: String(form.content || ''),
    };

    setSaving(true);
    try {
      if (editingId == null) {
        // CREATE
        const res = await fetch('/yuksi/admin/campaigns', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...headers },
          body: JSON.stringify(payload),
        });
        const j = await readJson(res);
        if (!res.ok || j?.success === false) throw new Error(pickMsg(j, `HTTP ${res.status}`));
      } else {
        // UPDATE
        const res = await fetch(`/yuksi/admin/campaigns/${encodeURIComponent(editingId)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', ...headers },
          body: JSON.stringify(payload),
        });
        const j = await readJson(res);
        if (!res.ok || j?.success === false) throw new Error(pickMsg(j, `HTTP ${res.status}`));
      }
      await load();
      setIsOpen(false);
    } catch (e: any) {
      alert(e?.message || 'Kaydetme başarısız.');
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm('Kampanyayı silmek istediğine emin misin?')) return;
    try {
      const res = await fetch(`/yuksi/admin/campaigns/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers,
      });
      const j = await readJson(res);
      if (!res.ok || j?.success === false) throw new Error(pickMsg(j, `HTTP ${res.status}`));
      await load();
    } catch (e: any) {
      alert(e?.message || 'Silme başarısız.');
    }
  }

  /* --------- FILTER --------- */
  const filtered = rows.filter(r => {
    const s = q.trim().toLowerCase();
    if (!s) return true;
    return (
      r.title.toLowerCase().includes(s) ||
      r.rule.toLowerCase().includes(s) ||
      r.content.toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Kampanyalar</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm hover:bg-neutral-50"
            title="Yenile"
          >
            <RefreshCw className="h-4 w-4" /> Yenile
          </button>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-orange-700"
          >
            <Plus className="h-4 w-4" /> Yeni Kampanya
          </button>
        </div>
      </div>

      {/* Top bar */}
      <section className="rounded-2xl border border-neutral-200/70 bg-white p-4 shadow-sm soft-card">
        <div className="flex items-end gap-3 flex-wrap">
          <div className="w-[360px]">
            <label className="mb-1 block text-sm font-semibold text-neutral-600">Ara</label>
            <input
              placeholder="Başlık / kural / içerik…"
              value={q}
              onChange={e => setQ(e.target.value)}
              className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 outline-none ring-2 ring-transparent transition focus:ring-sky-200"
            />
          </div>
        </div>
      </section>

      {/* List */}
      <section className="rounded-2xl border border-neutral-200/70 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-neutral-200/70 text-left text-sm text-neutral-500">
                <th className="px-6 py-3 font-medium w-[220px]">Başlık</th>
                <th className="px-6 py-3 font-medium w-[120px]">% İndirim</th>
                <th className="px-6 py-3 font-medium w-[240px]">Kural</th>
                <th className="px-6 py-3 font-medium">İçerik</th>
                <th className="px-6 py-3 font-medium w-[180px]">Oluşturma</th>
                <th className="px-6 py-3 w-[160px]" />
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-sm text-neutral-500">Yükleniyor…</td></tr>
              )}
              {!loading && error && (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-sm text-rose-600 whitespace-pre-wrap">{error}</td></tr>
              )}
              {!loading && !error && filtered.map(r => (
                <tr key={r.id} className="border-t border-neutral-200/70 align-top hover:bg-neutral-50">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-neutral-900">{r.title}</div>
                  </td>
                  <td className="px-6 py-4">{r.discount}</td>
                  <td className="px-6 py-4">{r.rule}</td>
                  <td className="px-6 py-4">
                    <div className="line-clamp-2 max-w-[520px] text-sm text-neutral-800">{r.content}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-600">
                    {r.createdAt ? new Date(r.createdAt).toLocaleString('tr-TR') : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEdit(r)}
                        className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-600"
                      >
                        <Pencil className="h-4 w-4" /> Düzenle
                      </button>
                      <button
                        onClick={() => remove(r.id)}
                        className="inline-flex items-center gap-2 rounded-lg bg-rose-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-rose-600"
                      >
                        <Trash2 className="h-4 w-4" /> Sil
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && !error && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-neutral-500">Kayıt bulunamadı.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-auto rounded-2xl bg-white shadow-xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-200/70 bg-white p-4">
              <div className="text-lg font-semibold">
                {editingId == null ? 'Yeni Kampanya' : `Kampanya Düzenle (#${editingId})`}
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100"
                aria-label="Kapat"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-3 p-4">
              <Input label="Başlık" value={form.title} onChange={(v) => setFormKey('title', v)} />
              <NumberInput
                label="İndirim Oranı (%)"
                value={form.discount_rate}
                onChange={(v) => setFormKey('discount_rate', v)}
              />
              <Input label="Kural" value={form.rule} onChange={(v) => setFormKey('rule', v)} />
              <TextArea label="İçerik" rows={6} value={form.content} onChange={(v) => setFormKey('content', v)} />

              <div className="mt-2 flex items-center justify-end gap-3">
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-xl bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600 ring-1 ring-rose-200 hover:bg-rose-100"
                >
                  İptal
                </button>
                <button
                  onClick={save}
                  disabled={saving}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700 disabled:opacity-60"
                >
                  {saving ? 'Kaydediliyor…' : 'Kaydet'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= Inputs ================= */
function Input({
  label, value, onChange, type = 'text',
}: { label: string; value: string; onChange: (v: string) => void; type?: React.HTMLInputTypeAttribute; }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-semibold text-neutral-700">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 outline-none ring-2 ring-transparent transition focus:ring-sky-200"
      />
    </div>
  );
}

function NumberInput({
  label, value, onChange,
}: { label: string; value: number | string; onChange: (v: number) => void; }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-semibold text-neutral-700">{label}</label>
      <input
        type="number"
        value={String(value ?? 0)}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 outline-none ring-2 ring-transparent transition focus:ring-sky-200"
      />
    </div>
  );
}

function TextArea({
  label, value, onChange, rows = 5,
}: { label: string; value: string; onChange: (v: string) => void; rows?: number; }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-semibold text-neutral-700">{label}</label>
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 outline-none ring-2 ring-transparent transition focus:ring-sky-200"
      />
    </div>
  );
}

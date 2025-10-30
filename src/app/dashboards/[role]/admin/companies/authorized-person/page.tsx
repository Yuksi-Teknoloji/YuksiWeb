// src/app/dashboards/[role]/admin/user-list/page.tsx
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getAuthToken } from '@/utils/auth';

/* ================= Helpers ================= */
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

/* ================= Types ================= */
type CompanyItem = {
  id: string;
  companyName: string;
  companyTrackingNo?: string;
};

type ManagerItem = {
  id: string;                // manager_id (uuid)
  nameSurname: string;
  email?: string | null;
  phone?: string | null;
  createdAt?: string | null; // opsiyonel
};

/* Swagger bazı yerlerde "string" örneği dönüyor; tolerant parse */
function parseManagers(j: any): ManagerItem[] {
  if (Array.isArray(j)) return j as ManagerItem[];
  if (Array.isArray(j?.data)) return j.data as ManagerItem[];
  // tekil obje dönerse
  if (j && typeof j === 'object' && j.id && j.nameSurname) return [j as ManagerItem];
  return [];
}

/* ================= Page ================= */
export default function CompanyManagersPage() {
  const { role } = useParams<{ role: string }>();

  /* auth */
  const token = React.useMemo(getAuthToken, []);
  const headers = React.useMemo<HeadersInit>(() => bearerHeaders(token), [token]);

  /* state: companies & selection */
  const [companies, setCompanies] = React.useState<CompanyItem[]>([]);
  const [companyId, setCompanyId] = React.useState<string>('');
  const [companiesErr, setCompaniesErr] = React.useState<string | null>(null);
  const [companiesLoading, setCompaniesLoading] = React.useState(false);

  /* state: managers */
  const [rows, setRows] = React.useState<ManagerItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [q, setQ] = React.useState('');

  /* modals */
  const [addOpen, setAddOpen] = React.useState(false);
  const [editRow, setEditRow] = React.useState<ManagerItem | null>(null);
  const [busyId, setBusyId] = React.useState<string | null>(null);

  /* toast */
  const [okMsg, setOkMsg] = React.useState<string | null>(null);
  const [errMsg, setErrMsg] = React.useState<string | null>(null);
  const ok = (m: string) => { setOkMsg(m); setTimeout(() => setOkMsg(null), 3500); };
  const err = (m: string) => { setErrMsg(m); setTimeout(() => setErrMsg(null), 4500); };

  /* ========== Load companies for select ========== */
  const loadCompanies = React.useCallback(async () => {
    setCompaniesLoading(true); setCompaniesErr(null);
    try {
      const res = await fetch('/yuksi/admin/companies', { cache: 'no-store', headers });
      const j = await readJson(res);
      if (!res.ok) throw new Error(pickMsg(j, `HTTP ${res.status}`));

      const arr: any[] = Array.isArray(j) ? j : (Array.isArray(j?.data) ? j.data : []);
      const mapped: CompanyItem[] = arr.map((c: any) => ({
        id: String(c?.id),
        companyName: String(c?.companyName ?? ''),
        companyTrackingNo: c?.companyTrackingNo ?? undefined,
      })).filter(c => c.id && c.companyName);

      setCompanies(mapped);
      if (!companyId && mapped.length > 0) setCompanyId(mapped[0].id); // ilkini seç
    } catch (e: any) {
      setCompanies([]); setCompaniesErr(e?.message || 'Şirket listesi alınamadı.');
    } finally {
      setCompaniesLoading(false);
    }
  }, [headers, companyId]);

  React.useEffect(() => { loadCompanies(); }, [loadCompanies]);

  /* ========== Load managers of selected company ========== */
  const loadManagers = React.useCallback(async () => {
    if (!companyId) { setRows([]); return; }
    setLoading(true); setError(null);
    try {
      const res = await fetch(`/yuksi/admin/companies/${companyId}/managers`, { cache: 'no-store', headers });
      const j = await readJson(res);
      if (!res.ok) throw new Error(pickMsg(j, `HTTP ${res.status}`));
      setRows(parseManagers(j));
    } catch (e: any) {
      setRows([]); setError(e?.message || 'Yönetici listesi alınamadı.');
    } finally {
      setLoading(false);
    }
  }, [headers, companyId]);

  React.useEffect(() => { loadManagers(); }, [loadManagers]);

  const filtered = React.useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter(r =>
      [r.nameSurname, r.email ?? '', r.phone ?? '', r.createdAt ?? '']
        .join(' ')
        .toLowerCase()
        .includes(s),
    );
  }, [rows, q]);

  /* ========== CRUD Actions ========== */
  async function addManager(payload: { nameSurname: string; email?: string; phone?: string; }) {
    if (!companyId) return;
    setBusyId('add');
    try {
      const res = await fetch(`/yuksi/admin/companies/${companyId}/managers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify(payload),
      });
      const j = await readJson(res);
      if (!res.ok) throw new Error(pickMsg(j, `HTTP ${res.status}`));
      ok('Yönetici eklendi.');
      setAddOpen(false);
      await loadManagers();
    } catch (e: any) {
      err(e?.message || 'Yönetici eklenemedi.');
    } finally {
      setBusyId(null);
    }
  }

  async function updateManager(managerId: string, payload: { nameSurname?: string; email?: string; phone?: string; }) {
    if (!companyId) return;
    setBusyId(managerId);
    try {
      const res = await fetch(`/yuksi/admin/companies/${companyId}/managers/${managerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify(payload),
      });
      const j = await readJson(res);
      if (!res.ok) throw new Error(pickMsg(j, `HTTP ${res.status}`));
      ok('Yönetici güncellendi.');
      setEditRow(null);
      await loadManagers();
    } catch (e: any) {
      err(e?.message || 'Yönetici güncellenemedi.');
    } finally {
      setBusyId(null);
    }
  }

  async function deleteManager(managerId: string) {
    if (!companyId) return;
    if (!confirm('Bu yöneticiyi silmek istiyor musunuz?')) return;
    setBusyId(managerId);
    try {
      const res = await fetch(`/yuksi/admin/companies/${companyId}/managers/${managerId}`, {
        method: 'DELETE',
        headers,
      });
      const j = await readJson(res);
      if (!res.ok) throw new Error(pickMsg(j, `HTTP ${res.status}`));
      ok('Yönetici silindi.');
      await loadManagers();
    } catch (e: any) {
      err(e?.message || 'Yönetici silinemedi.');
    } finally {
      setBusyId(null);
    }
  }

  const selectedCompany = companies.find(c => c.id === companyId);

  /* ========== UI ========== */
  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Şirket Yöneticileri</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={loadCompanies}
            className="rounded-xl bg-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-300"
          >
            Şirketleri Yenile
          </button>
          <button
            onClick={() => setAddOpen(true)}
            disabled={!companyId}
            className="rounded-xl bg-orange-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-orange-700 disabled:opacity-60"
          >
            Yeni Yönetici
          </button>
        </div>
      </div>

      {(okMsg || errMsg) && (
        <div className="mb-3 space-y-2">
          {okMsg && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{okMsg}</div>}
          {errMsg && <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{errMsg}</div>}
        </div>
      )}

      {/* Şirket seçimi + arama */}
      <section className="rounded-2xl border border-neutral-200/70 bg-white shadow-sm">
        <div className="grid gap-4 p-6 sm:grid-cols-[minmax(260px,420px)_1fr]">
          <div>
            <label className="mb-1 block text-sm font-semibold text-neutral-700">Şirket Seç</label>
            <div className="flex gap-2">
              <select
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 text-neutral-800 outline-none ring-2 ring-transparent transition focus:bg-white focus:ring-sky-200"
              >
                {!companiesLoading && companies.length === 0 && <option value="">(Şirket bulunamadı)</option>}
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.companyName}{c.companyTrackingNo ? ` — #${c.companyTrackingNo}` : ''}
                  </option>
                ))}
              </select>
              <button
                onClick={loadManagers}
                disabled={!companyId}
                className="shrink-0 rounded-xl border px-3 py-2 text-sm hover:bg-neutral-50 disabled:opacity-50"
              >
                Yükle
              </button>
            </div>
            {companiesErr && <div className="mt-2 text-sm text-rose-600">{companiesErr}</div>}
            {selectedCompany && (
              <p className="mt-1 text-xs text-neutral-500">
                Seçili ID: <b>{selectedCompany.id}</b>
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-neutral-700">Arama</label>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Ad Soyad, e-posta, telefon…"
              className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 text-neutral-800 outline-none ring-2 ring-transparent transition placeholder:text-neutral-400 focus:bg-white focus:ring-sky-200"
            />
            <p className="mt-1 text-xs text-neutral-500">
              Toplam {filtered.length} kayıt {q ? ` (filtre: “${q}”)` : ''}
            </p>
          </div>
        </div>

        {/* Liste tablo */}
        <div className="overflow-x-auto">
          <table className="min-w-full border-t border-neutral-200/70">
            <thead>
              <tr className="text-left text-sm text-neutral-500">
                <th className="px-6 py-3 font-medium">Ad Soyad</th>
                <th className="px-6 py-3 font-medium">E-posta</th>
                <th className="px-6 py-3 font-medium">Telefon</th>
                <th className="px-6 py-3 font-medium">Oluşturma</th>
                <th className="px-6 py-3 font-medium w-[180px]"></th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-neutral-500">Yükleniyor…</td></tr>
              )}
              {!loading && error && (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-rose-600 whitespace-pre-wrap">{error}</td></tr>
              )}
              {!loading && !error && filtered.map((r) => (
                <tr key={r.id} className="border-t border-neutral-200/70 align-top hover:bg-neutral-50">
                  <td className="px-3 py-4">
                    <div className="font-semibold text-neutral-900">{r.nameSurname || '-'}</div>
                    <div className="text-[11px] text-neutral-500">#{r.id}</div>
                  </td>
                  <td className="px-3 py-4"><div className="text-neutral-900">{r.email || '-'}</div></td>
                  <td className="px-3 py-4"><div className="text-neutral-900">{r.phone || '-'}</div></td>
                  <td className="px-3 py-4"><div className="text-neutral-900">{r.createdAt || '-'}</div></td>
                  <td className="px-3 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditRow(r)}
                        className="rounded-lg bg-amber-500 px-3 py-1.5 text-sm font-semibold text-white shadow hover:bg-amber-600"
                      >
                        Düzenle
                      </button>
                      <button
                        onClick={() => deleteManager(r.id)}
                        disabled={busyId === r.id}
                        className="rounded-lg bg-rose-500 px-3 py-1.5 text-sm font-semibold text-white shadow hover:bg-rose-600 disabled:opacity-60"
                      >
                        {busyId === r.id ? 'Siliniyor…' : 'Sil'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && !error && filtered.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-neutral-500">Kayıt bulunamadı.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Add Modal */}
      {addOpen && (
        <ManagerModal
          title="Yeni Yönetici"
          initial={{ nameSurname: '', email: '', phone: '' }}
          onClose={() => setAddOpen(false)}
          onSubmit={(p) => addManager(p)}
          saving={busyId === 'add'}
        />
      )}

      {/* Edit Modal */}
      {editRow && (
        <ManagerModal
          title="Yöneticiyi Düzenle"
          initial={{ nameSurname: editRow.nameSurname || '', email: editRow.email || '', phone: editRow.phone || '' }}
          onClose={() => setEditRow(null)}
          onSubmit={(p) => updateManager(editRow.id, p)}
          saving={busyId === editRow.id}
        />
      )}
    </div>
  );
}

/* ========== Reusable Modal ========== */
function ManagerModal({
  title,
  initial,
  onClose,
  onSubmit,
  saving,
}: {
  title: string;
  initial: { nameSurname: string; email?: string; phone?: string };
  onClose: () => void;
  onSubmit: (payload: { nameSurname: string; email?: string; phone?: string }) => void;
  saving: boolean;
}) {
  const [nameSurname, setName] = React.useState(initial.nameSurname);
  const [email, setEmail] = React.useState(initial.email || '');
  const [phone, setPhone] = React.useState(initial.phone || '');

  function save(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      nameSurname: nameSurname.trim(),
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
    });
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button className="rounded-full p-2 hover:bg-neutral-100" onClick={onClose} aria-label="Kapat">✕</button>
        </div>

        <form onSubmit={save} className="space-y-4 p-5">
          <div>
            <div className="mb-1 text-sm font-medium text-neutral-700">Ad Soyad</div>
            <input
              value={nameSurname}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-sky-200"
            />
          </div>
          <div>
            <div className="mb-1 text-sm font-medium text-neutral-700">E-posta</div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-sky-200"
            />
          </div>
          <div>
            <div className="mb-1 text-sm font-medium text-neutral-700">Telefon</div>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-sky-200"
            />
          </div>

          <div className="mt-2 flex items-center justify-end gap-3">
            <button type="button" onClick={onClose} className="rounded-xl bg-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-300">
              İptal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700 disabled:opacity-60"
            >
              {saving ? 'Kaydediliyor…' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// src/app/dashboards/[role]/admin/dealers/dealer-list/page.tsx
'use client';

import * as React from 'react';
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
type DealerStatus = 'pendingApproval' | 'active' | 'inactive';

type DealerRow = {
  id: number | string;
  name: string;
  surname?: string | null;
  phone?: string | null;
  email?: string | null;
  account_type?: 'bireysel' | 'kurumsal' | string | null;
  address?: string | null;

  country_id?: number | null;
  state_id?: number | null; // ilçe
  city_id?: number | null;  // il

  country_name?: string | null;
  state_name?: string | null;
  city_name?: string | null;

  tax_office?: string | null;
  tax_number?: string | null;
  iban?: string | null;
  resume?: string | null;
  status: DealerStatus;
  created_at?: string | null;
};

type DealersListResponse = { success?: boolean; data?: any } | any;

/* ================= Page ================= */
export default function DealerListPage() {
  const token = React.useMemo(getAuthToken, []);
  const headers = React.useMemo<HeadersInit>(() => bearerHeaders(token), [token]);

  const [rows, setRows] = React.useState<DealerRow[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [q, setQ] = React.useState('');

  // Edit modal
  const [editOpen, setEditOpen] = React.useState(false);
  const [editBusy, setEditBusy] = React.useState(false);
  const [editRow, setEditRow] = React.useState<DealerRow | null>(null);

  // Status modal
  const [statusOpen, setStatusOpen] = React.useState(false);
  const [statusBusy, setStatusBusy] = React.useState(false);
  const [statusRow, setStatusRow] = React.useState<DealerRow | null>(null);
  const [newStatus, setNewStatus] = React.useState<DealerStatus>('pendingApproval');

  // Messages
  const [okMsg, setOkMsg] = React.useState<string | null>(null);
  const [errMsg, setErrMsg] = React.useState<string | null>(null);
  const ok = (m: string) => { setOkMsg(m); setTimeout(() => setOkMsg(null), 3500); };
  const err = (m: string) => { setErrMsg(m); setTimeout(() => setErrMsg(null), 4500); };

  const load = React.useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch('/yuksi/admin/dealers', { cache: 'no-store', headers });
      const j: DealersListResponse = await readJson(res);
      if (!res.ok) throw new Error(pickMsg(j, `HTTP ${res.status}`));

      // Yeni response: { success, message, data: [{ dealerid, name, ... }] }
      const listRaw: any[] = Array.isArray(j?.data) ? j.data : (Array.isArray(j) ? j : []);
      const mapped: DealerRow[] = listRaw
        .map((it: any): DealerRow => ({
          id: it?.dealerid ?? it?.id ?? '',
          name: String(it?.name ?? '').trim(),
          surname: it?.surname ?? null,
          phone: it?.phone ?? null,
          email: it?.email ?? null, // gelmiyor olabilir
          account_type: it?.accounttype ?? null, // <- accounttype
          address: it?.address ?? null,

          country_id: it?.countryid != null ? Number(it.countryid) : null,
          state_id:   it?.stateid   != null ? Number(it.stateid)   : null,
          city_id:    it?.cityid    != null ? Number(it.cityid)    : null,

          country_name: it?.countryname ?? null,
          state_name:   it?.statename   ?? null,
          city_name:    it?.cityname    ?? null,

          tax_office: it?.taxoffice ?? null,
          tax_number: it?.taxnumber ?? null,
          iban: it?.iban ?? null,
          resume: it?.resume ?? null,
          status: (it?.status as DealerStatus) ?? 'pendingApproval',
          created_at: it?.created_at ?? null,
        }))
        .filter((d) => d.id !== '');

      setRows(mapped);
    } catch (e: any) {
      setRows([]); setError(e?.message || 'Bayi listesi alınamadı.');
    } finally {
      setLoading(false);
    }
  }, [headers]);

  React.useEffect(() => { load(); }, [load]);

  const filtered = React.useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((d) =>
      [
        d.name,
        d.surname ?? '',
        d.email ?? '',
        d.phone ?? '',
        d.account_type ?? '',
        d.city_name ?? '',
        d.state_name ?? '',
        d.country_name ?? '',
        d.status ?? '',
        String(d.id ?? ''),
      ].join(' ').toLowerCase().includes(s),
    );
  }, [rows, q]);

  /* ========== Actions ========== */
  async function onDelete(id: number | string) {
    if (!confirm('Bu bayiyi silmek istediğinize emin misiniz?')) return;
    try {
      const res = await fetch(`/yuksi/admin/dealers/${id}`, { method: 'DELETE', headers });
      const j = await readJson(res);
      if (!res.ok) throw new Error(pickMsg(j, `HTTP ${res.status}`));
      ok('Bayi silindi.'); await load();
    } catch (e: any) { err(e?.message || 'Silme işlemi başarısız.'); }
  }

  // Open edit
  function openEdit(row: DealerRow) {
    setEditRow({ ...row });
    setEditOpen(true);
  }

  // Save edit (PUT)
  async function saveEdit() {
    if (!editRow) return;
    setEditBusy(true);
    try {
      const id = editRow.id;
      // Swagger PUT body alanları
      const body = {
        name: editRow.name ?? '',
        surname: editRow.surname ?? '',
        address: editRow.address ?? '',
        account_type: editRow.account_type ?? 'bireysel',
        country_id: Number(editRow.country_id || 0),
        city_id: Number(editRow.city_id || 0),
        state_id: Number(editRow.state_id || 0),
        tax_office: editRow.tax_office ?? '',
        phone: editRow.phone ?? '',
        tax_number: editRow.tax_number ?? '',
        iban: editRow.iban ?? '',
        resume: editRow.resume ?? '',
        status: editRow.status ?? 'pendingApproval',
      };
      const res = await fetch(`/yuksi/admin/dealers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify(body),
      });
      const j = await readJson(res);
      if (!res.ok) throw new Error(pickMsg(j, `HTTP ${res.status}`));
      ok('Bayi güncellendi.');
      setEditOpen(false);
      await load();
    } catch (e: any) {
      err(e?.message || 'Güncelleme başarısız.');
    } finally {
      setEditBusy(false);
    }
  }

  // Open status change
  function openStatus(row: DealerRow) {
    setStatusRow(row);
    setNewStatus(row.status);
    setStatusOpen(true);
  }

  // Save status (PATCH)
  async function saveStatus() {
    if (!statusRow) return;
    setStatusBusy(true);
    try {
      const res = await fetch(`/yuksi/admin/dealers/${statusRow.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({ status: newStatus }),
      });
      const j = await readJson(res);
      if (!res.ok) throw new Error(pickMsg(j, `HTTP ${res.status}`));
      ok('Durum güncellendi.');
      setStatusOpen(false);
      await load();
    } catch (e: any) {
      err(e?.message || 'Durum güncellenemedi.');
    } finally {
      setStatusBusy(false);
    }
  }

  /* ========== UI ========== */
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Bayi Listesi</h1>

      {(okMsg || errMsg || error) && (
        <div className="space-y-2">
          {okMsg && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{okMsg}</div>}
          {(errMsg || error) && <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{errMsg || error}</div>}
        </div>
      )}

      <section className="rounded-2xl border border-neutral-200/70 bg-white shadow-sm soft-card">
        <div className="grid gap-4 p-6 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-neutral-700">Arama</label>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Ad, soyad, telefon, email, konum, durum…"
              className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 text-neutral-800 outline-none ring-2 ring-transparent transition placeholder:text-neutral-400 focus:bg-white focus:ring-sky-200"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">  
            <div className="col-span-2 flex items-end">
              <button
                onClick={load}
                disabled={loading}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700 disabled:opacity-60"
              >
                {loading ? 'Yükleniyor…' : 'Listeyi Getir'}
              </button>
            </div>
          </div>
        </div>

        {/* Tablo */}
        <div className="overflow-x-auto">
          <table className="min-w-full border-t border-neutral-200/70">
            <thead>
              <tr className="text-left text-xs sm:text-sm text-neutral-500">
                <th className="px-6 py-3 font-medium">Ad Soyad</th>
                <th className="px-6 py-3 font-medium">Telefon</th>
                <th className="px-6 py-3 font-medium">Tür</th>
                <th className="px-6 py-3 font-medium">Konum</th>
                <th className="px-6 py-3 font-medium">Durum</th>
                <th className="px-6 py-3 font-medium w-64">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d: DealerRow) => {
                const fullName = [d.name, d.surname].filter(Boolean).join(' ');
                const loc = [d.city_name, d.state_name, d.country_name].filter(Boolean).join(' / ');
                return (
                  <tr key={String(d.id)} className="border-t border-neutral-200/70 hover:bg-neutral-50">
                    <td className="px-6 py-3">
                      <div className="font-semibold text-neutral-900">{fullName || `#${d.id}`}</div>
                      {d.email ? <div className="text-xs text-neutral-500">{d.email}</div> : null}
                    </td>
                    <td className="px-6 py-3">{d.phone ?? '—'}</td>
                    <td className="px-6 py-3">{d.account_type ?? '—'}</td>
                    <td className="px-6 py-3">{loc || '—'}</td>
                    <td className="px-6 py-3">
                      <span
                        className={
                          'rounded-full px-2 py-0.5 text-[11px] font-semibold ' +
                          (d.status === 'active'
                            ? 'bg-emerald-500 text-white'
                            : d.status === 'inactive'
                            ? 'bg-neutral-300 text-neutral-800'
                            : 'bg-amber-400 text-neutral-900')
                        }
                      >
                        {d.status}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => openEdit(d)}
                          className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs font-semibold hover:bg-neutral-50"
                        >
                          Düzenle
                        </button>
                        <button
                          onClick={() => openStatus(d)}
                          className="rounded-md border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-700 hover:bg-sky-100"
                        >
                          Statü Değiştir
                        </button>
                        <button
                          onClick={() => onDelete(d.id)}
                          className="rounded-md border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                        >
                          Sil
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-neutral-500">
                    Sonuç bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Düzenle Modal (basit) */}
      {editOpen && editRow && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-5 shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-lg font-semibold">Bayi Düzenle</div>
              <button onClick={() => setEditOpen(false)} className="text-sm text-neutral-500 hover:text-neutral-800">
                Kapat
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">Ad</label>
                <input
                  value={editRow.name}
                  onChange={(e) => setEditRow({ ...editRow, name: e.target.value })}
                  className="w-full rounded-xl border border-neutral-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Soyad</label>
                <input
                  value={editRow.surname ?? ''}
                  onChange={(e) => setEditRow({ ...editRow, surname: e.target.value })}
                  className="w-full rounded-xl border border-neutral-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Telefon</label>
                <input
                  value={editRow.phone ?? ''}
                  onChange={(e) => setEditRow({ ...editRow, phone: e.target.value })}
                  className="w-full rounded-xl border border-neutral-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Hesap Türü</label>
                <select
                  value={editRow.account_type ?? ''}
                  onChange={(e) => setEditRow({ ...editRow, account_type: e.target.value })}
                  className="w-full rounded-xl border border-neutral-300 px-3 py-2"
                >
                  <option value="">Seçin…</option>
                  <option value="bireysel">bireysel</option>
                  <option value="kurumsal">kurumsal</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium">Adres</label>
                <input
                  value={editRow.address ?? ''}
                  onChange={(e) => setEditRow({ ...editRow, address: e.target.value })}
                  className="w-full rounded-xl border border-neutral-300 px-3 py-2"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Ülke ID</label>
                <input
                  value={editRow.country_id ?? ''}
                  onChange={(e) => setEditRow({ ...editRow, country_id: Number(e.target.value) || 0 })}
                  className="w-full rounded-xl border border-neutral-300 px-3 py-2"
                  inputMode="numeric"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">İl (city_id)</label>
                <input
                  value={editRow.city_id ?? ''}
                  onChange={(e) => setEditRow({ ...editRow, city_id: Number(e.target.value) || 0 })}
                  className="w-full rounded-xl border border-neutral-300 px-3 py-2"
                  inputMode="numeric"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">İlçe (state_id)</label>
                <input
                  value={editRow.state_id ?? ''}
                  onChange={(e) => setEditRow({ ...editRow, state_id: Number(e.target.value) || 0 })}
                  className="w-full rounded-xl border border-neutral-300 px-3 py-2"
                  inputMode="numeric"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Vergi Dairesi</label>
                <input
                  value={editRow.tax_office ?? ''}
                  onChange={(e) => setEditRow({ ...editRow, tax_office: e.target.value })}
                  className="w-full rounded-xl border border-neutral-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Vergi No</label>
                <input
                  value={editRow.tax_number ?? ''}
                  onChange={(e) => setEditRow({ ...editRow, tax_number: e.target.value })}
                  className="w-full rounded-xl border border-neutral-300 px-3 py-2"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium">IBAN</label>
                <input
                  value={editRow.iban ?? ''}
                  onChange={(e) => setEditRow({ ...editRow, iban: e.target.value })}
                  className="w-full rounded-xl border border-neutral-300 px-3 py-2"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium">Özgeçmiş</label>
                <textarea
                  rows={4}
                  value={editRow.resume ?? ''}
                  onChange={(e) => setEditRow({ ...editRow, resume: e.target.value })}
                  className="w-full rounded-xl border border-neutral-300 px-3 py-2"
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setEditOpen(false)}
                className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm hover:bg-neutral-50"
              >
                İptal
              </button>
              <button
                onClick={saveEdit}
                disabled={editBusy}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
              >
                {editBusy ? 'Kaydediliyor…' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Statü Modal */}
      {statusOpen && statusRow && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <div className="mb-3 text-lg font-semibold">Statü Güncelle</div>
            <div className="space-y-2">
              <div className="text-sm text-neutral-600">
                <b>{[statusRow.name, statusRow.surname].filter(Boolean).join(' ') || `#${statusRow.id}`}</b> için yeni durum seçin.
              </div>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as DealerStatus)}
                className="w-full rounded-xl border border-neutral-300 px-3 py-2"
              >
                <option value="pendingApproval">pendingApproval</option>
                <option value="active">active</option>
                <option value="inactive">inactive</option>
              </select>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setStatusOpen(false)}
                className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm hover:bg-neutral-50"
              >
                İptal
              </button>
              <button
                onClick={saveStatus}
                disabled={statusBusy}
                className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-60"
              >
                {statusBusy ? 'Güncelleniyor…' : 'Güncelle'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

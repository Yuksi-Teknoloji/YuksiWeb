// src/app/dashboards/[role]/admin/restaurants/restaurant-list/page.tsx
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getAuthToken } from '@/utils/auth';

type Restaurant = {
  id: number | string;
  email: string;
  name: string;
  contactPerson: string | null;
  taxNumber: string | null;
  phone: string | null;
  fullAddress: string | null;
};

const PAGE_SIZE = 10;

/* === helpers (ekledim) === */
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

export default function RestaurantListPage() {
  const { role } = useParams<{ role: string }>();

  const [rows, setRows] = React.useState<Restaurant[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [query, setQuery] = React.useState('');
  const [page, setPage] = React.useState(1); // client-side sayfalama

  // auth header (ekledim)
  const token = React.useMemo(getAuthToken, []);
  const headers = React.useMemo<HeadersInit>(() => bearerHeaders(token), [token]);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/yuksi/Restaurant/list', {
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      });
      const txt = await res.text();
      const json: any = txt ? JSON.parse(txt) : null;

      if (!res.ok) {
        throw new Error(json?.message || json?.title || json?.detail || `HTTP ${res.status}`);
      }

      // Swagger yeni yapıda: DİREKT DİZİ
      const arr: any[] = Array.isArray(json)
        ? json
        : Array.isArray(json?.data)
          ? json.data
          : [];

      const mapped: Restaurant[] = arr.map((r: any, i: number) => ({
        id: r?.id ?? i + 1,
        email: r?.email ?? '',
        name: r?.name ?? '',
        contactPerson: r?.contactPerson ?? null,
        taxNumber: r?.taxNumber ?? null,
        phone: r?.phone ?? null,
        fullAddress: r?.fullAddress ?? null,
      }));

      setRows(mapped);
      setPage(1); // her yüklemede 1. sayfaya dön
    } catch (e: any) {
      setError(e?.message || 'Restoran listesi alınamadı.');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { load(); }, [load]);

  // Arama + client-side sayfalama
  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      [r.name, r.contactPerson, r.email, r.phone, r.taxNumber, r.fullAddress]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)),
    );
  }, [rows, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = React.useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const createHref = `/dashboards/${role}/admin/restaurants/create-restaurant`;

  /* ==== PUT / DELETE handlers (ekledim) ==== */
  const [editing, setEditing] = React.useState<Restaurant | null>(null);
  const [busyId, setBusyId] = React.useState<string | number | null>(null);

  async function onDelete(id: string | number) {
    if (!confirm('Restoranı silmek istiyor musunuz?')) return;
    setBusyId(id);
    try {
      const res = await fetch(`/yuksi/Restaurant/${id}`, { method: 'DELETE', headers });
      const j = await readJson(res);
      if (!res.ok || (j && (j as any).success === false)) {
        throw new Error(pickMsg(j, `HTTP ${res.status}`));
      }
      await load();
    } catch (e: any) {
      alert(e?.message || 'Silme işlemi başarısız.');
    } finally {
      setBusyId(null);
    }
  }

  async function onUpdateSubmit(id: string | number, body: any) {
    setBusyId(id);
    try {
      const res = await fetch(`/yuksi/Restaurant/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify(body),
      });
      const j = await readJson(res);
      if (!res.ok || (j && (j as any).success === false)) {
        throw new Error(pickMsg(j, `HTTP ${res.status}`));
      }
      setEditing(null);
      await load();
    } catch (e: any) {
      alert(e?.message || 'Güncelleme başarısız.');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Restoran Listesi</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="rounded-xl bg-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-300"
          >
            Yenile
          </button>
          <Link
            href={createHref}
            className="rounded-xl bg-orange-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-orange-700"
          >
            Yeni Restoran
          </Link>
        </div>
      </div>

      <section className="rounded-2xl border border-neutral-200/70 bg-white shadow-sm">
        <div className="p-6">
          <div className="space-y-2">
            <input
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
              placeholder="İsim, yetkili, e-posta, telefon, vergi no, adres…"
              className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 text-neutral-800 outline-none ring-2 ring-transparent transition placeholder:text-neutral-400 focus:bg-white focus:ring-sky-200"
            />
            <p className="text-sm text-neutral-500">
              Toplam {filtered.length} kayıt • Bu sayfada {pageRows.length} kayıt
              {query ? ` (filtre: “${query}”)` : ''}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-t border-neutral-200/70">
            <thead>
              <tr className="text-left text-sm text-neutral-500">
                <th className="px-6 py-3 font-medium">Ad</th>
                <th className="px-6 py-3 font-medium">Yetkili</th>
                <th className="px-6 py-3 font-medium">E-posta</th>
                <th className="px-6 py-3 font-medium">Telefon</th>
                <th className="px-6 py-3 font-medium">Vergi No</th>
                <th className="px-6 py-3 font-medium">Adres</th>
                <th className="px-6 py-3 font-medium w-[180px]"></th>{/* işlemler (ekledim) */}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-neutral-500">Yükleniyor…</td>
                </tr>
              )}

              {!loading && error && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 whitespace-pre-wrap text-center text-rose-600">
                    {error}
                  </td>
                </tr>
              )}

              {!loading && !error && pageRows.map((r) => (
                <tr key={r.id} className="border-t border-neutral-200/70 align-top hover:bg-neutral-50">
                  <td className="px-3 py-4"><div className="font-semibold text-neutral-900">{r.name || '-'}</div></td>
                  <td className="px-3 py-4"><div className="text-neutral-900">{r.contactPerson || '-'}</div></td>
                  <td className="px-3 py-4"><div className="text-neutral-900">{r.email || '-'}</div></td>
                  <td className="px-3 py-4"><div className="text-neutral-900">{r.phone || '-'}</div></td>
                  <td className="px-3 py-4"><div className="text-neutral-900">{r.taxNumber || '-'}</div></td>
                  <td className="px-3 py-4"><div className="max-w-[520px] text-neutral-900">{r.fullAddress || '-'}</div></td>
                  <td className="px-3 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditing(r)}
                        className="rounded-lg bg-amber-500 px-3 py-1.5 text-sm font-semibold text-white shadow hover:bg-amber-600"
                      >
                        Düzenle
                      </button>
                      <button
                        onClick={() => onDelete(r.id)}
                        disabled={busyId === r.id}
                        className="rounded-lg bg-rose-500 px-3 py-1.5 text-sm font-semibold text-white shadow hover:bg-rose-600 disabled:opacity-60"
                      >
                        {busyId === r.id ? 'Siliniyor…' : 'Sil'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!loading && !error && pageRows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-neutral-500">Kayıt bulunamadı.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Client-side sayfalama */}
        {!loading && !error && totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 text-sm text-neutral-600">
            <span>Sayfa {page} / {totalPages}</span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-lg border px-3 py-1.5 disabled:opacity-40"
              >
                ‹ Önceki
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="rounded-lg border px-3 py-1.5 disabled:opacity-40"
              >
                Sonraki ›
              </button>
            </div>
          </div>
        )}
      </section>

      {editing && (
        <EditRestaurantModal
          row={editing}
          onClose={() => setEditing(null)}
          onSubmit={(payload) => onUpdateSubmit(editing.id, payload)}
        />
      )}
    </div>
  );
}

/* === Düzenle Modal (PUT body şemaya göre alanlar; hepsi opsiyonel bırakıldı) === */
function EditRestaurantModal({
  row,
  onClose,
  onSubmit,
}: {
  row: Restaurant;
  onClose: () => void;
  onSubmit: (payload: {
    name?: string;
    email?: string;
    contact_person?: string;
    phone?: string;
    tax_number?: string;
    address_line1?: string;
    address_line2?: string;
    opening_hour?: string;
    closing_hour?: string;
    country_id?: number | '';
    state_id?: number | '';
    city_id?: number | '';
  }) => void;
}) {
  const [name, setName] = React.useState(row.name || '');
  const [email, setEmail] = React.useState(row.email || '');
  const [contactPerson, setContactPerson] = React.useState(row.contactPerson || '');
  const [phone, setPhone] = React.useState(row.phone || '');
  const [taxNumber, setTaxNumber] = React.useState(row.taxNumber || '');
  const [address1, setAddress1] = React.useState(row.fullAddress || '');
  const [address2, setAddress2] = React.useState('');
  const [opening, setOpening] = React.useState('09:00');
  const [closing, setClosing] = React.useState('23:00');
  const [countryId, setCountryId] = React.useState<number | ''>('');
  const [stateId, setStateId] = React.useState<number | ''>('');
  const [cityId, setCityId] = React.useState<number | ''>('');

  function save(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      name: name || undefined,
      email: email || undefined,
      contact_person: contactPerson || undefined,
      phone: phone || undefined,
      tax_number: taxNumber || undefined,
      address_line1: address1 || undefined,
      address_line2: address2 || undefined,
      opening_hour: opening || undefined,
      closing_hour: closing || undefined,
      country_id: countryId === '' ? undefined : Number(countryId),
      state_id: stateId === '' ? undefined : Number(stateId),
      city_id: cityId === '' ? undefined : Number(cityId),
    });
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h3 className="text-lg font-semibold">Restoranı Düzenle</h3>
          <button className="rounded-full p-2 hover:bg-neutral-100" onClick={onClose} aria-label="Kapat">✕</button>
        </div>

        <form onSubmit={save} className="space-y-4 p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Ad">
              <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-sky-200" />
            </Field>
            <Field label="Yetkili">
              <input value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-sky-200" />
            </Field>
            <Field label="E-posta">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-sky-200" />
            </Field>
            <Field label="Telefon">
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-sky-200" />
            </Field>
            <Field label="Vergi No">
              <input value={taxNumber} onChange={(e) => setTaxNumber(e.target.value)} className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-sky-200" />
            </Field>
            <Field label="Adres Satır 1">
              <input value={address1} onChange={(e) => setAddress1(e.target.value)} className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-sky-200" />
            </Field>
            <Field label="Adres Satır 2">
              <input value={address2} onChange={(e) => setAddress2(e.target.value)} className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-sky-200" />
            </Field>
            <Field label="Açılış">
              <input value={opening} onChange={(e) => setOpening(e.target.value)} placeholder="09:00" className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-sky-200" />
            </Field>
            <Field label="Kapanış">
              <input value={closing} onChange={(e) => setClosing(e.target.value)} placeholder="23:00" className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-sky-200" />
            </Field>
            <Field label="Ülke ID">
              <input type="number" min={1} value={countryId as any} onChange={(e) => setCountryId(e.target.value === '' ? '' : Number(e.target.value))} className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-sky-200" />
            </Field>
            <Field label="Eyalet/İl ID">
              <input type="number" min={1} value={stateId as any} onChange={(e) => setStateId(e.target.value === '' ? '' : Number(e.target.value))} className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-sky-200" />
            </Field>
            <Field label="Şehir ID">
              <input type="number" min={1} value={cityId as any} onChange={(e) => setCityId(e.target.value === '' ? '' : Number(e.target.value))} className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-sky-200" />
            </Field>
          </div>

          <div className="mt-2 flex items-center justify-end gap-3">
            <button type="button" onClick={onClose} className="rounded-xl bg-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-300">
              İptal
            </button>
            <button type="submit" className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700">
              Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1 text-sm font-medium text-neutral-700">{label}</div>
      {children}
    </div>
  );
}

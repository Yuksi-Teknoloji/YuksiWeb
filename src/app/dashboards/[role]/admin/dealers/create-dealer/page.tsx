// src/app/dashboards/[role]/admin/dealers/create-dealer/page.tsx
'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { getAuthToken } from '@/utils/auth';

/* ===== geo types ===== */
type Country = { id: number; name: string; iso2?: string; iso3?: string; phonecode?: string };
type State   = { id: number; name: string };
type City    = { id: number; name: string };

/* ===== helpers ===== */
async function readJson<T = any>(res: Response): Promise<T> {
  const t = await res.text();
  try { return t ? JSON.parse(t) : (null as any); } catch { return (t as any); }
}
const pickMsg = (d: any, fb: string) => d?.error?.message || d?.message || d?.detail || d?.title || fb;
function bearerHeaders(token?: string | null): HeadersInit {
  const h: HeadersInit = { Accept: 'application/json' };
  if (token) (h as any).Authorization = `Bearer ${token}`;
  return h;
}

/* ===== page ===== */
export default function CreateDealerPage() {
  const { role } = useParams() as { role: string };

  const token = React.useMemo(getAuthToken, []);
  const headers = React.useMemo<HeadersInit>(() => bearerHeaders(token), [token]);

  const [form, setForm] = React.useState({
    account_type: '' as '' | 'bireysel' | 'kurumsal',
    name: '',
    surname: '',
    phone: '',
    email: '',        // <-- NEW
    password: '',     // <-- NEW
    resume: '',
    address: '',
    country_id: '' as number | '',
    state_id: '' as number | '',
    city_id: '' as number | '',
    tax_office: '',
    tax_number: '',
    iban: '',
    status: 'pendingApproval' as 'pendingApproval' | 'active' | 'inactive',
  });

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((p) => ({ ...p, [key]: value }));

  const [busy, setBusy] = React.useState(false);
  const [okMsg, setOkMsg] = React.useState<string | null>(null);
  const [errMsg, setErrMsg] = React.useState<string | null>(null);

  /* ===== GEO: Countries / States / Cities (aynı sistem) ===== */
  const [countries, setCountries]               = React.useState<Country[]>([]);
  const [countriesLoading, setCountriesLoading] = React.useState(false);
  const [countriesError, setCountriesError]     = React.useState<string | null>(null);

  const [states, setStates]               = React.useState<State[]>([]);
  const [statesLoading, setStatesLoading] = React.useState(false);
  const [statesError, setStatesError]     = React.useState<string | null>(null);

  const [cities, setCities]               = React.useState<City[]>([]);
  const [citiesLoading, setCitiesLoading] = React.useState(false);
  const [citiesError, setCitiesError]     = React.useState<string | null>(null);

  // 1) Countries
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      setCountriesLoading(true);
      setCountriesError(null);
      try {
        const url = new URL('/yuksi/geo/countries', location.origin);
        url.searchParams.set('limit', '200');
        url.searchParams.set('offset', '0');
        const res = await fetch(url.toString(), { cache: 'no-store' });
        const data = await readJson(res);
        if (!res.ok) throw new Error(pickMsg(data, `HTTP ${res.status}`));
        const list: any[] = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
        const mapped: Country[] = list.map((c) => ({
          id: Number(c?.id),
          name: String(c?.name ?? ''),
          iso2: c?.iso2,
          iso3: c?.iso3,
          phonecode: c?.phonecode,
        })).filter(c => Number.isFinite(c.id) && c.name);
        if (!cancelled) setCountries(mapped);
      } catch (e: any) {
        if (!cancelled) setCountriesError(e?.message || 'Ülke listesi alınamadı.');
      } finally {
        if (!cancelled) setCountriesLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // 2) States by country
  React.useEffect(() => {
    setStates([]); set('state_id', ''); setCities([]); set('city_id', '');
    if (form.country_id === '' || !Number.isFinite(Number(form.country_id))) return;

    let cancelled = false;
    (async () => {
      setStatesLoading(true);
      setStatesError(null);
      try {
        const url = new URL('/yuksi/geo/states', location.origin);
        url.searchParams.set('country_id', String(form.country_id));
        url.searchParams.set('limit', '500');
        url.searchParams.set('offset', '0');
        const res = await fetch(url.toString(), { cache: 'no-store' });
        const data = await readJson(res);
        if (!res.ok) throw new Error(pickMsg(data, `HTTP ${res.status}`));
        const list: any[] = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
        const mapped: State[] = list.map((s) => ({
          id: Number(s?.id),
          name: String(s?.name ?? ''),
        })).filter(s => Number.isFinite(s.id) && s.name);
        if (!cancelled) setStates(mapped);
      } catch (e: any) {
        if (!cancelled) setStatesError(e?.message || 'Eyalet/İl listesi alınamadı.');
      } finally {
        if (!cancelled) setStatesLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [form.country_id]);

  // 3) Cities by state
  React.useEffect(() => {
    setCities([]); set('city_id', '');
    if (form.state_id === '' || !Number.isFinite(Number(form.state_id))) return;

    let cancelled = false;
    (async () => {
      setCitiesLoading(true);
      setCitiesError(null);
      try {
        const url = new URL('/yuksi/geo/cities', location.origin);
        url.searchParams.set('state_id', String(form.state_id));
        url.searchParams.set('limit', '1000');
        url.searchParams.set('offset', '0');
        const res = await fetch(url.toString(), { cache: 'no-store' });
        const data = await readJson(res);
        if (!res.ok) throw new Error(pickMsg(data, `HTTP ${res.status}`));
        const list: any[] = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
        const mapped: City[] = list.map((c) => ({
          id: Number(c?.id),
          name: String(c?.name ?? ''),
        })).filter(c => Number.isFinite(c.id) && c.name);
        if (!cancelled) setCities(mapped);
      } catch (e: any) {
        if (!cancelled) setCitiesError(e?.message || 'Şehir listesi alınamadı.');
      } finally {
        if (!cancelled) setCitiesLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [form.state_id]);

  async function onSave() {
    setBusy(true); setOkMsg(null); setErrMsg(null);
    try {
      const body = {
        account_type: form.account_type,
        address: form.address,
        city_id: Number(form.city_id || 0),
        country_id: Number(form.country_id || 0),
        email: form.email || undefined,         // <-- NEW
        password: form.password || undefined,   // <-- NEW
        iban: form.iban,
        name: form.name,
        phone: form.phone,
        resume: form.resume,
        state_id: Number(form.state_id || 0),
        status: form.status,
        surname: form.surname,
        tax_number: form.tax_number,
        tax_office: form.tax_office,
      };

      const res = await fetch('/yuksi/admin/dealers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify(body),
      });
      const j = await readJson(res);
      if (!res.ok) throw new Error(pickMsg(j, `HTTP ${res.status}`));

      setOkMsg('Bayi oluşturuldu.');
      // Temel alanları temizle
      setForm((p) => ({
        ...p,
        name: '', surname: '', phone: '', email: '', password: '', resume: '', address: '',
        tax_office: '', tax_number: '', iban: '',
        country_id: '', state_id: '', city_id: '',
      }));
      setStates([]); setCities([]);
    } catch (e: any) {
      setErrMsg(e?.message || 'Bayi oluşturulamadı.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Yeni Bayi Ekle</h1>
        <div className="text-xs text-neutral-500">Rol: {role}</div>
      </div>

      {okMsg && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{okMsg}</div>}
      {errMsg && <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{errMsg}</div>}

      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        {/* Sol kart */}
        <section className="rounded-2xl border border-neutral-200/70 bg-white p-6 shadow-sm">
          <div className="grid place-items-center">
            <div className="mb-6 grid h-20 w-20 place-items-center rounded-full bg-neutral-200 text-xs text-neutral-600">300 × 300</div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-semibold text-neutral-700">Hesap Türü</label>
              <select
                className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2"
                value={form.account_type}
                onChange={(e) => set('account_type', e.target.value as any)}
              >
                <option value="">Seçin…</option>
                <option value="bireysel">Bireysel</option>
                <option value="kurumsal">Kurumsal</option>
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-semibold text-neutral-700">Ad</label>
                <input className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 outline-none focus:bg-white focus:ring-2 focus:ring-sky-200"
                  value={form.name} onChange={(e) => set('name', e.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-neutral-700">Soyad</label>
                <input className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 outline-none focus:bg-white focus:ring-2 focus:ring-sky-200"
                  value={form.surname} onChange={(e) => set('surname', e.target.value)} />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-neutral-700">Telefon</label>
              <input className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 outline-none focus:bg-white focus:ring-2 focus:ring-sky-200"
                value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+90..." />
            </div>

            {/* NEW: Email */}
            <div>
              <label className="mb-1 block text-sm font-semibold text-neutral-700">E-posta</label>
              <input
                type="email"
                className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 outline-none focus:bg-white focus:ring-2 focus:ring-sky-200"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                placeholder="mehmet@example.com"
              />
            </div>

            {/* NEW: Password */}
            <div>
              <label className="mb-1 block text-sm font-semibold text-neutral-700">Şifre</label>
              <input
                type="password"
                className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 outline-none focus:bg-white focus:ring-2 focus:ring-sky-200"
                value={form.password}
                onChange={(e) => set('password', e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-neutral-700">Özgeçmiş</label>
              <textarea className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 outline-none focus:bg-white focus:ring-2 focus:ring-sky-200"
                rows={6} value={form.resume} onChange={(e) => set('resume', e.target.value)} />
            </div>
          </div>
        </section>

        {/* Sağ kart */}
        <section className="rounded-2xl border border-neutral-200/70 bg-white p-6 shadow-sm">
          <div className="space-y-5">
            <div>
              <label className="mb-1 block text-sm font-semibold text-neutral-700">Adres</label>
              <input className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 outline-none focus:bg-white focus:ring-2 focus:ring-sky-200"
                value={form.address} onChange={(e) => set('address', e.target.value)} />
            </div>

            {/* Ülke / Eyalet-İl / Şehir – selectler */}
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-semibold text-neutral-700">Ülke</label>
                <select
                  className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2"
                  value={form.country_id as any}
                  onChange={(e) => set('country_id', e.target.value ? Number(e.target.value) : '')}
                >
                  <option value="">{countriesLoading ? 'Yükleniyor…' : 'Ülke seçin…'}</option>
                  {countriesError && <option value="">{countriesError}</option>}
                  {!countriesLoading && !countriesError && countries.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-neutral-700">Eyalet / İl</label>
                <select
                  className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 disabled:opacity-60"
                  value={form.state_id as any}
                  onChange={(e) => set('state_id', e.target.value ? Number(e.target.value) : '')}
                  disabled={!form.country_id || statesLoading}
                >
                  <option value="">
                    {statesLoading ? 'Yükleniyor…' : (form.country_id ? 'Eyalet/İl seçin…' : 'Önce ülke seçin')}
                  </option>
                  {statesError && <option value="">{statesError}</option>}
                  {!statesLoading && !statesError && states.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-neutral-700">Şehir</label>
                <select
                  className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 disabled:opacity-60"
                  value={form.city_id as any}
                  onChange={(e) => set('city_id', e.target.value ? Number(e.target.value) : '')}
                  disabled={!form.state_id || citiesLoading}
                >
                  <option value="">
                    {citiesLoading ? 'Yükleniyor…' : (form.state_id ? 'Şehir seçin…' : 'Önce eyalet/il seçin')}
                  </option>
                  {citiesError && <option value="">{citiesError}</option>}
                  {!citiesLoading && !citiesError && cities.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-semibold text-neutral-700">Vergi Dairesi (tax_office)</label>
                <input className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 outline-none focus:bg-white focus:ring-2 focus:ring-sky-200"
                  value={form.tax_office} onChange={(e) => set('tax_office', e.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-neutral-700">Vergi No (tax_number)</label>
                <input className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 outline-none focus:bg-white focus:ring-2 focus:ring-sky-200"
                  value={form.tax_number} onChange={(e) => set('tax_number', e.target.value)} />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-neutral-700">IBAN</label>
              <input className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 outline-none focus:bg-white focus:ring-2 focus:ring-sky-200"
                value={form.iban} onChange={(e) => set('iban', e.target.value)} placeholder="TR..." />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-neutral-700">Durum (status)</label>
              <select
                className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2"
                value={form.status}
                onChange={(e) => set('status', e.target.value as any)}
              >
                <option value="pendingApproval">pendingApproval</option>
                <option value="active">active</option>
                <option value="inactive">inactive</option>
              </select>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={onSave}
              disabled={busy}
              className="rounded-xl bg-indigo-600 px-6 py-2.5 text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-60"
            >
              {busy ? 'Gönderiliyor…' : 'Kaydet'}
            </button>
          </div>
        </section>
      </div>

      {/* Evraklar (opsiyonel alan) */}
      <section className="mt-6 rounded-2xl border border-neutral-200/70 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-neutral-800">Evraklar</h2>
        <p className="mt-1 text-sm text-neutral-600">Bayi oluşturulduktan sonra evrak yükleme aşaması eklenecektir.</p>
      </section>
    </div>
  );
}

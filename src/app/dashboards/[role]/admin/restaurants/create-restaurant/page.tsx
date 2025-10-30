// src/app/dashboards/[role]/admin/restaurants/create-restaurant/page.tsx
'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';

const MapPicker = dynamic(() => import('@/components/map/MapPicker'), { ssr: false });
type GeoPoint = { lat: number; lng: number; address?: string };

type Country = { id: number; name: string; iso2?: string; iso3?: string; phonecode?: string };
type State   = { id: number; name: string };
type City    = { id: number; name: string };

export default function RestaurantCreatePage() {
  const [saving, setSaving]   = React.useState(false);
  const [okMsg, setOkMsg]     = React.useState<string | null>(null);
  const [errMsg, setErrMsg]   = React.useState<string | null>(null);
  const [formKey, setFormKey] = React.useState(0);

  // ---- Geo select states
  const [countries, setCountries]               = React.useState<Country[]>([]);
  const [countriesLoading, setCountriesLoading] = React.useState(false);
  const [countriesError, setCountriesError]     = React.useState<string | null>(null);
  const [countryId, setCountryId]               = React.useState<number | ''>('');

  const [states, setStates]               = React.useState<State[]>([]);
  const [statesLoading, setStatesLoading] = React.useState(false);
  const [statesError, setStatesError]     = React.useState<string | null>(null);
  const [stateId, setStateId]             = React.useState<number | ''>('');

  const [cities, setCities]               = React.useState<City[]>([]);
  const [citiesLoading, setCitiesLoading] = React.useState(false);
  const [citiesError, setCitiesError]     = React.useState<string | null>(null);
  const [cityId, setCityId]               = React.useState<number | ''>('');

  // ---- Map (lat/lng)
  const [geo, setGeo] = React.useState<GeoPoint | null>(null);

  // ---- helpers
  async function readJson(res: Response) {
    const t = await res.text();
    try { return t ? JSON.parse(t) : null; } catch { throw new Error('Geçersiz JSON'); }
  }
  const pickMsg = (d: any, fb: string) =>
    d?.error?.message || d?.message || d?.detail || d?.title || fb;

  /* 1) Countries */
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
        const mapped: Country[] = list.map(c => ({
          id: Number(c?.id), name: String(c?.name ?? ''), iso2: c?.iso2, iso3: c?.iso3, phonecode: c?.phonecode,
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

  /* 2) States */
  React.useEffect(() => {
    setStates([]); setStateId(''); setCities([]); setCityId('');
    if (countryId === '' || !Number.isFinite(Number(countryId))) return;
    let cancelled = false;
    (async () => {
      setStatesLoading(true); setStatesError(null);
      try {
        const url = new URL('/yuksi/geo/states', location.origin);
        url.searchParams.set('country_id', String(countryId));
        url.searchParams.set('limit', '500');
        url.searchParams.set('offset', '0');
        const res = await fetch(url.toString(), { cache: 'no-store' });
        const data = await readJson(res);
        if (!res.ok) throw new Error(pickMsg(data, `HTTP ${res.status}`));
        const list: any[] = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
        const mapped: State[] = list.map(s => ({ id: Number(s?.id), name: String(s?.name ?? '') }))
                                    .filter(s => Number.isFinite(s.id) && s.name);
        if (!cancelled) setStates(mapped);
      } catch (e: any) {
        if (!cancelled) setStatesError(e?.message || 'Eyalet/İl listesi alınamadı.');
      } finally {
        if (!cancelled) setStatesLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [countryId]);

  /* 3) Cities */
  React.useEffect(() => {
    setCities([]); setCityId('');
    if (stateId === '' || !Number.isFinite(Number(stateId))) return;
    let cancelled = false;
    (async () => {
      setCitiesLoading(true); setCitiesError(null);
      try {
        const url = new URL('/yuksi/geo/cities', location.origin);
        url.searchParams.set('state_id', String(stateId));
        url.searchParams.set('limit', '1000');
        url.searchParams.set('offset', '0');
        const res = await fetch(url.toString(), { cache: 'no-store' });
        const data = await readJson(res);
        if (!res.ok) throw new Error(pickMsg(data, `HTTP ${res.status}`));
        const list: any[] = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
        const mapped: City[] = list.map(c => ({ id: Number(c?.id), name: String(c?.name ?? '') }))
                                   .filter(c => Number.isFinite(c.id) && c.name);
        if (!cancelled) setCities(mapped);
      } catch (e: any) {
        if (!cancelled) setCitiesError(e?.message || 'Şehir listesi alınamadı.');
      } finally {
        if (!cancelled) setCitiesLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [stateId]);

  // ---- Submit
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true); setOkMsg(null); setErrMsg(null);

    if (!geo?.lat || !geo?.lng) {
      setSaving(false);
      setErrMsg('Lütfen haritadan restoran konumunu seçin.');
      return;
    }

    const fd = new FormData(e.currentTarget);
    const payload = {
      email:         String(fd.get('email') || ''),
      password:      String(fd.get('password') || ''),
      phone:         String(fd.get('phone') || ''),
      name:          String(fd.get('name') || ''),
      contactPerson: String(fd.get('contactPerson') || ''),
      taxNumber:     String(fd.get('taxNumber') || ''),
      addresLine1:  String(fd.get('addresLine1') || ''), // düzeltildi
      addressLine2:  String(fd.get('addressLine2') || ''),
      countryId: Number(countryId || 0),
      stateId:   Number(stateId   || 0),
      cityId:    Number(cityId    || 0),
      latitude:  Number(geo.lat.toFixed(6)),
      longitude: Number(geo.lng.toFixed(6)),
    };

    try {
      const res  = await fetch('/yuksi/Restaurant/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        cache: 'no-store',
      });
      const data = await readJson(res);
      if (!res.ok) throw new Error(pickMsg(data, `HTTP ${res.status}`));

      setOkMsg(data?.data?.message || 'Restoran başarıyla kaydedildi.');
      setFormKey(k => k + 1);
      setCountryId(''); setStates([]); setStateId(''); setCities([]); setCityId('');
      setGeo(null);
    } catch (ex: any) {
      setErrMsg(ex?.message || 'Kayıt başarısız.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="px-2 sm:px-0">
        <h1 className="text-2xl font-semibold tracking-tight">Yeni Restoran Kaydı</h1>
      </div>

      <form key={formKey} onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-2">
        {/* Sol kolon – zorunlu alanlar + Geo seçimleri */}
        <section className="rounded-2xl border border-neutral-200/70 bg-white p-6 shadow-sm soft-card">
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">Restoran Adı</label>
              <input name="name" required className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 outline-none ring-2 ring-transparent transition focus:ring-sky-200" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">Yetkili Ad Soyad</label>
              <input name="contactPerson" required className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 outline-none ring-2 ring-transparent transition focus:ring-sky-200" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">Telefon</label>
              <input name="phone" type="tel" required placeholder="+90 5xx xxx xx xx" className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 outline-none ring-2 ring-transparent transition focus:ring-sky-200" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">E-posta</label>
                <input name="email" type="email" required placeholder="ornek@eposta.com" className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 outline-none ring-2 ring-transparent transition focus:ring-sky-200" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">Şifre</label>
                <input name="password" type="password" required placeholder="••••••••" className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 outline-none ring-2 ring-transparent transition focus:ring-sky-200" />
              </div>
            </div>

            {/* Ülke / State */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">Ülke</label>
                <select
                  value={countryId}
                  onChange={(e) => setCountryId(e.target.value ? Number(e.target.value) : '')}
                  className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2"
                >
                  <option value="">{countriesLoading ? 'Yükleniyor…' : 'Ülke seçin…'}</option>
                  {countriesError && <option value="">{countriesError}</option>}
                  {!countriesLoading && !countriesError && countries.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">Eyalet / İl</label>
                <select
                  value={stateId}
                  onChange={(e) => setStateId(e.target.value ? Number(e.target.value) : '')}
                  disabled={!countryId || statesLoading}
                  className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 disabled:opacity-60"
                >
                  <option value="">
                    {statesLoading ? 'Yükleniyor…' : (countryId ? 'Eyalet/İl seçin…' : 'Önce ülke seçin')}
                  </option>
                  {statesError && <option value="">{statesError}</option>}
                  {!statesLoading && !statesError && states.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* City + Vergi No */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">Şehir</label>
                <select
                  value={cityId}
                  onChange={(e) => setCityId(e.target.value ? Number(e.target.value) : '')}
                  disabled={!stateId || citiesLoading}
                  className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 disabled:opacity-60"
                >
                  <option value="">
                    {citiesLoading ? 'Yükleniyor…' : (stateId ? 'Şehir seçin…' : 'Önce eyalet/il seçin')}
                  </option>
                  {citiesError && <option value="">{citiesError}</option>}
                  {!citiesLoading && !citiesError && cities.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">Vergi No</label>
                <input name="taxNumber" required className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 outline-none ring-2 ring-transparent transition focus:ring-sky-200" />
              </div>
            </div>
          </div>
        </section>

        {/* Sağ kolon – Adres + Harita + Submit */}
        <section className="rounded-2xl border border-neutral-200/70 bg-white p-6 shadow-sm soft-card">
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">Adres Satırı 1</label>
              <input name="addresLine1" placeholder="Mah., Cad., No" className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 outline-none ring-2 ring-transparent transition focus:ring-sky-200" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">Adres Satırı 2 (opsiyonel)</label>
              <input name="addressLine2" placeholder="Daire, Bina, Not" className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 outline-none ring-2 ring-transparent transition focus:ring-sky-200" />
            </div>

            {/* Harita Seçimi */}
            <div className="mt-4">
              <MapPicker
                label="Restoran Konumu (haritaya tıkla)"
                value={geo}
                onChange={(p) => setGeo(p)}
                defaultCenter={{ lat: 41.015137, lng: 28.97953 }}
              />
              {!geo && <p className="mt-2 text-xs text-amber-600">Konum seçilmedi.</p>}
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-orange-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? 'Kaydediliyor…' : 'Kaydet'}
            </button>
          </div>

          {okMsg && (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {okMsg}
            </div>
          )}
          {errMsg && (
            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {errMsg}
            </div>
          )}
        </section>
      </form>
    </div>
  );
}

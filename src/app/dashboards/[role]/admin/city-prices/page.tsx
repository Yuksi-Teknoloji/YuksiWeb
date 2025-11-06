// src/app/dashboards/[role]/admin/city-prices/page.tsx
'use client';

import * as React from 'react';
import { X } from 'lucide-react';

/* ================= Helpers ================= */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  for (const k of ['auth_token', 'token', 'access_token', 'jwt', 'auth']) {
    const v = localStorage.getItem(k);
    if (v && v.trim()) return v.replace(/^Bearer\s+/i, '').trim();
  }
  return null;
}
async function readJson<T = any>(res: Response): Promise<T> {
  const t = await res.text();
  try { return t ? JSON.parse(t) : (null as any); } catch { return (t as any); }
}
const pickMsg = (d: any, fb: string) => d?.message || d?.detail || d?.title || fb;

/* ================= API Types ================= */
/** BE → id uuid (string), location alanları ID olarak döner */
type CityPriceApi = {
  id: string;                 // UUID
  route_name: string;
  country_id: number;
  state_id: number;
  city_id: number;
  courier_price: number;
  minivan_price: number;
  panelvan_price: number;
  kamyonet_price: number;
  kamyon_price: number;
  created_at?: string | null;
};

type Country = { id: number; name: string; iso2?: string; iso3?: string; phonecode?: string };
type State   = { id: number; name: string };
type City    = { id: number; name: string };

/* ================= UI Types ================= */
type Row = {
  id: string;        // price UUID
  lineName: string;
  country: string;   // eşlenen isim
  state: string;     // eşlenen isim
  city: string;      // eşlenen isim
  prices: {
    kurye: number;
    minivan: number;
    panelvan: number;
    kamyonet: number;
    kamyon: number;
  };
  createdAt?: string;
};

type FormState = {
  route_name: string;
  country_id?: number | '';
  state_id?: number | '';
  city_id?: number | '';
  courier_price: number | string;
  minivan_price: number | string;
  panelvan_price: number | string;
  kamyonet_price: number | string;
  kamyon_price: number | string;
};

/* ================= Page ================= */
export default function CityPricesPage() {
  const token = React.useMemo(getAuthToken, []);
  const headers = React.useMemo<HeadersInit>(() => {
    const h: HeadersInit = { Accept: 'application/json' };
    if (token) (h as any).Authorization = `Bearer ${token}`;
    return h;
  }, [token]);

  const [rows, setRows] = React.useState<Row[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [queryCountry, setQueryCountry] = React.useState('');
  const [queryState, setQueryState] = React.useState('');

  // modal
  const [isOpen, setIsOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  // form
  const [form, setForm] = React.useState<FormState>({
    route_name: '',
    country_id: '',
    state_id: '',
    city_id: '',
    courier_price: 0,
    minivan_price: 0,
    panelvan_price: 0,
    kamyonet_price: 0,
    kamyon_price: 0,
  });

  /* --------- GEO (select'ler için) --------- */
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

  // ÜLKELER (genel liste)
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      setCountriesLoading(true);
      setCountriesError(null);
      try {
        const url = new URL('/yuksi/geo/countries', location.origin);
        url.searchParams.set('limit', '200');
        url.searchParams.set('offset', '0');
        const res  = await fetch(url.toString(), { cache: 'no-store' });
        const data = await readJson(res);
        if (!res.ok) throw new Error(pickMsg(data, `HTTP ${res.status}`));
        const list: any[] = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
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

  // STATE’LER (select zinciri)
  React.useEffect(() => {
    setStates([]); setStateId(''); setCities([]); setCityId('');
    setForm(p => ({ ...p, state_id: '', city_id: '' }));
    if (countryId === '' || !Number.isFinite(Number(countryId))) return;

    let cancelled = false;
    (async () => {
      setStatesLoading(true);
      setStatesError(null);
      try {
        const url = new URL('/yuksi/geo/states', location.origin);
        url.searchParams.set('country_id', String(countryId));
        url.searchParams.set('limit', '500');
        url.searchParams.set('offset', '0');
        const res  = await fetch(url.toString(), { cache: 'no-store' });
        const data = await readJson(res);
        if (!res.ok) throw new Error(pickMsg(data, `HTTP ${res.status}`));
        const list: any[] = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
        const mapped: State[] = list.map((s) => ({ id: Number(s?.id), name: String(s?.name ?? '') }))
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

  // CITIES (select zinciri)
  React.useEffect(() => {
    setCities([]); setCityId('');
    setForm(p => ({ ...p, city_id: '' }));
    if (stateId === '' || !Number.isFinite(Number(stateId))) return;

    let cancelled = false;
    (async () => {
      setCitiesLoading(true);
      setCitiesError(null);
      try {
        const url = new URL('/yuksi/geo/cities', location.origin);
        url.searchParams.set('state_id', String(stateId));
        url.searchParams.set('limit', '1000');
        url.searchParams.set('offset', '0');
        const res  = await fetch(url.toString(), { cache: 'no-store' });
        const data = await readJson(res);
        if (!res.ok) throw new Error(pickMsg(data, `HTTP ${res.status}`));
        const list: any[] = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
        const mapped: City[] = list.map((c) => ({ id: Number(c?.id), name: String(c?.name ?? '') }))
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

  /* --------- Liste + ID→İsim Eşleme --------- */
  const loadList = React.useCallback(async () => {
    setLoading(true); setError(null);
    let cancelled = false;
    try {
      // 1) Fiyat listesi (ID'lerle)
      const res = await fetch('/yuksi/admin/city-prices', { cache: 'no-store', headers });
      const j: any = await readJson(res);
      if (!res.ok || j?.success === false) throw new Error(pickMsg(j, `HTTP ${res.status}`));

      const list: CityPriceApi[] = Array.isArray(j?.data) ? j.data : (Array.isArray(j) ? j : []);
      // ID’leri topla
      const uniqueCountryIds = new Set<number>();
      const uniqueStateIds   = new Set<number>();
      const uniqueCityIds    = new Set<number>();

      for (const x of list) {
        if (Number.isFinite(Number(x.country_id))) uniqueCountryIds.add(Number(x.country_id));
        if (Number.isFinite(Number(x.state_id)))   uniqueStateIds.add(Number(x.state_id));
        if (Number.isFinite(Number(x.city_id)))    uniqueCityIds.add(Number(x.city_id));
      }

      // 2) Ülke isim haritası (ülkeleri zaten yukarıda çektik; yedek olarak tekrar çekmeyelim)
      const countryMap = new Map<number, string>(countries.map(c => [c.id, c.name]));

      // 3) State ve City isim haritaları (ülkeye ve eyalete göre bölerek çek)
      const stateMap = new Map<number, string>();
      const cityMap  = new Map<number, string>();

      // a) Eyaletler: listedeki her ülke için states al ve gerekli id’leri eşle
      const countriesToFetch = new Set<number>();
      // countries state'lerini bilmediğimiz için listedeki country_id'leri kullan
      for (const x of list) {
        const cid = Number(x.country_id);
        if (Number.isFinite(cid)) countriesToFetch.add(cid);
      }

      // Paralel çekim
      await Promise.all(
        Array.from(countriesToFetch).map(async (cid) => {
          const url = new URL('/yuksi/geo/states', location.origin);
          url.searchParams.set('country_id', String(cid));
          url.searchParams.set('limit', '500');
          url.searchParams.set('offset', '0');
          const r = await fetch(url.toString(), { cache: 'no-store' });
          const d = await readJson(r);
          if (r.ok) {
            const arr: any[] = Array.isArray(d) ? d : (Array.isArray(d?.data) ? d.data : []);
            for (const s of arr) {
              const sid = Number(s?.id);
              const name = String(s?.name ?? '');
              if (Number.isFinite(sid) && name) stateMap.set(sid, name);
            }
          }
        })
      );

      // b) Şehirler: listedeki her state için cities al ve gerekli id’leri eşle
      const statesToFetch = new Set<number>();
      for (const x of list) {
        const sid = Number(x.state_id);
        if (Number.isFinite(sid)) statesToFetch.add(sid);
      }
      await Promise.all(
        Array.from(statesToFetch).map(async (sid) => {
          const url = new URL('/yuksi/geo/cities', location.origin);
          url.searchParams.set('state_id', String(sid));
          url.searchParams.set('limit', '1000');
          url.searchParams.set('offset', '0');
          const r = await fetch(url.toString(), { cache: 'no-store' });
          const d = await readJson(r);
          if (r.ok) {
            const arr: any[] = Array.isArray(d) ? d : (Array.isArray(d?.data) ? d.data : []);
            for (const c of arr) {
              const cid = Number(c?.id);
              const name = String(c?.name ?? '');
              if (Number.isFinite(cid) && name) cityMap.set(cid, name);
            }
          }
        })
      );

      if (cancelled) return;

      // 4) Listeyi isimlerle map et
      const mapped: Row[] = list.map((x) => ({
        id: String(x.id),
        lineName: String(x.route_name ?? ''),
        country: countryMap.get(Number(x.country_id)) ?? `#${x.country_id}`,
        state:   stateMap.get(Number(x.state_id))     ?? `#${x.state_id}`,
        city:    cityMap.get(Number(x.city_id))       ?? `#${x.city_id}`,
        prices: {
          kurye: Number(x.courier_price ?? 0),
          minivan: Number(x.minivan_price ?? 0),
          panelvan: Number(x.panelvan_price ?? 0),
          kamyonet: Number(x.kamyonet_price ?? 0),
          kamyon: Number(x.kamyon_price ?? 0),
        },
        createdAt: x.created_at ?? undefined,
      }));

      setRows(mapped);
    } catch (e: any) {
      setError(e?.message || 'Şehir fiyat listesi alınamadı.');
      setRows([]);
    } finally {
      setLoading(false);
    }
    return () => { cancelled = true; };
  // countries bağımlı çünkü countryMap ondan kuruluyor
  }, [headers, countries]);

  React.useEffect(() => { loadList(); }, [loadList]);

  /* --------- Modal open/close --------- */
  function openCreate() {
    setEditingId(null);
    setForm({
      route_name: '',
      country_id: '',
      state_id: '',
      city_id: '',
      courier_price: 0,
      minivan_price: 0,
      panelvan_price: 0,
      kamyonet_price: 0,
      kamyon_price: 0,
    });
    setCountryId(''); setStates([]); setStateId(''); setCities([]); setCityId('');
    setIsOpen(true);
  }

  function openEdit(r: Row) {
    setEditingId(r.id);
    setForm({
      route_name: r.lineName,
      country_id: '',
      state_id: '',
      city_id: '',
      courier_price: r.prices.kurye,
      minivan_price: r.prices.minivan,
      panelvan_price: r.prices.panelvan,
      kamyonet_price: r.prices.kamyonet,
      kamyon_price: r.prices.kamyon,
    });
    setCountryId(''); setStates([]); setStateId(''); setCities([]); setCityId('');
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
  }

  /* --------- CRUD --------- */
  function setFormKey<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  async function save() {
    if (!String(form.route_name).trim()) {
      alert('Hat adı (route_name) zorunlu.');
      return;
    }
    if (!countryId || !stateId || !cityId) {
      alert('Ülke, il/eyalet ve şehir seçiniz.');
      return;
    }

    const payload = {
      route_name: form.route_name,
      country_id: Number(countryId),
      state_id: Number(stateId),
      city_id: Number(cityId),
      courier_price: Number(form.courier_price || 0),
      minivan_price: Number(form.minivan_price || 0),
      panelvan_price: Number(form.panelvan_price || 0),
      kamyonet_price: Number(form.kamyonet_price || 0),
      kamyon_price: Number(form.kamyon_price || 0),
    };

    setSaving(true);
    try {
      if (editingId == null) {
        const res = await fetch('/yuksi/admin/city-prices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...headers },
          body: JSON.stringify(payload),
        });
        const j = await readJson(res);
        if (!res.ok || (j as any)?.success === false) throw new Error(pickMsg(j, `HTTP ${res.status}`));
      } else {
        const res = await fetch(`/yuksi/admin/city-prices/${encodeURIComponent(editingId)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', ...headers },
          body: JSON.stringify(payload),
        });
        const j = await readJson(res);
        if (!res.ok || (j as any)?.success === false) throw new Error(pickMsg(j, `HTTP ${res.status}`));
      }
      await loadList();
      setIsOpen(false);
    } catch (e: any) {
      alert(e?.message || 'Kaydetme başarısız.');
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm('Bu hattı silmek istediğinize emin misiniz?')) return;
    try {
      const res = await fetch(`/yuksi/admin/city-prices/${encodeURIComponent(id)}`, { method: 'DELETE', headers });
      const j = await readJson(res);
      if (!res.ok || (j as any)?.success === false) throw new Error(pickMsg(j, `HTTP ${res.status}`));
      await loadList();
    } catch (e: any) {
      alert(e?.message || 'Silme işlemi başarısız.');
    }
  }

  /* --------- Simple filters (text) --------- */
  const filtered = rows.filter(r => {
    const byCountry = queryCountry.trim()
      ? r.country.toLowerCase().includes(queryCountry.toLowerCase())
      : true;
    const byState = queryState.trim()
      ? r.state.toLowerCase().includes(queryState.toLowerCase())
      : true;
    return byCountry && byState;
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Şehir Hat Fiyatları</h1>

      {/* Top bar */}
      <section className="rounded-2xl border border-neutral-200/70 bg-white p-4 shadow-sm soft-card">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <button
            onClick={openCreate}
            className="btn-accent rounded-2xl bg-orange-500 text-white px-4 py-2 text-sm font-medium shadow-sm transition active:translate-y-px"
          >
            Yeni Hat Ekle
          </button>

          <div className="flex gap-4">
            <div className="w-64">
              <label className="mb-1 block text-sm font-semibold text-neutral-600">Ülke</label>
              <input
                placeholder="Ülke adına göre filtrele"
                value={queryCountry}
                onChange={e => setQueryCountry(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 outline-none ring-2 ring-transparent transition focus:bg-white focus:ring-sky-200"
              />
            </div>
            <div className="w-64">
              <label className="mb-1 block text-sm font-semibold text-neutral-600">İl/Eyalet</label>
              <input
                placeholder="İl/eyalet adına göre filtrele"
                value={queryState}
                onChange={e => setQueryState(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 outline-none ring-2 ring-transparent transition focus:bg-white focus:ring-sky-200"
              />
            </div>
          </div>
        </div>
      </section>

      {/* List */}
      <section className="rounded-2xl border border-neutral-200/70 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-neutral-200/70 text-left text-sm text-neutral-500">
                <th className="px-6 py-3 font-medium">Hat Adı</th>
                <th className="px-6 py-3 font-medium">Ülke</th>
                <th className="px-6 py-3 font-medium">İl/Eyalet</th>
                <th className="px-6 py-3 font-medium">Şehir</th>
                <th className="px-6 py-3 font-medium">Fiyatlar</th>
                <th className="px-6 py-3 font-medium w-[180px]">Oluşturma</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={7} className="px-6 py-10 text-center text-sm text-neutral-500">Yükleniyor…</td></tr>
              )}

              {!loading && filtered.map(r => (
                <tr key={r.id} className="border-t border-neutral-200/70 align-top hover:bg-neutral-50">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-neutral-900">{r.lineName}</div>
                  </td>
                  <td className="px-6 py-4">{r.country}</td>
                  <td className="px-6 py-4">{r.state}</td>
                  <td className="px-6 py-4">{r.city}</td>
                  <td className="px-6 py-4">
                    <div className="whitespace-pre-line text-neutral-800 text-sm leading-5">
                      {[
                        `Kurye : ${r.prices.kurye} ₺`,
                        `Minivan : ${r.prices.minivan} ₺`,
                        `Panelvan : ${r.prices.panelvan} ₺`,
                        `Kamyonet : ${r.prices.kamyonet} ₺`,
                        `Kamyon : ${r.prices.kamyon} ₺`,
                      ].join('\n')}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-600">
                    {r.createdAt ? new Date(r.createdAt).toLocaleString('tr-TR') : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => openEdit(r)}
                        className="rounded-lg bg-emerald-500 px-4 py-1.5 text-sm font-semibold text-white shadow hover:bg-emerald-600"
                      >
                        Düzenle
                      </button>
                      <button
                        onClick={() => remove(r.id)}
                        className="rounded-lg bg-rose-500 px-4 py-1.5 text-sm font-semibold text-white shadow hover:bg-rose-600"
                      >
                        Sil
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-neutral-500">
                    Kayıt bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {error && <div className="px-6 py-3 text-sm text-rose-600">{error}</div>}
      </section>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <div className="max-h,[92vh] w-full max-w-3xl overflow-auto rounded-2xl bg-white shadow-xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-200/70 bg-white p-4">
              <div className="text-lg font-semibold">{editingId == null ? 'Yeni Hat' : `Hat Düzenle (#${editingId})`}</div>
              <button
                onClick={closeModal}
                className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100"
                aria-label="Kapat"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-3 p-4 sm:grid-cols-2">
              <Input label="Hat Adı" value={form.route_name} onChange={(v) => setFormKey('route_name', v)} />

              {/* Ülke */}
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">Ülke</label>
                <select
                  value={countryId}
                  onChange={(e) => {
                    const val = e.target.value ? Number(e.target.value) : '';
                    setCountryId(val);
                    setFormKey('country_id', val as any);
                  }}
                  className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2"
                >
                  <option value="">{countriesLoading ? 'Yükleniyor…' : 'Ülke seçin…'}</option>
                  {countriesError && <option value="">{countriesError}</option>}
                  {!countriesLoading && !countriesError && countries.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Eyalet/İl */}
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">Eyalet / İl</label>
                <select
                  value={stateId}
                  onChange={(e) => {
                    const val = e.target.value ? Number(e.target.value) : '';
                    setStateId(val);
                    setFormKey('state_id', val as any);
                  }}
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

              {/* Şehir */}
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-neutral-700">Şehir / İlçe</label>
                <select
                  value={cityId}
                  onChange={(e) => {
                    const val = e.target.value ? Number(e.target.value) : '';
                    setCityId(val);
                    setFormKey('city_id', val as any);
                  }}
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

              {/* Prices */}
              <NumberInput label="Kurye Km Ücreti"   value={form.courier_price}  onChange={(v) => setFormKey('courier_price', v)} />
              <NumberInput label="Minivan Km Ücreti"  value={form.minivan_price}  onChange={(v) => setFormKey('minivan_price', v)} />
              <NumberInput label="Panelvan Km Ücreti" value={form.panelvan_price} onChange={(v) => setFormKey('panelvan_price', v)} />
              <NumberInput label="Kamyonet Km Ücreti" value={form.kamyonet_price} onChange={(v) => setFormKey('kamyonet_price', v)} />
              <NumberInput label="Kamyon Km Ücreti"   value={form.kamyon_price}   onChange={(v) => setFormKey('kamyon_price', v)} />

              <div className="mt-4 flex items-center justify-end gap-3 sm:col-span-2">
                <button
                  onClick={closeModal}
                  className="rounded-xl bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600 ring-1 ring-rose-200 hover:bg-rose-100"
                >
                  İptal
                </button>
                <button
                  onClick={save}
                  disabled={saving}
                  className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-600 disabled:opacity-60"
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

/* ================= inputs ================= */
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
        className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 outline-none ring-2 ring-transparent transition focus:bg-white focus:ring-sky-200"
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
        className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 outline-none ring-2 ring-transparent transition focus:bg-white focus:ring-sky-200"
      />
    </div>
  );
}

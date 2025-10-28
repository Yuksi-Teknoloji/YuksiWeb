// src/app/dashboards/[role]/admin/companies/create/page.tsx
'use client';

import * as React from 'react';
import { getAuthToken } from '@/utils/auth';

/* ---- API payload ---- */
type CreateCompanyBody = {
  companyTrackingNo: string;
  assignedKilometers: number;
  specialCommissionRate: number;
  isVisible: boolean;
  canReceivePayments: boolean;
  cityId: number;      // = seçilen ŞEHİR (state) ID
  districtId: number;  // = seçilen İLÇE (city) ID
  location: string;
  companyName: string;
  companyPhone: string;
  description: string;
};

/* ---- Form state ---- */
type FormState = {
  companyTrackingNo: string;
  assignedKilometers: string;
  specialCommissionRate: string;
  isVisible: boolean;
  canReceivePayments: boolean;
  location: string;
  companyName: string;
  companyPhone: string;
  description: string;
};

/* ---- Geo tipleri ---- */
type StateOpt = { id: number; name: string };
type CityOpt  = { id: number; name: string };

/* ---- helpers ---- */
async function readJson<T = any>(res: Response): Promise<T> {
  const t = await res.text();
  try { return t ? JSON.parse(t) : (null as any); } catch { return (t as any); }
}
const pickMsg = (d: any, fb: string) =>
  d?.error?.message || d?.message || d?.detail || d?.title || fb;

/* ---- constants ---- */
const TR_COUNTRY_ID = 225;

const initialForm: FormState = {
  companyTrackingNo: Math.random().toString(36).slice(2, 10).toUpperCase(),
  assignedKilometers: '',
  specialCommissionRate: '',
  isVisible: true,
  canReceivePayments: true,
  location: '',
  companyName: '',
  companyPhone: '',
  description: '',
};

export default function CreateCompaniesPage() {
  const [form, setForm] = React.useState<FormState>(initialForm);
  const [submitting, setSubmitting] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);
  const token = React.useMemo(getAuthToken, []);
  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  /* -------- GEO STATE (ülke=225 sabit) -------- */
  const [states, setStates] = React.useState<StateOpt[]>([]);
  const [stateId, setStateId] = React.useState<number | ''>(''); // ŞEHİR
  const [statesLoading, setStatesLoading] = React.useState(false);
  const [statesError, setStatesError] = React.useState<string | null>(null);

  const [cities, setCities] = React.useState<CityOpt[]>([]);
  const [cityId, setCityId] = React.useState<number | ''>('');   // İLÇE
  const [citiesLoading, setCitiesLoading] = React.useState(false);
  const [citiesError, setCitiesError] = React.useState<string | null>(null);

  // Ülke sabit: 225 → states (şehir) çek
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      setStatesLoading(true); setStatesError(null);
      try {
        const url = new URL('/yuksi/geo/states', location.origin);
        url.searchParams.set('country_id', String(TR_COUNTRY_ID));
        url.searchParams.set('limit', '500');
        url.searchParams.set('offset', '0');

        const res = await fetch(url.toString(), { cache: 'no-store' });
        const data = await readJson(res);
        if (!res.ok) throw new Error(pickMsg(data, `HTTP ${res.status}`));

        const list: any[] = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
        const mapped: StateOpt[] = list
          .map(s => ({ id: Number(s?.id), name: String(s?.name ?? '') }))
          .filter(s => Number.isFinite(s.id) && s.name);

        if (!cancelled) setStates(mapped);
      } catch (e: any) {
        if (!cancelled) setStatesError(e?.message || 'Şehir listesi alınamadı.');
      } finally {
        if (!cancelled) setStatesLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Şehir (state) değişince cities (ilçe) çek
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
        const mapped: CityOpt[] = list
          .map(c => ({ id: Number(c?.id), name: String(c?.name ?? '') }))
          .filter(c => Number.isFinite(c.id) && c.name);

        if (!cancelled) setCities(mapped);
      } catch (e: any) {
        if (!cancelled) setCitiesError(e?.message || 'İlçe listesi alınamadı.');
      } finally {
        if (!cancelled) setCitiesLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [stateId]);

  /* -------- Submit -------- */
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    if (!form.companyName.trim()) return setErr('Şirket adı zorunludur.');
    if (!form.companyPhone.trim()) return setErr('Şirket telefonu zorunludur.');
    if (stateId === '' || cityId === '') return setErr('Şehir ve ilçe seçiniz.');

    const body: CreateCompanyBody = {
      companyTrackingNo: form.companyTrackingNo.trim(),
      assignedKilometers: Number(form.assignedKilometers) || 0,
      specialCommissionRate: Number(form.specialCommissionRate) || 0,
      isVisible: !!form.isVisible,
      canReceivePayments: !!form.canReceivePayments,
      cityId: Number(stateId),     // <— ŞEHİR (state)
      districtId: Number(cityId),  // <— İLÇE (city)
      location: form.location.trim(),
      companyName: form.companyName.trim(),
      companyPhone: form.companyPhone.trim(),
      description: form.description.trim(),
    };

    setSubmitting(true);
    try {
      const res = await fetch('/yuksi/admin/companies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });

      const data = await readJson(res);
      if (!res.ok || data?.success === false) {
        throw new Error(pickMsg(data, `HTTP ${res.status}`));
      }

      alert('Şirket başarıyla oluşturuldu.');
      setForm(initialForm);
      setStateId(''); setCities([]); setCityId('');
    } catch (e: any) {
      setErr(e?.message || 'Şirket oluşturulamadı.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-10 bg-white">
        <div className="flex gap-6 border-b px-4 py-2 text-sm font-semibold">
          <button className="text-orange-600">Şirket Oluştur</button>
          <a href="/dashboards/admin/admin/companies/company-list" className="text-neutral-700 opacity-70 hover:opacity-100">Şirket Listesi</a>
          <a href="/dashboards/admin/admin/companies/authorized-person" className="text-neutral-700 opacity-70 hover:opacity-100">Yetkili Kişiler</a>
        </div>
      </div>

      <form onSubmit={onSubmit} className="mx-auto max-w-4xl space-y-6 px-3 py-6">
        <section className="rounded-xl bg-orange-50 p-4 ring-1 ring-orange-100 space-y-4">
          <Field label="Takip No">
            <input value={form.companyTrackingNo} readOnly className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 outline-none"/>
          </Field>

          <Field label="Atanmış Kilometre (km)">
            <input
              type="number"
              inputMode="numeric"
              value={form.assignedKilometers}
              onChange={(e) => set('assignedKilometers', e.target.value)}
              className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 outline-none"
            />
          </Field>

          <Field label="Özel Komisyon Oranı (%)">
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              value={form.specialCommissionRate}
              onChange={(e) => set('specialCommissionRate', e.target.value)}
              className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 outline-none"
            />
          </Field>

          <Field label="Sistemde Görünsün">
            <OnOff on={form.isVisible} onClick={(v) => set('isVisible', v)} />
          </Field>

          <Field label="Ödeme Alabilsin">
            <OnOff on={form.canReceivePayments} onClick={(v) => set('canReceivePayments', v)} />
          </Field>

          {/* Şehir (state) & İlçe (city) */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">Şehir</label>
              <select
                value={stateId}
                onChange={(e) => setStateId(e.target.value ? Number(e.target.value) : '')}
                className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2"
              >
                <option value="">
                  {statesLoading ? 'Yükleniyor…' : 'Şehir seçin…'}
                </option>
                {statesError && <option value="">{statesError}</option>}
                {!statesLoading && !statesError && states.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">İlçe</label>
              <select
                value={cityId}
                onChange={(e) => setCityId(e.target.value ? Number(e.target.value) : '')}
                disabled={!stateId || citiesLoading}
                className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 disabled:opacity-60"
              >
                <option value="">
                  {citiesLoading ? 'Yükleniyor…' : (stateId ? 'İlçe seçin…' : 'Önce şehir seçin')}
                </option>
                {citiesError && <option value="">{citiesError}</option>}
                {!citiesLoading && !citiesError && cities.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <Field label="Konum (adres/POI)">
            <input
              value={form.location}
              onChange={(e) => set('location', e.target.value)}
              placeholder="Açık adres veya açıklama"
              className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 outline-none"
            />
          </Field>
        </section>

        <section className="rounded-xl bg-orange-50 p-4 ring-1 ring-orange-100 space-y-4">
          <Field label="Şirket Adı">
            <input
              value={form.companyName}
              onChange={(e) => set('companyName', e.target.value)}
              className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 outline-none"
            />
          </Field>

          <Field label="Şirket Telefonu">
            <input
              value={form.companyPhone}
              onChange={(e) => set('companyPhone', e.target.value)}
              className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 outline-none"
            />
          </Field>

          <Field label="Açıklama">
            <textarea
              rows={5}
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 outline-none"
            />
          </Field>
        </section>

        {err && (
          <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {err}
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-orange-700 disabled:opacity-60"
          >
            {submitting ? 'Gönderiliyor…' : 'Şirketi Oluştur'}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ---- küçük UI parçaları ---- */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid items-center gap-2 sm:grid-cols-[220px_1fr]">
      <div className="text-sm font-medium text-neutral-700">{label}</div>
      <div>{children}</div>
    </div>
  );
}

function OnOff({ on, onClick }: { on: boolean; onClick: (next: boolean) => void }) {
  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => onClick(true)}
        className={`rounded-md px-3 py-2 text-sm font-semibold shadow-sm ${
          on ? 'bg-orange-500 text-white' : 'bg-white ring-1 ring-neutral-200'
        }`}
      >
        ON
      </button>
      <button
        type="button"
        onClick={() => onClick(false)}
        className={`rounded-md px-3 py-2 text-sm font-semibold shadow-sm ${
          !on ? 'bg-orange-500 text-white' : 'bg-white ring-1 ring-neutral-200'
        }`}
      >
        OFF
      </button>
    </div>
  );
}

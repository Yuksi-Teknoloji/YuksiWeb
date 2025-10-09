// src/app/dashboards/[role]/admin/restaurants/create-restaurant/page.tsx
"use client";

import * as React from "react";
import { API_BASE } from '@/configs/api'; 

type Country = { id: number; name: string; code?: string; phoneCode?: string };
type City    = { id: number; name: string };
type District= { id: number; name: string };



export default function RestaurantCreatePage() {
  const [saving, setSaving] = React.useState(false);
  const [okMsg, setOkMsg] = React.useState<string | null>(null);
  const [errMsg, setErrMsg] = React.useState<string | null>(null);

  // ---- Ülke
  const [countries, setCountries] = React.useState<Country[]>([]);
  const [countriesLoading, setCountriesLoading] = React.useState(false);
  const [countriesError, setCountriesError] = React.useState<string | null>(null);
  const [countryId, setCountryId] = React.useState<number | "">("");

  // ---- Şehir
  const [cities, setCities] = React.useState<City[]>([]);
  const [citiesLoading, setCitiesLoading] = React.useState(false);
  const [citiesError, setCitiesError] = React.useState<string | null>(null);
  const [cityId, setCityId] = React.useState<number | "">("");

  // ---- İlçe
  const [districts, setDistricts] = React.useState<District[]>([]);
  const [districtsLoading, setDistrictsLoading] = React.useState(false);
  const [districtsError, setDistrictsError] = React.useState<string | null>(null);
  const [districtId, setDistrictId] = React.useState<number | "">("");

  // ---- helpers
  async function readJson(res: Response) {
    const text = await res.text();
    try { return text ? JSON.parse(text) : null; } catch { throw new Error("Geçersiz JSON"); }
  }
  function extractErrorMessage(raw: any): string | null {
    if (!raw) return null;
    const container = (raw && typeof raw === "object" && raw.error) ? raw.error : raw;
    const errs = container?.errors || container?.data?.errors;
    if (errs && typeof errs === "object") {
      const parts: string[] = [];
      for (const k of Object.keys(errs)) {
        const v = errs[k];
        if (Array.isArray(v)) v.forEach((m: any) => parts.push(`${k}: ${m}`));
        else if (typeof v === "string") parts.push(`${k}: ${v}`);
      }
      if (parts.length) return parts.join("\n");
    }
    const direct = container?.message || container?.error || container?.detail || container?.title;
    if (typeof direct === "string" && direct.trim()) return direct.trim();
    try { return JSON.stringify(container); } catch { return String(container); }
  }

  // ---- Ülkeler
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      setCountriesLoading(true);
      setCountriesError(null);
      try {
        const res = await fetch(`${API_BASE}/api/Lookup/countries`, { cache: "no-store" });
        const data = await readJson(res);
        if (!res.ok) throw new Error(extractErrorMessage(data) || `HTTP ${res.status}`);
        const list = Array.isArray(data?.data) ? data.data : [];
        const mapped: Country[] = list
          .map((c: any) => ({ id: Number(c?.id), name: String(c?.name || "") }))
          .filter((c: Country) => Number.isFinite(c.id) && c.name);
        if (!cancelled) setCountries(mapped);
      } catch (e: any) {
        if (!cancelled) setCountriesError(e?.message || "Ülke listesi alınamadı.");
      } finally {
        if (!cancelled) setCountriesLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // ---- Ülke değişince şehirleri çek
  React.useEffect(() => {
    if (countryId === "" || !Number.isFinite(Number(countryId))) {
      setCities([]); setCityId(""); setDistricts([]); setDistrictId("");
      return;
    }
    let cancelled = false;
    (async () => {
      setCitiesLoading(true);
      setCitiesError(null);
      setCityId("");            // ülke değişince seçimi sıfırla
      setDistricts([]); setDistrictId("");
      try {
        const res = await fetch(`${API_BASE}/api/Lookup/cities/${countryId}`, { cache: "no-store" });
        const data = await readJson(res);
        if (!res.ok) throw new Error(extractErrorMessage(data) || `HTTP ${res.status}`);
        const list = Array.isArray(data?.data) ? data.data : [];
        const mapped: City[] = list
          .map((c: any) => ({ id: Number(c?.id), name: String(c?.name || "") }))
          .filter((c: City) => Number.isFinite(c.id) && c.name);
        if (!cancelled) setCities(mapped);
      } catch (e: any) {
        if (!cancelled) setCitiesError(e?.message || "Şehir listesi alınamadı.");
      } finally {
        if (!cancelled) setCitiesLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [countryId]);

  // ---- Şehir değişince ilçeleri çek
  React.useEffect(() => {
    if (cityId === "" || !Number.isFinite(Number(cityId))) {
      setDistricts([]); setDistrictId("");
      return;
    }
    let cancelled = false;
    (async () => {
      setDistrictsLoading(true);
      setDistrictsError(null);
      setDistrictId("");        // şehir değişince ilçeyi sıfırla
      try {
        const res = await fetch(`${API_BASE}/api/Lookup/districts/${cityId}`, { cache: "no-store" });
        const data = await readJson(res);
        if (!res.ok) throw new Error(extractErrorMessage(data) || `HTTP ${res.status}`);
        const list = Array.isArray(data?.data) ? data.data : [];
        const mapped: District[] = list
          .map((d: any) => ({ id: Number(d?.id), name: String(d?.name || "") }))
          .filter((d: District) => Number.isFinite(d.id) && d.name);
        if (!cancelled) setDistricts(mapped);
      } catch (e: any) {
        if (!cancelled) setDistrictsError(e?.message || "İlçe listesi alınamadı.");
      } finally {
        if (!cancelled) setDistrictsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [cityId]);

  // ---- Submit
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = e.currentTarget;
    setSaving(true); 
    setOkMsg(null); 
    setErrMsg(null);

    const fd = new FormData(form);
    const payload = {
      email:         String(fd.get("email") || ""),
      password:      String(fd.get("password") || ""),
      phone:         String(fd.get("phone") || ""),
      countryId:     Number(fd.get("countryId") || 0),
      name:          String(fd.get("name") || ""),
      contactPerson: String(fd.get("contactPerson") || ""),
      taxNumber:     String(fd.get("taxNumber") || ""),
      addresLine1:  String(fd.get("addresLine1") || ""),
      addressLine2:  String(fd.get("addressLine2") || ""),
      cityId:        Number(fd.get("cityId") || 0),
      districtId:    Number(fd.get("districtId") || 0),
    };

    try {
      const res = await fetch(`${API_BASE}/api/Restaurant/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        cache: "no-store",
      });
      const data = await readJson(res);
      if (!res.ok) throw new Error(extractErrorMessage(data) || `HTTP ${res.status}`);

      setOkMsg((data?.data && data?.data?.message) || "Restoran başarıyla kaydedildi.");
      (form).reset();
      // seçimleri de sıfırla:
      setCountryId(""); setCities([]); setCityId(""); setDistricts([]); setDistrictId("");
    } catch (err: any) {
      setErrMsg(err?.message || "Kayıt sırasında bir hata oluştu.");
    } finally { setSaving(false); }
  }

  return (
    <div className="space-y-4">
      <div className="px-2 sm:px-0">
        <h1 className="text-2xl font-semibold tracking-tight">Yeni Restoran Kaydı</h1>
      </div>

      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-2">
        {/* Sol kolon – zorunlu alanlar */}
        <section className="rounded-2xl border border-neutral-200/70 bg-white p-6 shadow-sm soft-card">
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">Restoran Adı</label>
              <input name="name" required className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 outline-none ring-2 ring-transparent transition focus:ring-sky-200"/>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">Yetkili Ad Soyad</label>
              <input name="contactPerson" required className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 outline-none ring-2 ring-transparent transition focus:ring-sky-200"/>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">Telefon</label>
              <input name="phone" type="tel" required placeholder="+90 5xx xxx xx xx" className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 outline-none ring-2 ring-transparent transition focus:ring-sky-200"/>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">E-posta</label>
              <input name="email" type="email" required placeholder="ornek@eposta.com" className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 outline-none ring-2 ring-transparent transition focus:ring-sky-200"/>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">Şifre</label>
              <input name="password" type="password" required placeholder="••••••••" className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 outline-none ring-2 ring-transparent transition focus:ring-sky-200"/>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">Ülke</label>

                {/* backend’e gidecek hidden değerler */}
                <input type="hidden" name="countryId"  value={countryId   === "" ? "" : String(countryId)} />
                <input type="hidden" name="cityId"     value={cityId      === "" ? "" : String(cityId)} />
                <input type="hidden" name="districtId" value={districtId  === "" ? "" : String(districtId)} />

                <select
                  value={countryId}
                  onChange={(e) => setCountryId(e.target.value ? Number(e.target.value) : "")}
                  className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 outline-none ring-2 ring-transparent transition focus:ring-sky-200"
                >
                  <option value="">{countriesLoading ? "Yükleniyor…" : "Ülke seçin…"}</option>
                  {countriesError && <option value="">{countriesError}</option>}
                  {!countriesLoading && !countriesError && countries.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">Şehir</label>
                <select
                  value={cityId}
                  onChange={(e) => setCityId(e.target.value ? Number(e.target.value) : "")}
                  disabled={!countryId || citiesLoading}
                  className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 outline-none ring-2 ring-transparent transition focus:ring-sky-200 disabled:opacity-60"
                >
                  <option value="">{citiesLoading ? "Yükleniyor…" : (countryId ? "Şehir seçin…" : "Önce ülke seçin")}</option>
                  {citiesError && <option value="">{citiesError}</option>}
                  {!citiesLoading && !citiesError && cities.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">İlçe</label>
                <select
                  value={districtId}
                  onChange={(e) => setDistrictId(e.target.value ? Number(e.target.value) : "")}
                  disabled={!cityId || districtsLoading}
                  className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 outline-none ring-2 ring-transparent transition focus:ring-sky-200 disabled:opacity-60"
                >
                  <option value="">{districtsLoading ? "Yükleniyor…" : (cityId ? "İlçe seçin…" : "Önce şehir seçin")}</option>
                  {districtsError && <option value="">{districtsError}</option>}
                  {!districtsLoading && !districtsError && districts.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">Vergi No</label>
                <input name="taxNumber" required className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 outline-none ring-2 ring-transparent transition focus:ring-sky-200"/>
              </div>
            </div>
          </div>
        </section>

        {/* Sağ kolon – Adres satırları */}
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
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-orange-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Kaydediliyor…" : "Kaydet"}
            </button>
          </div>

          {okMsg && <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{okMsg}</div>}
          {errMsg && <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{errMsg}</div>}
        </section>
      </form>
    </div>
  );
}

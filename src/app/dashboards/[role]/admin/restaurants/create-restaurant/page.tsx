// src/app/dashboards/[role]/admin/restaurants/create-restaurant/page.tsx
"use client";

import * as React from "react";

export default function RestaurantCreatePage() {
  const [saving, setSaving] = React.useState(false);
  const [okMsg, setOkMsg] = React.useState<string | null>(null);
  const [errMsg, setErrMsg] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setOkMsg(null);
    setErrMsg(null);

    const form = e.currentTarget;
    const fd = new FormData(form);

    // 💡 API'nin beklediği alanlar
    const payload = {
      email: String(fd.get("email") || ""),
      password: String(fd.get("password") || ""),
      phone: String(fd.get("phone") || ""),
      countryId: Number(fd.get("countryId") || 0),
      name: String(fd.get("name") || ""),               // Restoran adı
      contactPerson: String(fd.get("contactPerson") || ""), // Yetkili
      taxNumber: String(fd.get("taxNumber") || ""),
    };

    try {
      // İstersen doğrudan backend’e da vurabilirsin:
      // const res = await fetch("http://40.90.226.14:8080/api/Restaurant/register", {...})
      const res = await fetch("/api/Restaurant/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        cache: "no-store",
      });

      const text = await res.text();
      let data: any = null;
      try { data = text ? JSON.parse(text) : null; } catch { data = text; }

      if (!res.ok) {
        throw new Error(
          (typeof data === "object" ? data?.message || data?.error : null) ||
            `İstek başarısız (HTTP ${res.status})`
        );
      }

      const msg =
        (typeof data === "object" ? data?.data?.message : null) ||
        "Restoran başarıyla kaydedildi.";
      setOkMsg(msg);
      form.reset();
    } catch (err: any) {
      setErrMsg(err?.message || "Kayıt sırasında bir hata oluştu.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="px-2 sm:px-0">
        <h1 className="text-2xl font-semibold tracking-tight">Yeni Restoran Kaydı</h1>
      </div>

      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-2">
        {/* Sol kolon (API'ye giden zorunlu alanlar) */}
        <section className="rounded-2xl border border-neutral-200/70 bg-white p-6 shadow-sm soft-card">
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">Restoran Adı</label>
              <input
                name="name"
                required
                className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 outline-none ring-2 ring-transparent transition focus:ring-sky-200"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">Yetkili Ad Soyad</label>
              <input
                name="contactPerson"
                required
                className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 outline-none ring-2 ring-transparent transition focus:ring-sky-200"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">Telefon</label>
              <input
                name="phone"
                type="tel"
                required
                placeholder="+90 5xx xxx xx xx"
                className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 outline-none ring-2 ring-transparent transition focus:ring-sky-200"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">E-posta</label>
              <input
                name="email"
                type="email"
                required
                placeholder="ornek@eposta.com"
                className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 outline-none ring-2 ring-transparent transition focus:ring-sky-200"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">Şifre</label>
              <input
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 outline-none ring-2 ring-transparent transition focus:ring-sky-200"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">Ülke</label>
                <select
                  name="countryId"
                  defaultValue="1"
                  className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 outline-none ring-2 ring-transparent transition focus:ring-sky-200"
                >
                  <option value="1">Türkiye</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">Vergi No</label>
                <input
                  name="taxNumber"
                  required
                  className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 outline-none ring-2 ring-transparent transition focus:ring-sky-200"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Sağ kolon (opsiyonel – UI bilgileri, API'ye gönderilmiyor) */}
        <section className="rounded-2xl border border-neutral-200/70 bg-white p-6 shadow-sm soft-card">
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">Adres (opsiyonel)</label>
              <input
                name="address"
                placeholder="Adres"
                className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 outline-none ring-2 ring-transparent transition focus:ring-sky-200"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">İl</label>
                <input
                  name="city"
                  className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 outline-none ring-2 ring-transparent transition focus:ring-sky-200"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">İlçe</label>
                <input
                  name="district"
                  className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 outline-none ring-2 ring-transparent transition focus:ring-sky-200"
                />
              </div>
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

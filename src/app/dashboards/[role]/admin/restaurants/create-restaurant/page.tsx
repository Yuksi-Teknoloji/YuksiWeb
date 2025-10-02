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
        const msg = extractErrorMessage(data) || `İstek başarısız (HTTP ${res.status})`;
        throw new Error(msg);
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
  function extractErrorMessage(raw: any): string | null {
  if (!raw) return null;

  // Hata gövdesi bazen raw.error altında geliyor
  const container = (raw && typeof raw === "object" && raw.error) ? raw.error : raw;

  // 1) ASP.NET ModelState: { errors: { Field: [msg1, msg2], ... } }
  const errs = container?.errors || container?.data?.errors;
  if (errs && typeof errs === "object") {
    const parts: string[] = [];
    for (const key of Object.keys(errs)) {
      const arr = errs[key];
      if (Array.isArray(arr) && arr.length) {
        for (const v of arr) {
          const msg = typeof v === "string" ? v : String(v);
          parts.push(`${key}: ${msg}`);
        }
      } else if (typeof arr === "string") {
        parts.push(`${key}: ${arr}`);
      }
    }
    if (parts.length) return parts.join("\n");
  }

  // 2) Düz string ise
  if (typeof container === "string") return container;

  // 3) Genel alanlar (fallback)
  const direct =
    container?.message ||
    container?.error ||
    container?.detail ||
    container?.title ||
    container?.data?.message ||
    container?.data?.error;
  if (typeof direct === "string" && direct.trim()) return direct.trim();

  // 4) Son çare: stringify
  try { return JSON.stringify(container); } catch { return String(container); }
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

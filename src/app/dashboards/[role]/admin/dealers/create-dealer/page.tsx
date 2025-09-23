'use client';

import * as React from 'react';

export default function CreateDealerPage({ params }: { params: { role: string } }) {
  const role = params.role;

  const [form, setForm] = React.useState({
    accountType: '',
    fullName: '',
    phone: '',
    shortBio: '',
    company: '',
    address: '',
    city: '',
    district: '',
    taxOffice: '',
    taxOrId: '',
    iban: '',
    status: '',
  });

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((p) => ({ ...p, [key]: value }));

  function onSave() {
    // API entegrasyonu burada yapılabilir
    alert('Bayi kaydedildi (demo).');
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <h1 className="mb-4 text-3xl font-semibold">Kullanıcı Bilgisi</h1>

      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        {/* Sol Kart */}
        <section className="rounded-2xl border border-neutral-200/70 bg-white p-6 shadow-sm soft-card">
          <div className="grid place-items-center">
            <div className="mb-6 grid h-20 w-20 place-items-center rounded-full bg-neutral-200 text-xs text-neutral-600">
              300 x 300
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-semibold text-neutral-700">Hesap Türü</label>
              <input
                className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 text-neutral-800 placeholder:text-neutral-400 outline-none ring-2 ring-transparent transition focus:bg-white focus:border-neutral-300 focus:ring-sky-200"
                value={form.accountType}
                onChange={(e) => set('accountType', e.target.value)}
                placeholder=""
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-neutral-700">Ad ve Soyadınız</label>
              <input
                className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 text-neutral-800 placeholder:text-neutral-400 outline-none ring-2 ring-transparent transition focus:bg-white focus:border-neutral-300 focus:ring-sky-200"
                value={form.fullName}
                onChange={(e) => set('fullName', e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-neutral-700">Telefon No</label>
              <input
                className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 text-neutral-800 placeholder:text-neutral-400 outline-none ring-2 ring-transparent transition focus:bg-white focus:border-neutral-300 focus:ring-sky-200"
                value={form.phone}
                onChange={(e) => set('phone', e.target.value)}
                placeholder="your-email@domain.com"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-neutral-700">Kısa Bilgi</label>
              <textarea
                className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 text-neutral-800 placeholder:text-neutral-400 outline-none ring-2 ring-transparent transition focus:bg-white focus:border-neutral-300 focus:ring-sky-200"
                rows={8}
                value={form.shortBio}
                onChange={(e) => set('shortBio', e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* Sağ Kart */}
        <section className="relative rounded-2xl border border-neutral-200/70 bg-white p-6 shadow-sm soft-card">
          <div className="space-y-5">
            <div>
              <label className="mb-1 block text-sm font-semibold text-neutral-700">Şirket Adı</label>
              <input
                className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 text-neutral-800 placeholder:text-neutral-400 outline-none ring-2 ring-transparent transition focus:bg-white focus:border-neutral-300 focus:ring-sky-200"
                value={form.company}
                onChange={(e) => set('company', e.target.value)}
                placeholder="Company"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-neutral-700">Adres</label>
              <input
                className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 text-neutral-800 placeholder:text-neutral-400 outline-none ring-2 ring-transparent transition focus:bg-white focus:border-neutral-300 focus:ring-sky-200"
                value={form.address}
                onChange={(e) => set('address', e.target.value)}
                placeholder="Adres"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-semibold text-neutral-700">İl</label>
                <input
                  className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 text-neutral-800 placeholder:text-neutral-400 outline-none ring-2 ring-transparent transition focus:bg-white focus:border-neutral-300 focus:ring-sky-200"
                  value={form.city}
                  onChange={(e) => set('city', e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-neutral-700">İlçe</label>
                <input
                  className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 text-neutral-800 placeholder:text-neutral-400 outline-none ring-2 ring-transparent transition focus:bg-white focus:border-neutral-300 focus:ring-sky-200"
                  value={form.district}
                  onChange={(e) => set('district', e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-neutral-700">Vergi Dairesi</label>
                <input
                  className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 text-neutral-800 placeholder:text-neutral-400 outline-none ring-2 ring-transparent transition focus:bg-white focus:border-neutral-300 focus:ring-sky-200"
                  value={form.taxOffice}
                  onChange={(e) => set('taxOffice', e.target.value)}
                  placeholder="Vergi Dairesi"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-semibold text-neutral-700">
                  Vergi No / Kimlik No
                </label>
                <input
                  className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 text-neutral-800 placeholder:text-neutral-400 outline-none ring-2 ring-transparent transition focus:bg-white focus:border-neutral-300 focus:ring-sky-200"
                  value={form.taxOrId}
                  onChange={(e) => set('taxOrId', e.target.value)}
                  placeholder="Vergi Numarası"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-neutral-700">Iban No</label>
                <input
                  className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 text-neutral-800 placeholder:text-neutral-400 outline-none ring-2 ring-transparent transition focus:bg-white focus:border-neutral-300 focus:ring-sky-200"
                  value={form.iban}
                  onChange={(e) => set('iban', e.target.value)}
                  placeholder="TR.."
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-neutral-700">Durumu</label>
              <input
                className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 text-neutral-800 placeholder:text-neutral-400 outline-none ring-2 ring-transparent transition focus:bg-white focus:border-neutral-300 focus:ring-sky-200"
                value={form.status}
                onChange={(e) => set('status', e.target.value)}
              />
            </div>
          </div>

          {/* Kaydet butonu */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={onSave}
              className="rounded-xl bg-indigo-500 px-6 py-2.5 text-white shadow-sm transition hover:bg-indigo-600 active:translate-y-px"
            >
              Kaydet
            </button>
          </div>
        </section>
      </div>
           
           {/* ALT: Evraklar bölümü */}
      <section className="mt-6 rounded-2xl border border-neutral-200/70 bg-white p-6 shadow-sm soft-card">
        <h2 className="text-2xl font-semibold text-neutral-800">Evraklar</h2>

        <div className="mt-4">
          <button className="rounded-xl bg-indigo-500 px-5 py-2 text-white shadow-sm transition hover:bg-indigo-600 active:translate-y-px">
            Onayla
          </button>
        </div>
      </section>
    </div>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-semibold text-neutral-700">{label}</label>
      {children}
    </div>
  );
}

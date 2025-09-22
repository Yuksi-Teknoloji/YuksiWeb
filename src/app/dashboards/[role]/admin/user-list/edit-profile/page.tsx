'use client';

import * as React from 'react';

export default function EditProfilePage() {
  // sadece UI – gerçek submit yok
  const [saving, setSaving] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await new Promise(r => setTimeout(r, 600));
    setSaving(false);
    alert('Kaydedildi (demo).');
  }

  return (
    <div className="space-y-4">
      {/* Başlık */}
      <div className="px-2 sm:px-0">
        <h1 className="text-2xl font-semibold tracking-tight">Kullanıcı Bilgisi</h1>
      </div>

      {/* Ikili kolon düzen */}
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-2">
        {/* Sol kolon */}
        <section className="rounded-2xl border border-neutral-200/70 bg-white p-6 shadow-sm">
          <div className="mx-auto mb-6 grid place-items-center">
            <div className="grid h-24 w-24 place-items-center rounded-full bg-neutral-100 text-xs text-neutral-500 ring-1 ring-neutral-200">
              300 × 300
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">Hesap Türü</label>
              <input
                className="w-full rounded-xl border border-neutral-300 px-3 py-2 outline-none ring-2 ring-transparent transition focus:border-neutral-300 focus:ring-sky-200"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">Ad ve Soyadınız</label>
              <input
                className="w-full rounded-xl border border-neutral-300 px-3 py-2 outline-none ring-2 ring-transparent transition focus:border-neutral-300 focus:ring-sky-200"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">Telefon No</label>
              <input
                placeholder="your-email@domain.com"
                className="w-full rounded-xl border border-neutral-300 px-3 py-2 outline-none ring-2 ring-transparent transition focus:border-neutral-300 focus:ring-sky-200"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">Kısa Bilgi</label>
              <textarea
                rows={6}
                className="w-full resize-y rounded-xl border border-neutral-300 px-3 py-2 outline-none ring-2 ring-transparent transition focus:border-neutral-300 focus:ring-sky-200"
              />
            </div>
          </div>
        </section>

        {/* Sağ kolon */}
        <section className="rounded-2xl border border-neutral-200/70 bg-white p-6 shadow-sm">
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">Şirket Adı</label>
              <input
                placeholder="Company"
                className="w-full rounded-xl border border-neutral-300 px-3 py-2 outline-none ring-2 ring-transparent transition focus:border-neutral-300 focus:ring-sky-200"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">Adres</label>
              <input
                placeholder="Adres"
                className="w-full rounded-xl border border-neutral-300 px-3 py-2 outline-none ring-2 ring-transparent transition focus:border-neutral-300 focus:ring-sky-200"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">İl</label>
                <input className="w-full rounded-xl border border-neutral-300 px-3 py-2 outline-none ring-2 ring-transparent transition focus:border-neutral-300 focus:ring-sky-200" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">İlçe</label>
                <input className="w-full rounded-xl border border-neutral-300 px-3 py-2 outline-none ring-2 ring-transparent transition focus:border-neutral-300 focus:ring-sky-200" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">Vergi Dairesi</label>
                <input placeholder="Vergi Dairesi" className="w-full rounded-xl border border-neutral-300 px-3 py-2 outline-none ring-2 ring-transparent transition focus:border-neutral-300 focus:ring-sky-200" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">Vergi No / Kimlik No</label>
                <input placeholder="Vergi Numarası" className="w-full rounded-xl border border-neutral-300 px-3 py-2 outline-none ring-2 ring-transparent transition focus:border-neutral-300 focus:ring-sky-200" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">Iban No</label>
                <input placeholder="iban no" className="w-full rounded-xl border border-neutral-300 px-3 py-2 outline-none ring-2 ring-transparent transition focus:border-neutral-300 focus:ring-sky-200" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">Durumu</label>
                <input className="w-full rounded-xl border border-neutral-300 px-3 py-2 outline-none ring-2 ring-transparent transition focus:border-neutral-300 focus:ring-sky-200" />
              </div>
            </div>
          </div>

          {/* Kaydet */}
          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-indigo-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? 'Kaydediliyor…' : 'Kaydet'}
            </button>
          </div>
        </section>
      </form>
    </div>
  );
}

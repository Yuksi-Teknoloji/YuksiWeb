'use client';

import * as React from 'react';
import { Trash2 } from 'lucide-react';
import "@/styles/soft-ui.css"

type Banner = { id: string; url: string };

export default function SettingsPage() {
  // Demo state’ler – API bağlayınca kaldır/bağla
  const [commission, setCommission] = React.useState('30');
  const [appName, setAppName] = React.useState('app');
  const [appTitle, setAppTitle] = React.useState('');
  const [desc, setDesc] = React.useState('');
  const [keywords, setKeywords] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [whatsapp, setWhatsapp] = React.useState('');
  const [address, setAddress] = React.useState('');
  const [mapEmbedCode, setMapEmbed] = React.useState('');
  const [adSelect, setAdSelect] = React.useState('');
  const [adInApp, setAdInApp] = React.useState('');
  const [adOutApp, setAdOutApp] = React.useState('');
  const [adOrder, setAdOrder] = React.useState('1');

  const [bannerUpload, setBannerFile] = React.useState<File | null>(null);
  const [logoUpload, setLogoFile] = React.useState<File | null>(null);

  const [banners, setBanners] = React.useState<Banner[]>([
    { id: 'b1', url: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=1200' },
    { id: 'b2', url: 'https://images.unsplash.com/photo-1604147495798-57beb5d6af73?w=1200' },
    { id: 'b3', url: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=1200' },
  ]);

  function removeBanner(id: string) {
    setBanners((x) => x.filter((b) => b.id !== id));
  }

  function saveCommission() {
    alert(`Komisyon güncellendi: %${commission}`);
  }

  function saveAd() {
    // YÜKLENEN RESMİ SAĞDAKİ LİSTEYE EKLE
    if (bannerUpload) {
      const objectUrl = URL.createObjectURL(bannerUpload);
      setBanners((prev) => [...prev, { id: crypto.randomUUID(), url: objectUrl }]);
      setBannerFile(null);
    }
    alert('Reklam ayarları kaydedildi (demo).');
  }

  function saveLogo() {
    alert(logoUpload ? `Logo yüklendi: ${logoUpload.name}` : 'Logo seçili değil.');
  }

  function saveAll() {
    alert('Ayarlar kaydedildi (demo).');
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Ayarlar</h1>

      {/* Üst 2 kolon */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Sol: Komisyon kutusu */}
        <section className="rounded-2xl border border-neutral-200/70 bg-white p-6 shadow-sm soft-card">
          <div className="text-[15px] font-semibold text-neutral-700 mb-3">
            Komisyon Yüzde Oranı
          </div>
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <input
              className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 text-neutral-800 placeholder:text-neutral-400 outline-none ring-2 ring-transparent transition focus:bg-white focus:border-neutral-300 focus:ring-sky-200"
              value={commission}
              onChange={(e) => setCommission(e.target.value)}
            />
            <button
              onClick={saveCommission}
              className="rounded-xl border border-emerald-100 bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-600"
            >
              Güncelle
            </button>
          </div>
        </section>

        {/* Sağ: Reklam alanı */}
        <section className="relative rounded-2xl border border-neutral-200/70 bg-white p-6 shadow-sm soft-card">
          <div className="grid gap-4">
            <div>
              <label className="label">Reklam Seçiniz</label>
              <input
                className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 text-neutral-800 placeholder:text-neutral-400 outline-none ring-2 ring-transparent transition focus:bg-white focus:border-neutral-300 focus:ring-sky-200"
                value={adSelect}
                onChange={(e) => setAdSelect(e.target.value)}
              />
            </div>

            <div>
              <label className="label">Uygulama içi</label>
              <input
                className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 text-neutral-800 placeholder:text-neutral-400 outline-none ring-2 ring-transparent transition focus:bg-white focus:border-neutral-300 focus:ring-sky-200"
                value={adInApp}
                onChange={(e) => setAdInApp(e.target.value)}
              />
            </div>

            <div>
              <label className="label">Uygulama dışı</label>
              <input
                className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 text-neutral-800 placeholder:text-neutral-400 outline-none ring-2 ring-transparent transition focus:bg-white focus:border-neutral-300 focus:ring-sky-200"
                value={adOutApp}
                onChange={(e) => setAdOutApp(e.target.value)}
              />
            </div>

            <div>
              <label className="label">Sıralama</label>
              <input
                className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 text-neutral-800 placeholder:text-neutral-400 outline-none ring-2 ring-transparent transition focus:bg-white focus:border-neutral-300 focus:ring-sky-200"
                value={adOrder}
                onChange={(e) => setAdOrder(e.target.value)}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <div>
                <label className="label">Resim yükle</label>
                <div className="grid grid-cols-[1fr_auto] gap-2">
                  <input
                    readOnly
                    className="field"
                    value={bannerUpload?.name ?? 'Seçilen dosya yok'}
                  />
                  <label className="rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-200 cursor-pointer">
                    Dosya Seç
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => setBannerFile(e.target.files?.[0] ?? null)}
                    />
                  </label>
                </div>
              </div>

              <div className="flex items-end">
                <button
                  onClick={saveAd}
                  className="rounded-xl border border-indigo-100 bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-indigo-600"
                >
                  Kaydet
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Orta bölüm – sol geniş form + sağ banner listesi */}
      <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
        {/* Sol büyük form */}
        <section className="rounded-2xl border border-neutral-200/70 bg-white p-6 shadow-sm soft-card">
          <div className="grid gap-4">
            <div>
              <label className="label">App Adı</label>
              <input
                className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 text-neutral-800 placeholder:text-neutral-400 outline-none ring-2 ring-transparent transition focus:bg-white focus:border-neutral-300 focus:ring-sky-200"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
              />
            </div>

            <div>
              <label className="label">App başlığı</label>
              <input
                className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 text-neutral-800 placeholder:text-neutral-400 outline-none ring-2 ring-transparent transition focus:bg-white focus:border-neutral-300 focus:ring-sky-200"
                value={appTitle}
                onChange={(e) => setAppTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="label">Açıklama</label>
              <textarea
                className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 text-neutral-800 placeholder:text-neutral-400 outline-none ring-2 ring-transparent transition focus:bg-white focus:border-neutral-300 focus:ring-sky-200"
                rows={4}
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="160 karakter"
              />
            </div>

            <div>
              <label className="label">Keywords</label>
              <textarea
                className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 text-neutral-800 placeholder:text-neutral-400 outline-none ring-2 ring-transparent transition focus:bg-white focus:border-neutral-300 focus:ring-sky-200"
                rows={4}
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="Virgül ile ayırarak; kelime, öbek, kelime vb"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="label">Email</label>
                <input
                  className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 text-neutral-800 placeholder:text-neutral-400 outline-none ring-2 ring-transparent transition focus:bg-white focus:border-neutral-300 focus:ring-sky-200"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="label">Whatsapp</label>
                <input
                  className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 text-neutral-800 placeholder:text-neutral-400 outline-none ring-2 ring-transparent transition focus:bg-white focus:border-neutral-300 focus:ring-sky-200"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="label">Adress</label>
              <textarea
                className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 text-neutral-800 placeholder:text-neutral-400 outline-none ring-2 ring-transparent transition focus:bg-white focus:border-neutral-300 focus:ring-sky-200"
                rows={4}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <div>
              <label className="label">Harita embed kodu</label>
              <textarea
                className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 text-neutral-800 placeholder:text-neutral-400 outline-none ring-2 ring-transparent transition focus:bg-white focus:border-neutral-300 focus:ring-sky-200"
                rows={4}
                value={mapEmbedCode}
                onChange={(e) => setMapEmbed(e.target.value)}
              />
            </div>

            {/* Logo yükle + sağ alt kaydet */}
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <div>
                <label className="label">Logo yükle</label>
                <div className="grid grid-cols-[1fr_auto] gap-2">
                  <input
                    readOnly
                    className="field"
                    value={logoUpload?.name ?? 'Seçilen dosya yok'}
                  />
                  <label className="rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-200 cursor-pointer">
                    Dosya Seç
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
                    />
                  </label>
                </div>
              </div>

              <div className="flex items-end justify-end">
                <button
                  onClick={saveLogo}
                  className="rounded-xl border border-indigo-100 bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-indigo-600"
                >
                  Kaydet
                </button>
              </div>
            </div>

            {/* Genel Kaydet */}
            <div className="flex justify-end pt-2">
              <button
                onClick={saveAll}
                className="rounded-xl border border-emerald-100 bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-white shadow hover:bg-emerald-600"
              >
                Tümünü Kaydet
              </button>
            </div>
          </div>
        </section>

        {/* Sağ: Banner önizleme listesi */}
        <aside className="rounded-2xl border border-neutral-200/70 bg-white p-4 shadow-sm soft-card">
          <div className="space-y-4">
            {banners.map((b) => (
              <div
                key={b.id}
                className="relative overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm"
              >
                <button
                  onClick={() => removeBanner(b.id)}
                  className="absolute left-2 top-2 rounded-md bg-white/90 p-1.5 text-rose-600 shadow"
                  title="Sil"
                >
                  <Trash2 className="h-4 w-4" />
                </button>

                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={b.url}
                  alt="banner"
                  className="h-40 w-full object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

/* Küçük label helper’ı (opsiyonel) */
function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-sm font-medium text-neutral-700">{children}</div>;
}

/* Tailwind yardımcı sınıfı: .label – global.css’de yoksa yerinde kullanıyoruz */
const style = `
.label { @apply text-sm font-medium text-neutral-700 mb-1 block; }
`;

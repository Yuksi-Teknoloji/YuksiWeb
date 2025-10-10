// src/app/dashboards/[role]/admin/companies/create/page.tsx
'use client';

import * as React from 'react';

/* ----------------- Tipler ----------------- */
type FormState = {
  // Genel ayarlar
  trackingNo: string;
  kmDefinition: string;
  specialCommission: string;
  isVisible: boolean;
  canReceivePayment: boolean;
  district: string;
  city: string;

  // Yetkili / sahibi bilgileri
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
};

const initialForm: FormState = {
  trackingNo: Math.random().toString(16).slice(2, 10),
  kmDefinition: '',
  specialCommission: '',
  isVisible: false,
  canReceivePayment: false,
  district: '',
  city: '',

  ownerName: '',
  ownerEmail: '',
  ownerPhone: '',
};

export default function CreateCompaniesPage() {
  const [form, setForm] = React.useState<FormState>(initialForm);
  const [submitting, setSubmitting] = React.useState(false);

  // --- Yeni eklenen bölümler için state ---
  // 1) KONUM (şehir/ilçe + serbest metin konum)
  const [locCity, setLocCity] = React.useState('');
  const [locDistrict, setLocDistrict] = React.useState('');
  const [locFreeText, setLocFreeText] = React.useState('');
  // 2) FOTOĞRAFLAR
  const [files, setFiles] = React.useState<File[]>([]);
  const [previews, setPreviews] = React.useState<string[]>([]);
  // 3) ŞİRKET BİLGİLERİ (alt kart)
  const [companyName, setCompanyName] = React.useState('');
  const [companyPhone, setCompanyPhone] = React.useState('');
  const [companyDesc, setCompanyDesc] = React.useState('');

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((p) => ({ ...p, [key]: value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    setSubmitting(false);
    alert('Şirket oluşturma kaydedildi (demo).');
  }

  /* ---------- Fotoğraf önizlemeleri ---------- */
  React.useEffect(() => {
    previews.forEach((url) => URL.revokeObjectURL(url)); // eski url’leri temizle
    const next = files.map((f) => URL.createObjectURL(f));
    setPreviews(next);
    // cleanup
    return () => next.forEach((url) => URL.revokeObjectURL(url));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files.map((f) => f.name + f.size).join('|')]);

  function onPickFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const list = Array.from(e.target.files ?? []);
    if (!list.length) return;
    setFiles((prev) => [...prev, ...list]);
  }

  function onDropFiles(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const list = Array.from(e.dataTransfer.files ?? []);
    if (!list.length) return;
    setFiles((prev) => [...prev, ...list]);
  }

  function removeFile(idx: number) {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  }

  // Basit OSM arama linki (adres metni değiştikçe güncellenir)
  const mapSearchUrl = React.useMemo(() => {
    const q = encodeURIComponent(
      [locCity, locDistrict, locFreeText].filter(Boolean).join(' ')
    );
    return `https://www.openstreetmap.org/search?query=${q}`;
  }, [locCity, locDistrict, locFreeText]);

  return (
    <div className="min-h-screen bg-white">
      {/* Üst sekmeler */}
      <div className="sticky top-0 z-10 bg-white">
        <div className="flex gap-6 border-b px-4 py-2 text-sm font-semibold">
          <button className="text-orange-600">Şirket Oluştur</button>
          <a
            href="/dashboards/admin/admin/companies/company-list"
            className="text-neutral-700 opacity-70 hover:opacity-100"
          >
            Şirket Listesi
          </a>
          <a
            href="/dashboards/admin/admin/companies/authorized-person"
            className="text-neutral-700 opacity-70 hover:opacity-100"
          >
            Yetkili Kişiler
          </a>
        </div>
      </div>

      <form onSubmit={onSubmit} className="mx-auto max-w-5xl space-y-6 px-3 py-6">
        {/* BLOK 1: Genel özellikler */}
        <section className="rounded-xl bg-orange-50 p-4 ring-1 ring-orange-100">
          <div className="space-y-4">
            <Field label="Şirket Takip No">
              <input
                value={form.trackingNo}
                readOnly
                className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 outline-none"
              />
            </Field>

            <Field label="Şirket Kilometre Tanımla">
              <input
                value={form.kmDefinition}
                onChange={(e) => set('kmDefinition', e.target.value)}
                className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 outline-none"
              />
            </Field>

            <Field label="Şirket Özel Komisyon Gir">
              <input
                value={form.specialCommission}
                onChange={(e) => set('specialCommission', e.target.value)}
                className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 outline-none"
              />
            </Field>

            <Field label="Şirket Sistemde Gözüksün">
              <OnOff on={form.isVisible} onClick={(v) => set('isVisible', v)} />
            </Field>

            <Field label="Şirket Ödeme Alabilir">
              <OnOff
                on={form.canReceivePayment}
                onClick={(v) => set('canReceivePayment', v)}
              />
            </Field>

            {/* İlçe / Şehir satırı */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <input
                  value={form.district}
                  onChange={(e) => set('district', e.target.value)}
                  placeholder="İlçe"
                  className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 outline-none"
                />
              </div>
              <div className="flex items-center gap-3">
                <input
                  value={form.city}
                  onChange={(e) => set('city', e.target.value)}
                  placeholder="Şehir"
                  className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 outline-none"
                />
                <button
                  type="button"
                  onClick={() => set('city', 'Bursa')}
                  className="rounded-md bg-white px-4 py-2 text-sm font-semibold shadow-sm ring-1 ring-neutral-200 hover:bg-neutral-50"
                >
                  BURSA
                </button>
                <button
                  type="button"
                  onClick={() => set('city', 'İstanbul')}
                  className="rounded-md bg-white px-4 py-2 text-sm font-semibold shadow-sm ring-1 ring-neutral-200 hover:bg-neutral-50"
                >
                  İSTANBUL
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* BLOK 2: Konum (resimdeki gibi sol form + sağ harita) */}
        <section className="rounded-xl bg-orange-50 p-4 ring-1 ring-orange-100">
          <h3 className="mb-4 text-sm font-semibold text-neutral-700">
            Konum Bilgileri
          </h3>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Sol: şehir/ilçe/konum */}
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm text-neutral-700">
                  Şehir Seçiniz
                </label>
                <input
                  value={locCity}
                  onChange={(e) => setLocCity(e.target.value)}
                  placeholder="Şehir"
                  className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-neutral-700">
                  İlçe Seçiniz
                </label>
                <input
                  value={locDistrict}
                  onChange={(e) => setLocDistrict(e.target.value)}
                  placeholder="İlçe"
                  className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-neutral-700">
                  Konum Giriniz
                </label>
                <input
                  value={locFreeText}
                  onChange={(e) => setLocFreeText(e.target.value)}
                  placeholder="Adres, POI vb."
                  className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 outline-none"
                />
              </div>
              <button
                type="button"
                onClick={() => alert('Konum kaydedildi (demo).')}
                className="rounded-md bg-orange-600 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-orange-700"
              >
                Kaydet
              </button>
            </div>

            {/* Sağ: Harita alanı (yer tutucu/iframe) */}
            <div className="rounded-xl bg-white ring-1 ring-neutral-200 overflow-hidden">
              <iframe
                title="Harita (demo)"
                src={mapSearchUrl}
                className="h-[340px] w-full"
              />
            </div>
          </div>
        </section>

        {/* BLOK 3: Fotoğraflar (drag & drop) */}
        <section className="rounded-xl bg-orange-50 p-4 ring-1 ring-orange-100">
          <h3 className="mb-3 text-sm font-semibold text-neutral-700">
            Fotoğraflar
          </h3>

          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDropFiles}
            className="flex min-h-[220px] items-center justify-center rounded-xl bg-white text-center text-neutral-500 ring-1 ring-neutral-200"
          >
            <label className="flex w-full cursor-pointer flex-col items-center justify-center gap-3 p-8">
              <span className="text-5xl leading-none">↑</span>
              <span className="text-lg">
                Galeriden seçiniz ya da <br />
                sürükleyip bırakınız
              </span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={onPickFiles}
                className="hidden"
              />
            </label>
          </div>

          {/* Küçük önizlemeler */}
          {previews.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {previews.map((src, i) => (
                <div
                  key={i}
                  className="group relative overflow-hidden rounded-lg ring-1 ring-neutral-200"
                >
                  <img
                    src={src}
                    alt={`preview-${i}`}
                    className="h-32 w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="absolute right-2 top-2 hidden rounded bg-black/60 px-2 py-1 text-xs text-white group-hover:block"
                  >
                    Sil
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={() =>
                alert(`${files.length} dosya kaydedildi (demo).`)
              }
              className="rounded-md bg-orange-600 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-orange-700"
            >
              Kaydet
            </button>
          </div>
        </section>

        {/* BLOK 4: Şirket sahibi / yetkili bilgileri (mevcut) */}
        <section className="rounded-xl bg-orange-50 p-4 ring-1 ring-orange-100">
          <h3 className="mb-4 text-sm font-semibold text-neutral-700">
            Şirket sahibi / yetkili bilgileri
          </h3>

          <div className="mb-4">
            <button
              type="button"
              className="rounded-md bg-orange-500 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-orange-600"
              onClick={() => {
                alert('Sahip seçimi (demo)');
              }}
            >
              Şirket sahibi seçiniz
            </button>
          </div>

          <div className="space-y-4">
            <LabeledInput
              label="Müşteri Adı"
              value={form.ownerName}
              onChange={(v) => set('ownerName', v)}
            />
            <LabeledInput
              label="E-mail"
              type="email"
              value={form.ownerEmail}
              onChange={(v) => set('ownerEmail', v)}
            />
            <LabeledInput
              label="Telefon"
              value={form.ownerPhone}
              onChange={(v) => set('ownerPhone', v)}
            />
          </div>
        </section>

        {/* BLOK 5: Şirket Bilgileri (resimdeki alt kart) */}
        <section className="rounded-xl bg-orange-50 p-4 ring-1 ring-orange-100">
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">
                Şirket Adı
              </label>
              <input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">
                Şirket Telefonu
              </label>
              <input
                value={companyPhone}
                onChange={(e) => setCompanyPhone(e.target.value)}
                className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">
                Açıklama
              </label>
              <textarea
                rows={6}
                value={companyDesc}
                onChange={(e) => setCompanyDesc(e.target.value)}
                className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 outline-none"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => alert('Şirket bilgileri kaydedildi (demo).')}
                className="rounded-md bg-orange-600 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-orange-700"
              >
                Kaydet
              </button>
            </div>
          </div>
        </section>

        {/* Genel form kaydet (üst blok için) */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Kaydediliyor…' : 'Kaydet'}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ---------------- UI küçük parçalar ---------------- */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid items-center gap-2 sm:grid-cols-[220px_1fr]">
      <div className="text-sm font-medium text-neutral-700">{label}</div>
      <div>{children}</div>
    </div>
  );
}

function LabeledInput({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div className="grid items-center gap-2 sm:grid-cols-[220px_1fr]">
      <div className="text-sm font-medium text-neutral-700">{label}</div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 outline-none"
      />
    </div>
  );
}

function OnOff({
  on,
  onClick,
}: {
  on: boolean;
  onClick: (next: boolean) => void;
}) {
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

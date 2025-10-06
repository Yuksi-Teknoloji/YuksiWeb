// src/app/dashboards/[role]/admin/companies/create/page.tsx
'use client';

import * as React from 'react';

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

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((p) => ({ ...p, [key]: value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    // TODO: API entegrasyonu (form state İngilizce alan adlarıyla hazır)
    await new Promise((r) => setTimeout(r, 800));
    setSubmitting(false);
    alert('Şirket oluşturma kaydedildi (demo).');
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Üst sekmeler (görsel uyumlu) */}
      <div className="sticky top-0 z-10 bg-white">
        <div className="flex gap-6 border-b px-4 py-2 text-sm font-semibold">
          <button className="text-orange-600">Şirket Oluştur</button>
          <a href='/dashboards/admin/admin/companies/company-list' className="text-neutral-700 opacity-70 hover:opacity-100">Şirket Listesi</a>
          <a href='/dashboards/admin/admin/companies/authorized-person'className="text-neutral-700 opacity-70 hover:opacity-100">Yetkili Kişiler</a>
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
              <OnOff
                on={form.isVisible}
                onClick={(v) => set('isVisible', v)}
              />
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
                {/* Kısayol butonları (BURSA / İSTANBUL) */}
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

        {/* BLOK 2: Şirket sahibi / yetkili bilgileri */}
        <section className="rounded-xl bg-orange-50 p-4 ring-1 ring-orange-100">
          <h3 className="mb-4 text-sm font-semibold text-neutral-700">
            Şirket sahibi / yetkili bilgileri
          </h3>

          <div className="mb-4">
            <button
              type="button"
              className="rounded-md bg-orange-500 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-orange-600"
              onClick={() => {
                // Seçim modalı vs. burada açılabilir (şimdilik demo)
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

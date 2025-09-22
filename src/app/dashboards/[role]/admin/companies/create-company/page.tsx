'use client';

import * as React from 'react';
import { Check } from 'lucide-react';

type StepKey = 1 | 2 | 3 | 4 | 5;

type FormState = {
  // Adım 1
  takipNo: string;
  kmTanimi: string;
  ozelKomisyon: string;
  gorunsun: boolean;
  odemeAlabilir: boolean;
  ilce: string;
  sehir: string;

  // Adım 2
  yetkiliQuery: string;

  // Adım 3
  konumSehir: string;
  konumIlce: string;
  adres: string;

  // Adım 4
  fotos: File[];

  // Adım 5
  sirketAdi: string;
  sirketTelefon: string;
  aciklama: string;
};

const initialForm: FormState = {
  takipNo: Math.random().toString(16).slice(2, 10), // e938eea8 gibi
  kmTanimi: '',
  ozelKomisyon: '',
  gorunsun: false,
  odemeAlabilir: false,
  ilce: 'Kadıköy',
  sehir: 'Bursa',

  yetkiliQuery: '',

  konumSehir: '',
  konumIlce: '',
  adres: '',

  fotos: [],

  sirketAdi: '',
  sirketTelefon: '',
  aciklama: '',
};

export default function CreateCompaniesPage() {
  const [step, setStep] = React.useState<StepKey>(1);
  const [form, setForm] = React.useState<FormState>(initialForm);
  const [submitting, setSubmitting] = React.useState(false);

  // ---- helpers
  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((p) => ({ ...p, [key]: value }));

  const canGoNext = React.useMemo(() => {
    switch (step) {
      case 1:
        // Görsel referans: km tanımı VE/VEYA komisyon girişi opsiyonel görünüyor;
        // ama akışı göstermek için ikisinden en az birini doldurtalım.
        return !!(form.kmTanimi || form.ozelKomisyon);
      case 2:
        return form.yetkiliQuery.trim().length > 0;
      case 3:
        return (
          form.konumSehir.trim().length > 0 &&
          form.konumIlce.trim().length > 0 &&
          form.adres.trim().length > 0
        );
      case 4:
        // En az 1 foto
        return form.fotos.length > 0;
      case 5:
        return (
          form.sirketAdi.trim().length > 0 &&
          form.sirketTelefon.trim().length > 0 &&
          form.aciklama.trim().length > 0
        );
      default:
        return false;
    }
  }, [step, form]);

  const goNext = () => setStep((s) => (s < 5 ? ((s + 1) as StepKey) : s));
  const goPrev = () => setStep((s) => (s > 1 ? ((s - 1) as StepKey) : s));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canGoNext || step !== 5) return;
    setSubmitting(true);
    // API entegrasyonu burada…
    await new Promise((r) => setTimeout(r, 900));
    setSubmitting(false);
    alert('Şirket oluşturma kaydedildi (demo).');
  }

  return (
    <div className="sticky top-0 z-20 border-b bg-neutral-50/90 backdrop-blur">
      {/* Adım kartları */}
      <div className="py-3">
    <Stepper step={step} setStep={setStep} />
  </div>

      <form onSubmit={onSubmit} className="space-y-6">
        {step === 1 && (
          <Card title="Genel Özellikler">
            <dl className="grid gap-6">
              <Row label="Şirket Takip No">
                <div className="font-semibold text-neutral-800">{form.takipNo}</div>
              </Row>

              <Row label="Şirket KM Tanımla">
                <input
                  value={form.kmTanimi}
                  onChange={(e) => set('kmTanimi', e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 text-neutral-800 placeholder:text-neutral-400 outline-none ring-2 ring-transparent transition focus:bg-white focus:border-neutral-300 focus:ring-sky-200"
                />
              </Row>

              <Row label="Şirkete Özel Komisyon Gir">
                <input
                  value={form.ozelKomisyon}
                  onChange={(e) => set('ozelKomisyon', e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 text-neutral-800 placeholder:text-neutral-400 outline-none ring-2 ring-transparent transition focus:bg-white focus:border-neutral-300 focus:ring-sky-200"
                />
              </Row>

              <Row label="Şirket Sistemde Gözüksün">
                <Toggle checked={form.gorunsun} onChange={(v) => set('gorunsun', v)} />
              </Row>

              <Row label="Şirket Ödeme Alabilir">
                <Toggle checked={form.odemeAlabilir} onChange={(v) => set('odemeAlabilir', v)} />
              </Row>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <input
                    value={form.ilce}
                    onChange={(e) => set('ilce', e.target.value)}
                    className="input"
                    placeholder="Kadıköy"
                  />
                </div>
                <div>
                  <input
                    value={form.sehir}
                    onChange={(e) => set('sehir', e.target.value)}
                    className="input"
                    placeholder="Bursa"
                  />
                </div>
              </div>
            </dl>
            <WizardNav
              showPrev={false}
              onPrev={goPrev}
              onNext={goNext}
              canNext={canGoNext}
            />
          </Card>
        )}

        {step === 2 && (
          <Card title="Şirket Sahibi / Yetkilisi Bilgileri">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-neutral-700">Şirket Sahibi Seçiniz</label>
              <input
                value={form.yetkiliQuery}
                onChange={(e) => set('yetkiliQuery', e.target.value)}
                placeholder="Müşteri Adı, email, telefon"
                className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 text-neutral-800 placeholder:text-neutral-400 outline-none ring-2 ring-transparent transition focus:bg-white focus:border-neutral-300 focus:ring-sky-200"
              />
            </div>
            <WizardNav onPrev={goPrev} onNext={goNext} canNext={canGoNext} />
          </Card>
        )}

        {step === 3 && (
          <Card title="Konum Bilgileri">
            <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
              <div className="space-y-4">
                <div>
                  <label className="label">Şehir Seçiniz</label>
                  <input
                    value={form.konumSehir}
                    onChange={(e) => set('konumSehir', e.target.value)}
                    className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 text-neutral-800 placeholder:text-neutral-400 outline-none ring-2 ring-transparent transition focus:bg-white focus:border-neutral-300 focus:ring-sky-200"
                  />
                </div>
                <div>
                  <label className="label">İlçe Seçiniz</label>
                  <input
                    value={form.konumIlce}
                    onChange={(e) => set('konumIlce', e.target.value)}
                    className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 text-neutral-800 placeholder:text-neutral-400 outline-none ring-2 ring-transparent transition focus:bg-white focus:border-neutral-300 focus:ring-sky-200"
                  />
                </div>
                <div>
                  <label className="label">Konum</label>
                  <div className="relative">
                    <input
                      value={form.adres}
                      onChange={(e) => set('adres', e.target.value)}
                      placeholder="Adresi tam yazarak google önerilerinden en uygun olanı seçiniz"
                      className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 text-neutral-800 placeholder:text-neutral-400 outline-none ring-2 ring-transparent transition focus:bg-white focus:border-neutral-300 focus:ring-sky-200"
                    />
                    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 opacity-40">
                      ▾
                    </div>
                  </div>
                </div>
              </div>

              {/* Harita placeholder */}
              <div className="h-[420px] w-full rounded-xl ring-1 ring-neutral-200 bg-[url('https://maps.gstatic.com/tactile/basepage/pegman_sherlock.png')] bg-cover bg-center/contain grid place-items-center text-neutral-500">
                <div className="rounded-md bg-white/80 px-3 py-1 text-sm shadow">
                  Harita önizleme (placeholder)
                </div>
              </div>
            </div>

            <WizardNav onPrev={goPrev} onNext={goNext} canNext={canGoNext} />
          </Card>
        )}

        {step === 4 && (
          <Card title="Fotoğraflar">
            <Dropzone
              files={form.fotos}
              onFiles={(files) => set('fotos', files)}
            />
            <WizardNav onPrev={goPrev} onNext={goNext} canNext={canGoNext} />
          </Card>
        )}

        {step === 5 && (
          <Card title="">
            <div className="space-y-5">
              <div>
                <label className="label">Şirket Adı</label>
                <input
                  value={form.sirketAdi}
                  onChange={(e) => set('sirketAdi', e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 text-neutral-800 placeholder:text-neutral-400 outline-none ring-2 ring-transparent transition focus:bg-white focus:border-neutral-300 focus:ring-sky-200"
                />
              </div>
              <div>
                <label className="label">Şirket Telefon</label>
                <input
                  value={form.sirketTelefon}
                  onChange={(e) => set('sirketTelefon', e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 text-neutral-800 placeholder:text-neutral-400 outline-none ring-2 ring-transparent transition focus:bg-white focus:border-neutral-300 focus:ring-sky-200"
                />
              </div>

              <div>
                <label className="label">Açıklama</label>
                {/* Basit editor placeholder – görseldeki toolbar yerine sade textarea */}
                <textarea
                  rows={12}
                  value={form.aciklama}
                  onChange={(e) => set('aciklama', e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 text-neutral-800 placeholder:text-neutral-400 outline-none ring-2 ring-transparent transition focus:bg-white focus:border-neutral-300 focus:ring-sky-200"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <button
                type="button"
                onClick={goPrev}
                className="btn-secondary"
              >
                Geri
              </button>

              <button
                type="submit"
                disabled={!canGoNext || submitting}
                className="btn-primary"
              >
                {submitting ? 'Kaydediliyor…' : 'Kaydet'}
              </button>
            </div>
          </Card>
        )}
      </form>
    </div>
  );
}

/* --------------------------- UI Helpers --------------------------- */

function Stepper({
  step,
  setStep,
}: {
  step: 1 | 2 | 3 | 4 | 5;
  setStep: (s: 1 | 2 | 3 | 4 | 5) => void;
}) {
  const items = [
    { id: 1 as const, title: '1. Adım', sub: 'Genel Bilgiler' },
    { id: 2 as const, title: '2. Adım', sub: 'Şirket Sahibi Bilgileri' },
    { id: 3 as const, title: '3. Adım', sub: 'Konum Bilgileri' },
    { id: 4 as const, title: '4. Adım', sub: 'Fotoğraflar' },
    { id: 5 as const, title: '5. Adım', sub: 'Açıklama' },
  ];

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-wrap gap-3">
        {items.map((it) => {
          const active = step === it.id;
          return (
            <button
              key={it.id}
              type="button"
              onClick={() => setStep(it.id)}
              className={[
                // temel kutu
                'w-[220px] flex-1 min-w-[180px] rounded-2xl border px-4 py-3 text-left shadow-sm transition',
                // gri pasif görünüm
                'bg-neutral-100 border-neutral-200 hover:border-neutral-300 hover:ring-1 hover:ring-neutral-200',
                // aktif görünüm
                active && 'bg-white border-red-200 ring-1 ring-red-200',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <div
                className={[
                  'text-lg font-semibold leading-none',
                  active ? 'text-red-600' : 'text-neutral-700',
                ].join(' ')}
              >
                {it.title}
              </div>
              <div
                className={[
                  'mt-1 text-[13px] font-semibold',
                  active ? 'text-neutral-900' : 'text-neutral-600',
                ].join(' ')}
              >
                {it.sub}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-neutral-200/70 bg-white p-6 shadow-sm">
      {title && (
        <>
          <h2 className="mb-4 text-xl font-semibold text-neutral-700">{title}</h2>
          <div className="h-px w-full bg-neutral-200/70 mb-4" />
        </>
      )}
      {children}
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid items-center gap-3 sm:grid-cols-[260px_1fr]">
      <div className="text-[15px] font-semibold text-neutral-700">{label}</div>
      <div>{children}</div>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
      className={`relative inline-flex h-9 w-16 items-center rounded-full transition ${
        checked ? 'bg-indigo-500' : 'bg-neutral-300'
      }`}
    >
      <span
        className={`absolute left-1 top-1 h-7 w-7 rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-7' : ''
        }`}
      />
    </button>
  );
}

function WizardNav({
  showPrev = true,
  onPrev,
  onNext,
  canNext,
}: {
  showPrev?: boolean;
  onPrev: () => void;
  onNext: () => void;
  canNext: boolean;
}) {
  return (
    <div className="mt-6 flex items-center justify-end gap-3">
      {showPrev && (
        <button type="button" onClick={onPrev} className="btn-secondary">
          Geri
        </button>
      )}
      <button
        type="button"
        onClick={onNext}
        disabled={!canNext}
        className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        İleri
      </button>
    </div>
  );
}

function Dropzone({
  files,
  onFiles,
}: {
  files: File[];
  onFiles: (f: File[]) => void;
}) {
  const ref = React.useRef<HTMLInputElement>(null);

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const list = e.target.files ? Array.from(e.target.files) : [];
    if (list.length) onFiles([...files, ...list]);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    const list = e.dataTransfer.files ? Array.from(e.dataTransfer.files) : [];
    if (list.length) onFiles([...files, ...list]);
  }

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
      className="grid gap-4"
    >
      <div
        className="rounded-xl border-2 border-dashed border-indigo-400/70 bg-indigo-50 p-10 text-center text-neutral-700"
        onClick={() => ref.current?.click()}
        role="button"
      >
        <div className="mx-auto mb-2 grid h-12 w-12 place-items-center rounded-full bg-white text-2xl shadow">
          ⤴
        </div>
        <div className="text-lg font-semibold">Resimlerinizi Seçiniz.</div>
        <div className="text-sm opacity-80">(Seçiniz veya bu alana sürükleyip bırakınız)</div>
        <input
          ref={ref}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={onPick}
        />
      </div>

      {files.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {files.map((f, i) => (
            <div key={i} className="flex items-center gap-2 rounded-md border border-neutral-200 bg-white px-3 py-1 text-sm shadow-sm">
              <span className="line-clamp-1 max-w-[220px]">{f.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
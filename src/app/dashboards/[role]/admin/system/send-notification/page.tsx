'use client';

import * as React from 'react';

type FormState = {
  audience: string;
  title: string;
  content: string;
};

const AUDIENCE = [
  'Kullanıcı Tipi Seçiniz',
  'Tüm Kullanıcılar',
  'Bayiler',
  'Taşıyıcılar',
  'Müşteriler',
];

export default function SendNotificationPage() {
  const [form, setForm] = React.useState<FormState>({
    audience: AUDIENCE[0],
    title: '',
    content: 'Hello, world!',
  });
  const [sending, setSending] = React.useState(false);

  const onChange = <K extends keyof FormState,>(k: K, v: FormState[K]) =>
    setForm(s => ({ ...s, [k]: v }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    try {
      // Gerçek API örneği:
      // await fetch('/api/notifications', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(form),
      // });

      await new Promise(r => setTimeout(r, 600)); // demo
      alert('Bildirim gönderildi (demo).');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Sayfa başlığı */}
      <div className="px-2 sm:px-0">
        <h1 className="text-2xl font-semibold tracking-tight">Bildirim Gönder</h1>
      </div>

      {/* Kart */}
      <section className="rounded-2xl border border-neutral-200/70 bg-white shadow-sm soft-card">
        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-5 p-5 sm:p-6">
          {/* Kullanıcı Tipi */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">Kullanıcı Tipi Seçiniz</label>
            <select
              value={form.audience}
              onChange={(e) => onChange('audience', e.target.value)}
              className="w-full bg-white rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none ring-2 ring-transparent transition focus:border-neutral-300 focus:ring-sky-200"
            >
              {AUDIENCE.map(opt => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Başlık */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">Başlık</label>
            <input
              value={form.title}
              onChange={(e) => onChange('title', e.target.value)}
              className="w-full bg-white rounded-xl border border-neutral-300 px-3 py-2 outline-none ring-2 ring-transparent transition focus:border-neutral-300 focus:ring-sky-200"
            />
          </div>

          {/* İçerik (basit editor görünümü) */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">İçerik</label>

            {/* Sahte toolbar */}
            <div className="flex flex-wrap items-center gap-2 rounded-t-xl border border-b-0 border-neutral-300 px-2 py-2 text-sm text-neutral-600">
              <select className="rounded-md border border-neutral-300 px-2 py-1 outline-none">
                <option>Paragraph</option>
                <option>Heading 1</option>
                <option>Heading 2</option>
              </select>
              <div className="h-5 w-px bg-neutral-300" />
              <button type="button" className="rounded-md px-2 py-1 hover:bg-neutral-100 font-semibold">B</button>
              <button type="button" className="rounded-md px-2 py-1 hover:bg-neutral-100 italic">I</button>
              <button type="button" className="rounded-md px-2 py-1 hover:bg-neutral-100 underline">U</button>
              <div className="h-5 w-px bg-neutral-300" />
              <button type="button" className="rounded-md px-2 py-1 hover:bg-neutral-100">•</button>
              <button type="button" className="rounded-md px-2 py-1 hover:bg-neutral-100">1.</button>
              <div className="h-5 w-px bg-neutral-300" />
              <button type="button" className="rounded-md px-2 py-1 hover:bg-neutral-100">🖼️</button>
              <button type="button" className="rounded-md px-2 py-1 hover:bg-neutral-100">▦</button>
              <button type="button" className="rounded-md px-2 py-1 hover:bg-neutral-100">▶</button>
              <button type="button" className="rounded-md px-2 py-1 hover:bg-neutral-100">↩</button>
              <button type="button" className="rounded-md px-2 py-1 hover:bg-neutral-100">↪</button>
            </div>

            <textarea
              value={form.content}
              onChange={(e) => onChange('content', e.target.value)}
              rows={8}
              className="w-full bg-white resize-y rounded-b-xl border border-neutral-300 px-3 py-2 outline-none ring-2 ring-transparent transition focus:border-neutral-300 focus:ring-sky-200"
            />
          </div>

          {/* Alt tekrar “Gönder” (enter’a basmadan tıklamak isteyenler için) */}
          <div className="flex justify-end">
            <button
              disabled={sending}
              className="rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {sending ? 'Gönderiliyor…' : 'Gönder'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

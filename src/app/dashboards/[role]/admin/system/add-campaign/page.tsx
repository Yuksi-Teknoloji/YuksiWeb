'use client';

import * as React from 'react';

type CampaignForm = {
  title: string;
  discount: string; // % veya sayı
  rule: string;
  content: string;
  image?: File | null;
};

export default function AddCampaignPage() {
  const [form, setForm] = React.useState<CampaignForm>({
    title: '',
    discount: '',
    rule: '',
    content: '',
    image: null,
  });
  const [preview, setPreview] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  function onChange<K extends keyof CampaignForm>(key: K, value: CampaignForm[K]) {
    setForm((s) => ({ ...s, [key]: value }));
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    onChange('image', file ?? null);
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview((old) => {
        if (old) URL.revokeObjectURL(old);
        return url;
      });
    } else {
      if (preview) URL.revokeObjectURL(preview);
      setPreview(null);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      // Burada gerçek API’ye POST atarsın
      // const fd = new FormData();
      // Object.entries(form).forEach(([k, v]) => fd.append(k, v as any));
      // await fetch('/api/campaigns', { method: 'POST', body: fd });

      await new Promise((r) => setTimeout(r, 600)); // demo
      alert('Kampanya kaydedildi (demo).');
      setForm({ title: '', discount: '', rule: '', content: '', image: null });
      if (preview) URL.revokeObjectURL(preview);
      setPreview(null);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Sayfa başlığı */}
      <div className="px-2 sm:px-0">
        <h1 className="text-2xl font-semibold tracking-tight">Kampanya</h1>
      </div>

      {/* Kart */}
      <section className="rounded-2xl border border-neutral-200/70 bg-white shadow-sm soft-card">
        <header className="p-5 sm:p-6">
          <h2 className="text-xl font-semibold">Yeni Kampanya Oluştur</h2>
        </header>

        <div className="h-px w-full bg-neutral-200/70" />

        <form onSubmit={onSubmit} className="space-y-5 p-5 sm:p-6">
          {/* Kampanya Başlığı */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">Kampanya Başlığı:</label>
            <input
              value={form.title}
              onChange={(e) => onChange('title', e.target.value)}
              placeholder="Post Title"
              className="w-full rounded-xl border border-neutral-300 px-3 py-2 outline-none ring-2 ring-transparent transition focus:border-neutral-300 focus:ring-sky-200"
            />
          </div>

          {/* İndirim Oranı */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">Kampanya indirim oranı:</label>
            <input
              value={form.discount}
              onChange={(e) => onChange('discount', e.target.value)}
              placeholder="Örn: %10 veya 10"
              className="w-full rounded-xl border border-neutral-300 px-3 py-2 outline-none ring-2 ring-transparent transition focus:border-neutral-300 focus:ring-sky-200"
            />
          </div>

          {/* Kural */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">Kampanya Kuralı:</label>
            <input
              value={form.rule}
              onChange={(e) => onChange('rule', e.target.value)}
              placeholder="Örn: 100₺ üzeri alışverişlerde"
              className="w-full rounded-xl border border-neutral-300 px-3 py-2 outline-none ring-2 ring-transparent transition focus:border-neutral-300 focus:ring-sky-200"
            />
          </div>

          {/* Content (zengin metin benzeri basit toolbar) */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">Content:</label>
            <div className="flex items-center gap-2 rounded-t-xl border border-b-0 border-neutral-300 px-2 py-2 text-sm text-neutral-600">
              <select className="rounded-md border border-neutral-300 px-2 py-1 outline-none">
                <option>Paragraph</option>
                <option>Heading 1</option>
                <option>Heading 2</option>
              </select>
              <div className="h-5 w-px bg-neutral-300" />
              <button type="button" className="rounded-md px-2 py-1 hover:bg-neutral-100">B</button>
              <button type="button" className="rounded-md px-2 py-1 hover:bg-neutral-100">I</button>
              <button type="button" className="rounded-md px-2 py-1 hover:bg-neutral-100">U</button>
              <div className="h-5 w-px bg-neutral-300" />
              <button type="button" className="rounded-md px-2 py-1 hover:bg-neutral-100">•</button>
              <button type="button" className="rounded-md px-2 py-1 hover:bg-neutral-100">1.</button>
              <div className="h-5 w-px bg-neutral-300" />
              <button type="button" className="rounded-md px-2 py-1 hover:bg-neutral-100">🖼️</button>
              <button type="button" className="rounded-md px-2 py-1 hover:bg-neutral-100">↩</button>
              <button type="button" className="rounded-md px-2 py-1 hover:bg-neutral-100">↪</button>
            </div>
            <textarea
              value={form.content}
              onChange={(e) => onChange('content', e.target.value)}
              rows={6}
              className="w-full resize-y rounded-b-xl border border-neutral-300 px-3 py-2 outline-none ring-2 ring-transparent transition focus:border-neutral-300 focus:ring-sky-200"
            />
          </div>

          {/* Resim yükle */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">Resim yükle</label>
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept="image/*"
                onChange={onFile}
                className="block w-full rounded-xl border border-neutral-300 px-3 py-2 file:mr-3 file:rounded-lg file:border-0 file:bg-neutral-100 file:px-3 file:py-2 file:text-sm file:font-medium"
              />
            </div>
            {preview && (
              <div className="mt-2">
                <img src={preview} alt="Önizleme" className="h-36 w-auto rounded-lg ring-1 ring-neutral-200 object-contain bg-white" />
              </div>
            )}
          </div>

          {/* Kaydet */}
          <div className="flex justify-end pt-2">
            <button
              disabled={saving || !form.title.trim()}
              className="rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? 'Kaydediliyor…' : 'Kaydet'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

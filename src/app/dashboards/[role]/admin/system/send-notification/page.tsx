// src/app/dashboards/[role]/admin/notifications/send/page.tsx
'use client';

import * as React from 'react';
import { getAuthToken } from '@/utils/auth';

type SendMode = 'bulk' | 'single';
type UserType = 'all' | 'restaurant' | 'courier' | 'customer';

type FormState = {
  mode: SendMode;        // bulk | single
  userType: UserType;    // all | restaurant | courier | customer
  target: string;        // single için e-posta (ya da id) — bulk’ta null gönderilir
  subject: string;
  message: string;       // HTML string
};

const USER_TYPE_LABELS: { label: string; value: UserType }[] = [
  { label: 'Tüm Kullanıcılar', value: 'all' },
  { label: 'Bayiler (Restoranlar)', value: 'restaurant' },
  { label: 'Taşıyıcılar (Kuryeler)', value: 'courier' },
  { label: 'Müşteriler', value: 'customer' }, // API desteklemiyorsa seçme sadece üçlüden birini kullan
];

export default function SendNotificationPage() {
  const [form, setForm] = React.useState<FormState>({
    mode: 'bulk',
    userType: 'all',
    target: '',
    subject: '',
    message: '<p>Merhaba!</p>',
  });

  const [sending, setSending] = React.useState(false);
  const [okMsg, setOkMsg] = React.useState<string | null>(null);
  const [errMsg, setErrMsg] = React.useState<string | null>(null);

  const onChange = <K extends keyof FormState,>(k: K, v: FormState[K]) =>
    setForm((s) => ({ ...s, [k]: v }));

 async function onSubmit(e: React.FormEvent) {
  e.preventDefault();
  setOkMsg(null); setErrMsg(null);

  if (!form.subject.trim()) return setErrMsg('Başlık gerekli.');
  if (!form.message.trim()) return setErrMsg('Mesaj içeriği gerekli.');
  if (form.mode === 'single' && !form.target.trim()) {
    return setErrMsg('Tekil gönderimde hedef kullanıcı (target) zorunlu.');
  }

  const token = getAuthToken();
  if (!token) {
    setErrMsg('Oturum bulunamadı. Lütfen tekrar giriş yapın.');
    return;
  }

  const payload = {
    type: form.mode,
    target: form.mode === 'single' ? form.target.trim() : null,
    user_type: form.userType,          // all | restaurant | courier | customer
    subject: form.subject.trim(),
    message: form.message,             // HTML
  };

  try {
    setSending(true);

    const res = await fetch('/yuksi/Notification/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,   // ← ÖNEMLİ
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });

    const text = await res.text();
    let json: any = null; try { json = text ? JSON.parse(text) : null; } catch {}

    if (!res.ok || json?.success === false) {
      const msg = json?.message || json?.title || `Gönderilemedi (HTTP ${res.status})`;
      throw new Error(msg);
    }

    setOkMsg('Bildirim başarıyla gönderildi.');
    // setForm(s => ({ ...s, subject: '', message: '', target: '' }));
  } catch (err: any) {
    setErrMsg(err?.message || 'Bildirim gönderilirken bir hata oluştu.');
  } finally {
    setSending(false);
  }
}

  return (
    <div className="space-y-4">
      <div className="px-2 sm:px-0">
        <h1 className="text-2xl font-semibold tracking-tight">Bildirim Gönder</h1>
      </div>

      <section className="rounded-2xl border border-neutral-200/70 bg-white shadow-sm soft-card">
        <form onSubmit={onSubmit} className="space-y-6 p-5 sm:p-6">
          {/* Mod seçimi */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">Gönderim Türü</label>
              <select
                value={form.mode}
                onChange={(e) => onChange('mode', e.target.value as SendMode)}
                className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm"
              >
                <option value="bulk">Toplu (bulk)</option>
                <option value="single">Tekil (single)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">Kullanıcı Tipi</label>
              <select
                value={form.userType}
                onChange={(e) => onChange('userType', e.target.value as UserType)}
                className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm"
              >
                {USER_TYPE_LABELS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tekil hedef */}
          {form.mode === 'single' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">Hedef (target)</label>
              <input
                value={form.target}
                onChange={(e) => onChange('target', e.target.value)}
                placeholder="kisi@ornek.com veya kullanıcı ID"
                className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2"
              />
              <p className="text-xs text-neutral-500">
                Örnek: <code>kisi@ornek.com</code>
              </p>
            </div>
          )}

          {/* Başlık */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">Başlık (subject)</label>
            <input
              value={form.subject}
              onChange={(e) => onChange('subject', e.target.value)}
              className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2"
            />
          </div>

          {/* İçerik */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">Mesaj (HTML)</label>
            <textarea
              value={form.message}
              onChange={(e) => onChange('message', e.target.value)}
              rows={8}
              className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2"
            />
            <p className="text-xs text-neutral-500">
              Örnek HTML: <code>&lt;p&gt;Herkese merhaba!&lt;/p&gt;</code>
            </p>
          </div>

          {/* Durum */}
          {(okMsg || errMsg) && (
            <div>
              {okMsg && (
                <div className="mb-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-700">
                  {okMsg}
                </div>
              )}
              {errMsg && (
                <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-rose-700">
                  {errMsg}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end">
            <button
              disabled={sending}
              className="rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-600 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {sending ? 'Gönderiliyor…' : 'Gönder'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

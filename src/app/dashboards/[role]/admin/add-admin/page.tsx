'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { getAuthToken } from '@/utils/auth';

/* ===== helpers (same style as create-dealer) ===== */
async function readJson(res: Response) {
  const t = await res.text();
  try { return t ? JSON.parse(t) : null; } catch { return t as any; }
}
const pickMsg = (d: any, fb: string) => d?.error?.message || d?.message || d?.detail || d?.title || fb;
function bearerHeaders(token?: string | null): HeadersInit {
  const h: HeadersInit = { Accept: 'application/json' };
  if (token) (h as any).Authorization = `Bearer ${token}`;
  return h;
}

/* ===== page ===== */
export default function AddAdminPage() {
  const { role } = useParams() as { role: string };

  const token = React.useMemo(getAuthToken, []);
  const headers = React.useMemo<HeadersInit>(() => bearerHeaders(token), [token]);

  const [form, setForm] = React.useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
  });
  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => setForm((p) => ({ ...p, [key]: value }));

  const [busy, setBusy] = React.useState(false);
  const [okMsg, setOkMsg] = React.useState<string | null>(null);
  const [errMsg, setErrMsg] = React.useState<string | null>(null);
  const [showPw, setShowPw] = React.useState(false);

  const canSubmit =
    form.first_name.trim().length >= 2 &&
    form.last_name.trim().length >= 2 &&
    form.email.includes('@') && form.email.includes('.') &&
    form.password.length >= 8;

  async function onSave() {
    setBusy(true); setOkMsg(null); setErrMsg(null);
    try {
      const body = {
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        password: form.password,
      };

      const res = await fetch('/yuksi/admin/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify(body),
      });
      const j: any = await readJson(res);

      // Mesaj toplayıcı
      const collectMessages = (x: any): string => {
        const msgs: string[] = [];
        if (x?.message) msgs.push(String(x.message));
        if (x?.data?.message) msgs.push(String(x.data.message));
        const err = x?.errors || x?.error || x?.detail;
        if (Array.isArray(err)) msgs.push(...err.map((m) => String(m)));
        else if (err && typeof err === 'object') {
          for (const [k, v] of Object.entries(err)) {
            if (Array.isArray(v)) (v as any[]).forEach((m) => msgs.push(`${k}: ${m}`));
            else if (v) msgs.push(`${k}: ${v}`);
          }
        }
        return msgs.join('');
      };

      if (!res.ok) throw new Error(collectMessages(j) || pickMsg(j, `HTTP ${res.status}`));

      if (j && typeof j.success === 'boolean') {
        const msg = collectMessages(j) || (j.success ? 'İşlem başarılı.' : 'İşlem başarısız.');
        if (!j.success) throw new Error(msg);
        setOkMsg(msg);
        setForm({ first_name: '', last_name: '', email: '', password: '' });
        return;
      }

      if (typeof j === 'string') {
        setOkMsg(j || 'Admin başarıyla oluşturuldu.');
        setForm({ first_name: '', last_name: '', email: '', password: '' });
        return;
      }

      setOkMsg(collectMessages(j) || 'Admin başarıyla oluşturuldu.');
      setForm({ first_name: '', last_name: '', email: '', password: '' });
    } catch (e: any) {
      setErrMsg(e?.message || 'Admin oluşturulamadı.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Admin Kullanıcıları</h1>
        <div className="text-xs text-neutral-500">Rol: {role}</div>
      </div>

      {/* Alertlar */}
      {okMsg && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{okMsg}</div>
      )}
      {errMsg && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{errMsg}</div>
      )}

      {/* Form Kartı - user-emails tasarımına uyumlu */}
      <section className="rounded-2xl border border-neutral-200/70 bg-white shadow-sm">
        <div className="grid gap-3 p-4 sm:grid-cols-3">
          <div className="sm:col-span-3">
            <h2 className="text-lg font-semibold text-neutral-900">Yeni Admin Ekle</h2>
            <p className="mt-1 text-sm text-neutral-600">Zorunlu alanlar: ad, soyad, e‑posta ve şifre.</p>
          </div>
        </div>

        <div className="grid gap-4 p-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-semibold text-neutral-700">Ad</label>
            <input
              value={form.first_name}
              onChange={(e) => set('first_name', e.target.value)}
              placeholder="Ad"
              className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 text-neutral-800 outline-none ring-2 ring-transparent transition placeholder:text-neutral-400 focus:bg-white focus:ring-sky-200"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-neutral-700">Soyad</label>
            <input
              value={form.last_name}
              onChange={(e) => set('last_name', e.target.value)}
              placeholder="Soyad"
              className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 text-neutral-800 outline-none ring-2 ring-transparent transition placeholder:text-neutral-400 focus:bg-white focus:ring-sky-200"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-neutral-700">E‑posta</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              placeholder="user@example.com"
              className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 text-neutral-800 outline-none ring-2 ring-transparent transition placeholder:text-neutral-400 focus:bg-white focus:ring-sky-200"
            />
            {form.email && !(form.email.includes('@') && form.email.includes('.')) && (
              <p className="mt-1 text-xs text-rose-700">Geçerli bir e‑posta girin.</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-neutral-700">Şifre</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => set('password', e.target.value)}
                placeholder="En az 8 karakter"
                className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 pr-24 text-neutral-800 outline-none ring-2 ring-transparent transition placeholder:text-neutral-400 focus:bg-white focus:ring-sky-200"
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                className="absolute inset-y-0 right-2 my-1 rounded-lg border border-neutral-300 px-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
              >
                {showPw ? 'Gizle' : 'Göster'}
              </button>
            </div>
            {form.password && form.password.length < 8 && (
              <p className="mt-1 text-xs text-rose-700">Şifre en az 8 karakter olmalı.</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-neutral-200/70 p-4">
          <button
            onClick={onSave}
            disabled={busy || !canSubmit}
            className="rounded-xl bg-indigo-600 px-6 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-60"
          >
            {busy ? 'Gönderiliyor…' : 'Kaydet'}
          </button>
        </div>
      </section>
    </div>
  );
}

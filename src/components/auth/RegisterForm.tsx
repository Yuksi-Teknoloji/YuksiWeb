"use client";

import { registerService } from "@/services/auth";
import Link from "next/link";
import { useState } from "react";

export default function RegisterForm() {
  const [result, setResult] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      firstName: String(fd.get("firstName") || ""),
      lastName: String(fd.get("lastName") || ""),
      phone: String(fd.get("phone") || ""),
      email: String(fd.get("email") || ""),
      password: String(fd.get("password") || ""),
      acceptedTos: Boolean(fd.get("acceptedTos")),
    };
    const res = await registerService(payload);
    setResult(res.json);
    console.log(res);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="text-sm text-neutral-900">İsim</span>
          <input name="firstName" className="input mt-1" placeholder="Adın" required/>
        </label>
        <label className="block">
          <span className="text-sm text-neutral-900">Soy İsim</span>
          <input name="lastName" className="input mt-1" placeholder="Soyadın"  required/>
        </label>
      </div>

      <label className="block">
        <span className="text-sm text-neutral-900">Telefon Numarası</span>
        <input name="phone" type="tel" className="input mt-1" placeholder="+90 5xx xxx xx xx" pattern="^5[0-9]{9}$" maxLength={13} required/>
      </label>

      <label className="block">
        <span className="text-sm text-neutral-900">E-mail</span>
        <input name="email" type="email" className="input mt-1" placeholder="you@example.com" />
      </label>

      <label className="block">
        <span className="text-sm text-neutral-900">Şifre</span>
        <input name="password" type="password" className="input mt-1" placeholder="••••••••" />
      </label>

      <label className="flex items-start gap-2">
        <input name="acceptedTos" type="checkbox" className="mt-1 h-4 w-4 accent-brand" />
        <span className="text-xs text-neutral-600">Kullanıcı sözleşmesini okudum, onaylıyorum.</span>
      </label>

      <button
        type="submit"
        className="w-full rounded-full py-3 font-semibold text-white
                   shadow-[0_10px_24px_rgba(255,91,4,0.35)]
                   bg-gradient-to-b from-[#FF6A1A] to-[#FF5B04]
                   hover:opacity-95 active:opacity-90">
        Kayıt Ol
      </button>

      <div className="divider">Veya devam et</div>
      {/* sosyal butonlarınız varsa burada çağırabilirsiniz */}

      <p className="text-center text-sm text-neutral-700">
        Mevcut bir hesabım var • <Link href="/login" className="small-link">Giriş Yap</Link>
      </p>

      {result && (
        <pre className="mt-2 whitespace-pre-wrap text-xs bg-neutral-50 border rounded-xl p-3">
{result}
        </pre>
      )}
    </form>
  );
}

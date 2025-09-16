// src/components/auth/RegisterForm.tsx
"use client";
import Link from "next/link";

export default function RegisterForm() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="text-sm text-neutral-600">İsim</span>
          <input className="input mt-1" placeholder="Adın" />
        </label>
        <label className="block">
          <span className="text-sm text-neutral-600">Soy İsim</span>
          <input className="input mt-1" placeholder="Soyadın" />
        </label>
      </div>

      <label className="block">
        <span className="text-sm text-neutral-600">Telefon Numarası</span>
        <input type="tel" className="input mt-1" placeholder="5xx xxx xx xx" />
      </label>

      <label className="block">
        <span className="text-sm text-neutral-600">E-mail</span>
        <input type="email" className="input mt-1" placeholder="you@example.com" />
      </label>

      <label className="block">
        <span className="text-sm text-neutral-600">Şifre</span>
        <input type="password" className="input mt-1" placeholder="••••••••" />
      </label>

      <label className="flex items-start gap-2">
        <input type="checkbox" className="mt-1 h-4 w-4 accent-brand" />
        <span className="text-xs text-neutral-600">Kullanıcı sözleşmesini okudum, onaylıyorum.</span>
      </label>

      <button
        className="w-full rounded-full py-3 font-semibold text-white
                   shadow-[0_10px_24px_rgba(255,91,4,0.35)]
                   bg-gradient-to-b from-[#FF6A1A] to-[#FF5B04]
                   hover:opacity-95 active:opacity-90"
      >
        Kayıt Ol
      </button>

      <p className="text-center text-sm text-neutral-700">
        Mevcut bir hesabım var •{" "}
        <Link href="/login" className="small-link">Giriş Yap</Link>
      </p>
    </div>
  );
}

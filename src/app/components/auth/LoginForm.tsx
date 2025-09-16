// src/components/auth/LoginForm.tsx
"use client";
import Link from "next/link";

export default function LoginForm() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <label className="block">
          <span className="text-sm text-neutral-600">E-mail</span>
          <input type="email" className="input mt-1" placeholder="E-posta adresinizi girin" />
        </label>
        <label className="block">
          <span className="text-sm text-neutral-600">Şifre</span>
          <input type="password" className="input mt-1" placeholder="Şifrenizi girin" />
        </label>

        <button
          className="w-full rounded-full py-3 font-semibold text-white
                     shadow-[0_10px_24px_rgba(255,91,4,0.35)]
                     bg-gradient-to-b from-[#FF6A1A] to-[#FF5B04]
                     hover:opacity-95 active:opacity-90"
        >
          Giriş Yap
        </button>

        <p className="text-center text-sm text-neutral-700">
          Hesabın yok mu?{" "}
          <Link href="/register" className="small-link">Kayıt ol</Link>
        </p>
      </div>
    </div>
  );
}

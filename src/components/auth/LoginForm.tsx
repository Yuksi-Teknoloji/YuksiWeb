"use client";

import { loginService } from "@/services/auth";
import Link from "next/link";
import { useState } from "react";

export default function LoginForm() {
  const [result, setResult] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      email: String(fd.get("email") || ""),
      password: String(fd.get("password") || ""),
    };
    const res = await loginService(payload);
    setResult(res.json);           // UI'da göster
    console.log(res);              // konsola da düşer
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-4">
        <label className="block">
          <span className="text-sm text-neutral-900">E-mail</span>
          <input name="email" type="email" className="input mt-1" placeholder="you@example.com" required/>
        </label>

        <label className="block">
          <span className="text-sm text-neutral-900">Şifre</span>
          <input name="password" type="password" className="input mt-1" placeholder="••••••••" required/>
        </label>

        <button
          type="submit"
          className="w-full rounded-full py-3 font-semibold text-white
                     shadow-[0_10px_24px_rgba(255,91,4,0.35)]
                     bg-gradient-to-b from-[#FF6A1A] to-[#FF5B04]
                     hover:opacity-95 active:opacity-90">
          Giriş Yap
        </button>

        <p className="text-center text-sm text-neutral-700">
          Hesabın yok mu? <Link href="/register" className="small-link">Kayıt ol</Link>
        </p>
      </div>

      {/* Demo çıktısı */}
      {result && (
        <pre className="mt-2 whitespace-pre-wrap text-xs bg-neutral-50 border rounded-xl p-3">
{result}
        </pre>
      )}
    </form>
  );
}

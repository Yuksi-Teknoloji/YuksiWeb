"use client";

import { registerService } from "@/services/auth";
import Link from "next/link";
import { useState } from "react";

export default function RegisterForm() {
  const [result, setResult] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      role: selectedRole || "musteri",
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
    <div className="w-full max-w-md bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-orange-200">
      {/* Başlık */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-orange-600">Hesap Oluştur</h1>
        <p className="text-gray-600 mt-2">Kayıt olmak sadece 1 dakikanı alır</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        {/* Rol Seçimi */}
        <div className="flex justify-center gap-3 mb-4">
          {["Bireysel", "Kurye"].map((role) => (
            <button
              type="button"
              key={role}
              onClick={() => setSelectedRole(role.toLowerCase())}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                selectedRole === role.toLowerCase()
                  ? "bg-orange-700 text-white shadow-md"
                  : "bg-orange-600 text-white hover:bg-orange-700"
              }`}
            >
              {role}
            </button>
          ))}
        </div>

        {/* İsim ve Soyisim */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              İsim
            </label>
            <input
              name="firstName"
              className="w-full px-4 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-gray-700"
              placeholder="Adın"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Soy İsim
            </label>
            <input
              name="lastName"
              className="w-full px-4 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-gray-700"
              placeholder="Soyadın"
              required
            />
          </div>
        </div>

        {/* Telefon */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Telefon Numarası
          </label>
          <input
            name="phone"
            type="tel"
            className="w-full px-4 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-gray-700"
            placeholder="+90 5xx xxx xx xx"
            pattern="^5[0-9]{9}$"
            maxLength={13}
            required
          />
        </div>

        {/* E-posta */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            E-posta
          </label>
          <input
            name="email"
            type="email"
            className="w-full px-4 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-gray-700"
            placeholder="ornek@eposta.com"
            required
          />
        </div>

        {/* Şifre */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Şifre
          </label>
          <input
            name="password"
            type="password"
            className="w-full px-4 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-gray-700"
            placeholder="••••••••"
            required
          />
        </div>

        {/* Kullanıcı Sözleşmesi */}
        <label className="flex items-start gap-2 text-sm text-gray-600">
          <input
            name="acceptedTos"
            type="checkbox"
            className="mt-1 h-4 w-4 accent-orange-600"
            required
          />
          Kullanıcı sözleşmesini okudum, onaylıyorum.
        </label>

        {/* Kayıt Ol Butonu */}
        <button
          type="submit"
          className="w-full py-2 px-4 bg-orange-600 text-white font-semibold rounded-lg shadow-md hover:bg-orange-700 transition"
        >
          Kayıt Ol
        </button>
      </form>

      {/* Ayırıcı */}
      <div className="my-6 flex items-center">
        <div className="flex-grow border-t border-gray-300"></div>
        <span className="px-3 text-gray-400 text-sm">Veya devam et</span>
        <div className="flex-grow border-t border-gray-300"></div>
      </div>

      {/* Sosyal Giriş */}
      <div className="flex gap-3">
        <button className="flex-1 py-2 px-4 border border-orange-300 rounded-lg text-gray-700 hover:bg-orange-50 transition">
          Google
        </button>
        <button className="flex-1 py-2 px-4 border border-orange-300 rounded-lg text-gray-700 hover:bg-orange-50 transition">
          GitHub
        </button>
      </div>

      {/* Giriş Linki */}
      <p className="text-sm text-center text-gray-600 mt-6">
        Mevcut bir hesabım var •{" "}
        <Link href="/auth/Login" className="text-orange-600 hover:underline">
          Giriş Yap
        </Link>
      </p>

      {result && (
        <pre className="mt-4 whitespace-pre-wrap text-xs bg-orange-50 border border-orange-200 rounded-xl p-3 text-gray-700">
          {result}
        </pre>
      )}
    </div>
  );
}

// src/app/auth/register/page.tsx
"use client";

import { useRouter } from "next/navigation";

export default function RegisterRoleChooser() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-orange-200">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-orange-600">Hesap Oluştur</h1>
          <p className="text-gray-600 mt-2">Rolüne göre kayıt ekranına geç</p>
        </div>

        <div className="grid gap-3">
          <button
            onClick={() => router.push("/auth/Register/individual")}
            className="w-full px-4 py-3 rounded-lg font-semibold bg-orange-600 text-white hover:bg-orange-700 transition"
          >
            Bireysel
          </button>
          <button
            onClick={() => router.push("/auth/Register/courier")}
            className="w-full px-4 py-3 rounded-lg font-semibold bg-orange-600 text-white hover:bg-orange-700 transition"
          >
            Kurye
          </button>
        </div>
      </div>
    </div>
  );
}

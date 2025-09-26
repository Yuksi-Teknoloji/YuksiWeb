"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data?.ok) {
        setErr(data?.message || "Giriş başarısız.");
        setLoading(false);
        return;
      }

      // Cookie set edildi; admin ana sayfasına yönlendir
      router.push("/dashboards/admin/admin");
    } catch {
      setErr("Ağ hatası. Lütfen tekrar deneyin.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-orange-200">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-orange-600">Hoşgeldiniz</h1>
          <p className="text-gray-600 mt-2">Giriş yapmak için devam et</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {err && (
            <div className="rounded-md bg-rose-50 border border-rose-200 px-3 py-2 text-sm text-rose-700">
              {err}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-gray-700"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Şifre
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-gray-700"
              placeholder="••••••••"
            />
          </div>

          <div className="flex justify-end">
            <a href="/forgot-password" className="text-sm text-orange-600 hover:underline">
              Şifremi Unuttum
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-orange-600 text-white font-semibold rounded-lg shadow-md hover:bg-orange-700 transition disabled:opacity-60"
          >
            {loading ? "Giriş yapılıyor..." : "Login"}
          </button>
        </form>

        {/* … alttaki sosyal kısım aynı … */}
      </div>
    </div>
  );
}

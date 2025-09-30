//src/components/auth/LoginForm.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const HOME_BY_ROLE: Record<string, string> = {
  admin: "/dashboards/admin/admin",
  restaurant: "/dashboards/restaurant/restaurants",
  bayi: "/dashboards/bayi/bayi",
  corporate: "/dashboards/corporate/corporate",
  marketing: "/dashboards/marketing/marketing",
  carrier: "/dashboards/carrier/carrier",
};

// bazı backend'ler farklı isimlerle döndürüyor olabilir
const ROLE_ALIASES: Record<string, string> = {
  restaurants: "restaurant",
  dealer: "bayi",
  dealers: "bayi",
  courier: "carrier",
  kuryeci: "carrier",
};

function base64UrlToJson(b64url: string) {
  const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
  const pad = "=".repeat((4 - (b64.length % 4)) % 4);
  const json =
    typeof window === "undefined"
      ? Buffer.from(b64 + pad, "base64").toString("utf8")
      : decodeURIComponent(
          atob(b64 + pad)
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join("")
        );
  return JSON.parse(json);
}
function decodeJwt(token: string): any {
  const parts = token.split(".");
  if (parts.length < 2) return null;
  return base64UrlToJson(parts[1]);
}
function normalizeRole(raw?: string) {
  const r = String(raw || "").toLowerCase().trim();
  return ROLE_ALIASES[r] || r;
}

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

      const text = await res.text();
      let data: any = null;
      try { data = text ? JSON.parse(text) : null; } catch {}

      if (!res.ok) {
        setErr((data && (data.message || data.error)) || "Giriş başarısız.");
        return;
      }

      // token varsa claim’den role çek
      const token = data?.token || data?.access_token || data?.jwt;
      let role: string | undefined;

      if (token) {
        const payload = decodeJwt(token) || {};
        role =
          payload.role ??
          payload.userType ??
          payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
      }

      // yoksa session’dan sor (cookie tabanlı backend’ler için)
      if (!role) {
        const sRes = await fetch("/api/session", { cache: "no-store" });
        const sData = await sRes.json().catch(() => ({}));
        role = sData?.role;
      }

      const roleNormalized = normalizeRole(role);
      const dest =
        HOME_BY_ROLE[roleNormalized] ||
        "/dashboards/admin/admin"; // sağlam fallback

      router.replace(dest); // geri tuşu login'e dönmez
      return;
    } catch {
      setErr("Ağ hatası. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

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
            {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
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
            
            {/* Kayıt Linki */}
      <p className="text-sm text-center text-gray-600 mt-6">
        Hesabın yok mu ? Hemen kayıt ol •{" "}
        <Link href="/auth/Register" className="text-orange-600 hover:underline">
          Kayıt Ol
        </Link>
      </p>


      </div>
    </div>
  );
}

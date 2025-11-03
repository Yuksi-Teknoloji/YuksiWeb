// src/components/auth/LoginForm.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { decodeJwt, isExpired, roleSegment, type JwtClaims } from "@/utils/jwt";

const HOME_BY_ROLE: Record<string, string> = {
  admin: "/dashboards/admin/admin",
  restaurant: "/dashboards/restaurant/restaurants",
  dealer: "/dashboards/dealer/dealers",
  corporate: "/dashboards/corporate/corporate",
  marketing: "/dashboards/marketing/marketing",
  carrier: "/dashboards/carrier/carrier",
  customer: "/",
};

// backend aliaslarını toparla (TAM SENİN LİSTENE GÖRE)
const ROLE_ALIASES: Record<string, string> = {
  // senin verdiğin isimler (hepsini lowercase karşılaştırıyoruz)
  individual: "customer",
  corporate: "corporate",
  restaurant: "restaurant",
  reseller: "bayi",
  company: "corporate",
  admin: "admin",
  salesrepresentative: "marketing",
  courier: "carrier",
  // ek olası aliaslar
  restaurants: "restaurant",
  dealer: "dealer",
  dealers: "dealer",
  driver: "carrier",
  kuryeci: "carrier",
};

function normalizeRole(raw?: string | null) {
  const r = String(raw || "").toLowerCase().trim();
  return ROLE_ALIASES[r] || r;
}

// Response’tan token’ı akıllıca çek
function extractToken(raw: any): string | null {
  if (!raw) return null;

  // doğrudan string jwt
  if (typeof raw === "string") {
    if (raw.split(".").length === 3) return raw;
    try { return extractToken(JSON.parse(raw)); } catch { return null; }
  }

  // en yaygın yerler
  return (
    raw.token ||
    raw.access_token ||
    raw.accessToken ||
    raw.jwt ||
    raw?.data?.accessToken ||   // <— ÖNEMLİ: senin backend’in
    raw?.data?.token ||
    raw?.result?.accessToken ||
    raw?.result?.token ||
    null
  );
}

function persistToken(token: string, exp?: number) {
  // localStorage (opsiyonel)
  try { localStorage.setItem('auth_token', token); } catch {}

  // client-side cookie (proxy bunu da okuyabilir)
  const parts = [
    `auth_token=${token}`,
    'Path=/',
    'SameSite=Lax',
  ];
  if (typeof window !== 'undefined' && location.protocol === 'https:') parts.push('Secure');
  if (exp) parts.push(`Expires=${new Date(exp * 1000).toUTCString()}`);
  document.cookie = parts.join('; ');

  // (opsiyonel ama önerilir) httpOnly cookie’yi server’dan da set et
  // bu, XSS’e karşı daha güvenli; aşağıdaki /api/auth/set-cookie route’u eklemen gerekiyor
  fetch('/api/auth/set-cookie', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, exp }),
  }).catch(() => {});
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    try {
      // Doğrudan backend
      const res = await fetch('/yuksi/Auth/login', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const rawText = await res.text();
      let data: any = null;
      try { data = rawText ? JSON.parse(rawText) : null; } catch { data = rawText; }

      if (!res.ok) {
        const msg = (typeof data === "object" && (data?.message || data?.error)) || "Giriş başarısız.";
        setErr(msg);
        return;
      }

      // payload yapın: { isSuccessful, data: { accessToken, roles:[], ... }, ... }
      const token = extractToken(data);
      if (!token) {
        setErr("Giriş yapılamadı.");
        return;
      }
      const refreshToken =
        data?.refreshToken || data?.data?.refreshToken || data?.result?.refreshToken;

      if (refreshToken) {
        try { localStorage.setItem("refresh_token", refreshToken); } catch { }
        // istersen cookie de yazabilirsin
        document.cookie = `refresh_token=${encodeURIComponent(refreshToken)}; Path=/; SameSite=Lax`;
      }

      const claims = decodeJwt<JwtClaims>(token);
      if (!claims) {
        setErr("Token çözümlenemedi.");
        return;
      }
      if (isExpired(claims)) {
        setErr("Oturum süresi dolmuş görünüyor.");
        return;
      }

      // 1) JWT içindeki userType öncelikli
      let role = normalizeRole(roleSegment(claims.userType));

      // 2) boşsa backend'in roles alanından dene
      if (!role) {
        const firstRole = Array.isArray(data?.data?.roles) ? data.data.roles[0] : undefined;
        role = normalizeRole(firstRole);
      }

      // 3) yine yoksa son çare: claims.role benzeri
      if (!role) {
        const anyClaimRole =
          (claims as any).role ||
          (claims as any)["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
        role = normalizeRole(anyClaimRole);
      }

      // token'ı sakla
      persistToken(token, claims.exp);

      // rota seç
      const dest =
        HOME_BY_ROLE[role] ||
        HOME_BY_ROLE["customer"]; // bilinmeyene ana sayfa

      router.replace(dest);
    } catch {
      setErr("Ağ hatası. Lütfen tekrar deneyin.");
    } finally {
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Şifre</label>
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
            <a href="/forgot-password" className="text-sm text-orange-600 hover:underline">Şifremi Unuttum</a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-orange-600 text-white font-semibold rounded-lg shadow-md hover:bg-orange-700 transition disabled:opacity-60"
          >
            {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
          </button>
        </form>

        <div className="my-6 flex items-center">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="px-3 text-gray-400 text-sm">Veya devam et</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <div className="flex gap-3">
          <button className="flex-1 py-2 px-4 border border-orange-300 rounded-lg text-gray-700 hover:bg-orange-50 transition">
            Google
          </button>
          <button className="flex-1 py-2 px-4 border border-orange-300 rounded-lg text-gray-700 hover:bg-orange-50 transition">
            GitHub
          </button>
        </div>

        <p className="text-sm text-center text-gray-600 mt-6">
          Hesabın yok mu? Hemen kayıt ol •{" "}
          <Link href="/auth/Register" className="text-orange-600 hover:underline">
            Kayıt Ol
          </Link>
        </p>
      </div>
    </div>
  );
}

// src/configs/api.ts
// Trailing slash temizleyici
const stripSlash = (u: string) => u.replace(/\/+$/, "");

// ENV KULLANMADAN sabit(ler)
// İstersen tek satırda:
export const API_BASE = stripSlash("http://40.90.226.14:8080");

// İsteğe bağlı: ortama göre seç (yine .env yok)
const MAP: Record<"development" | "production" | "test", string> = {
  development: "http://40.90.226.14:8080",
  production:  "http://40.90.226.14:8080",
  test:        "http://40.90.226.14:8080",
};
export const API_BASE_BY_ENV = stripSlash(MAP[process.env.NODE_ENV as keyof typeof MAP] ?? MAP.development);

// Gerekirse dinamik (SSR/CSR uyumlu) — .env'siz domain tabanlı:
// NOT: SSR'de window yok, o yüzden fallback veriyoruz.
export function getBrowserBaseUrl() {
  if (typeof window !== "undefined") {
    const origin = window.location.origin; // http(s)://domain:port
    return stripSlash(origin); // ör: backend reverse-proxy ile aynı origin ise
  }
  return API_BASE; // SSR sırasında sabite düş
}

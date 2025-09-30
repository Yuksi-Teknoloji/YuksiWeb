//src/services/banner.ts
export type BannerPayload = {
  id?: number;
  title: string;
  link?: string;
  description?: string;
  images?: string[]; // base64 ya da URL
  isActive?: boolean;
  isDeleted?: boolean;
  guid?: string;
};

export async function getBanners() {
  const r = await fetch("/api/banner/list", { cache: "no-store" });
  const data = await r.json();
  return data;
}

export async function createBanner(body: BannerPayload) {
  const r = await fetch("/api/banner/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data?.message || "Oluşturma hatası");
  return data;
}

export async function updateBanner(body: BannerPayload) {
  const r = await fetch("/api/banner/update", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data?.message || "Güncelleme hatası");
  return data;
}

export async function deleteBanner(id: number | string) {
  const r = await fetch(`/api/banner/delete/${id}`, { method: "DELETE" });
  const data = await r.json();
  if (!r.ok) throw new Error(data?.message || "Silme hatası");
  return data;
}

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || "http://40.90.226.14:8080").replace(/\/+$/,"");

export type BannerItem = {
  id: number;
  title?: string;
  link?: string;
  description?: string;
  images?: string[]; // url veya saf base64
};

function toDisplaySrc(s?: string) {
  if (!s) return "";
  if (s.startsWith("http") || s.startsWith("data:")) return s;
  return `data:image/jpeg;base64,${s}`;
}

export async function fetchBanners(): Promise<{id:number; src:string; title?:string; link?:string; description?: string;}[]> {
  const res = await fetch(`${API_BASE}/api/Banner/get-banners`, { cache: "no-store" });
  const data = await res.json().catch(()=> ({}));
  const arr: BannerItem[] = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
  return arr
  .filter((x: any) => x?.isActive === true && x?.isDeleted === false)
  .map(b => ({
    id: Number(b.id),
    src: toDisplaySrc(b.images?.[0]),
    title: b.title,
    link: b.link,
    description: b.description
  })).filter(x => !!x.src);
}

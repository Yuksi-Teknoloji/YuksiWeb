// src/app/dashboards/[role]/admin/settings/page.tsx
"use client";

import * as React from "react";
import { Trash2 } from "lucide-react";
import "@/styles/admin-settings.css";
import { API_BASE } from '@/configs/api';

type BannerApiItem = {
  id?: number | string;
  guid?: string;
  title?: string;
  link?: string;
  description?: string;
  images?: string[];
  isActive?: boolean;
  isDeleted?: boolean;
};

type BannerCard = {
  id: string;
  numericId?: number | null;
  guid?: string | null;
  title: string;
  link: string;
  description: string;
  image: string;
  isActive: boolean;
  _dirty?: boolean;
  _file?: File | null;
};

type GeneralSettingsDto = {
  appName: string;
  appTitle: string;
  keywords: string;
  email: string;
  whatsApp: string;
  address: string;
  mapEmbedCode: string;
  logoPath: string;
};

// ---- helpers
async function readProblem(res: Response) {
  const txt = await res.text();
  try { return txt ? JSON.parse(txt) : null; } catch { return txt; }
}
async function readAny(res: Response) {
  const txt = await res.text().catch(() => "");
  try { return txt ? JSON.parse(txt) : ""; } catch { return txt; }
}
function isBase64Like(s: string) {
  return !!s && s.length >= 32 && /^[A-Za-z0-9+/=]+$/.test(s);
}
function guessMimeFromBase64(s: string) {
  if (s.startsWith("iVBOR")) return "image/png";
  if (s.startsWith("/9j/")) return "image/jpeg";
  if (s.startsWith("R0lG")) return "image/gif";
  if (s.startsWith("UklGR")) return "image/webp";
  return "image/jpeg";
}
function joinUrl(base: string, path: string) {
  if (!base) return path;
  return `${base.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}
function toDisplaySrc(raw?: string): string {
  const s = (raw || "").trim();
  if (!s) return "";
  if (s.startsWith("http://") || s.startsWith("https://") || s.startsWith("data:")) return s;
  if (isBase64Like(s)) {
    const mime = guessMimeFromBase64(s);
    return `data:${mime};base64,${s}`;
  }
  const path = s.replace(/^\/+/, "");
  return joinUrl(API_BASE, path);
}
async function fileToBase64Raw(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  let bin = "";
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

// produce Authorization header if token found in localStorage
function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json; charset=utf-8" };
  try {
    if (typeof window !== "undefined") {
      // try common token keys
      const token = localStorage.getItem("token") ?? localStorage.getItem("access_token") ?? localStorage.getItem("accessToken") ?? "";
      if (token) {
        headers["Authorization"] = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
      }
    }
  } catch {
    // ignore (e.g. server-side or inaccessible storage)
  }
  return headers;
}

// central response checker: handles HTTP errors and API's { success, message } wrappers
async function handleResponse(res: Response) {
  const text = await res.text().catch(() => "");
  let parsed: any = null;
  try { parsed = text ? JSON.parse(text) : null; } catch { parsed = text; }

  if (!res.ok) {
    // prefer server-sent message
    const msg = parsed?.message || parsed?.title || (typeof parsed === "string" ? parsed : `HTTP ${res.status}`);
    throw new Error(msg);
  }

  // if server uses wrapper { success: boolean, message: string, data: ... }
  if (parsed && typeof parsed === "object" && ("success" in parsed || "message" in parsed || "data" in parsed)) {
    if (parsed.success === false) {
      throw new Error(parsed.message || "Request failed");
    }
    return parsed;
  }

  // otherwise return parsed body (could be array/object)
  return parsed;
}

export default function SettingsPage() {
  // ---- GeneralSettings (SOL PANEL)
  const [appName, setAppName] = React.useState("");
  const [appTitle, setAppTitle] = React.useState("");
  const [desc, setDesc] = React.useState(""); // unused but kept
  const [keywords, setKeywords] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [whatsapp, setWhatsapp] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [mapEmbedCode, setMapEmbed] = React.useState("");
  const [logoPath, setLogoPath] = React.useState("");
  const [logoFile, setLogoFile] = React.useState<File | null>(null);

  // track whether settings exist on server (to choose create vs update)
  const [generalExists, setGeneralExists] = React.useState(false);

  // ---- Diğer (demo)
  const [commission, setCommission] = React.useState("30");

  // ---- Banner form
  const [bannerTitle, setBannerTitle] = React.useState("");
  const [bannerLink, setBannerLink] = React.useState("");
  const [bannerDesc, setBannerDesc] = React.useState("");
  const [bannerFile, setBannerFile] = React.useState<File | null>(null);

  // ---- List & state
  const [banners, setBanners] = React.useState<BannerCard[]>([]);
  const [loadingList, setLoadingList] = React.useState(false);
  const [loadingGeneral, setLoadingGeneral] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [savingGeneral, setSavingGeneral] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [okMsg, setOkMsg] = React.useState<string | null>(null);

  // ---------- GeneralSettings: GET
  const loadGeneral = React.useCallback(async () => {
    setLoadingGeneral(true);
    setError(null);
    try {
      const url = joinUrl(API_BASE, "/api/GeneralSetting/get");
      const res = await fetch(url, { cache: "no-store", headers: getAuthHeaders() });
      const parsed = await handleResponse(res);
      // parsed might be wrapper { success, message, data } or raw object
      const payload = parsed?.data ?? parsed ?? {};
      // accept both snake_case and camelCase
      const appNameVal = payload.app_name ?? payload.appName ?? "";
      const appTitleVal = payload.app_title ?? payload.appTitle ?? "";
      const keywordsVal = payload.keywords ?? payload.keywords ?? "";
      const emailVal = payload.email ?? payload.email ?? "";
      const whatsappVal = payload.whatsapp ?? payload.whatsApp ?? payload.whatsApp ?? "";
      const addressVal = payload.address ?? payload.address ?? "";
      const mapEmbedVal = payload.map_embed_code ?? payload.mapEmbedCode ?? "";
      const logoPathVal = payload.logo_path ?? payload.logoPath ?? "";

      setAppName(appNameVal);
      setAppTitle(appTitleVal);
      setKeywords(keywordsVal);
      setEmail(emailVal);
      setWhatsapp(whatsappVal);
      setAddress(addressVal);
      setMapEmbed(mapEmbedVal);
      setLogoPath(logoPathVal);

      setGeneralExists(
        !!(appNameVal || appTitleVal || keywordsVal || emailVal || whatsappVal || addressVal || mapEmbedVal || logoPathVal)
      );
    } catch (e: any) {
      setError(e?.message || "Genel ayarlar alınamadı.");
      setGeneralExists(false);
    } finally {
      setLoadingGeneral(false);
    }
  }, []);

  function toNumericId(b: BannerCard | undefined, idOrStr: string | number) {
    if (!b) return null;
    if (typeof b.numericId === "number") return b.numericId;
    const n = Number.parseInt(String(b.id), 10);
    return Number.isFinite(n) ? n : null;
  }

  // ---------- GeneralSettings: CREATE or UPDATE
  async function saveGeneral() {
    setSavingGeneral(true);
    setError(null);
    setOkMsg(null);

    // map to backend expected snake_case keys (per your swagger example)
    const dtoPayload = {
      app_name: (appName || "").trim(),
      app_title: (appTitle || "").trim(),
      keywords: (keywords || "").trim(),
      email: (email || "").trim(),
      whatsapp: (whatsapp || "").trim(),
      address: (address || "").trim(),
      map_embed_code: (mapEmbedCode || "").trim(),
      logo_path: (logoPath || "").trim(),
    };

    if (!dtoPayload.app_name || !dtoPayload.app_title) {
      setSavingGeneral(false);
      setError("Lütfen App Adı ve App Başlığı alanlarını doldurun.");
      return;
    }

    try {
      const url = joinUrl(API_BASE, generalExists ? "/api/GeneralSetting/update" : "/api/GeneralSetting/create");
      const method = generalExists ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(dtoPayload),
      });

      const parsed = await handleResponse(res);

      // If backend returned wrapper but with success true, ok.
      setOkMsg(parsed?.message ?? "Genel ayarlar kaydedildi.");
      await loadGeneral();
    } catch (e: any) {
      // show server message when present
      setError(e?.message || "Genel ayarlar kaydedilemedi.");
    } finally {
      setSavingGeneral(false);
    }
  }

  // ---------- Banner list
  const loadBanners = React.useCallback(async () => {
    setLoadingList(true);
    setError(null);
    try {
      const url = joinUrl(API_BASE, "/api/Banner/get-banners");
      const res = await fetch(url, { cache: "no-store", headers: getAuthHeaders() });
      const parsed = await handleResponse(res);
      const arr = (Array.isArray(parsed?.data) ? parsed.data : Array.isArray(parsed) ? parsed : []) as BannerApiItem[];

      const mapped: BannerCard[] = arr
        .filter(x => x && x.isActive === true && x.isDeleted === false)
        .map(x => {
          const rawId = x.id;
          const numericId = typeof rawId === "number" ? rawId : (typeof rawId === "string" && /^\d+$/.test(rawId) ? Number(rawId) : null);
          return {
            id: String(x.guid ?? rawId ?? crypto.randomUUID()),
            numericId,
            guid: x.guid ?? null,
            title: x.title ?? "",
            link: x.link ?? "",
            description: x.description ?? "",
            image: toDisplaySrc(x.images?.[0]),
            isActive: true,
          };
        });

      setBanners(mapped);
    } catch (e: any) {
      setError(e?.message || "Banner listesi alınamadı.");
    } finally {
      setLoadingList(false);
    }
  }, []);

  React.useEffect(() => {
    loadGeneral();
    loadBanners();
  }, [loadGeneral, loadBanners]);

  function markDirty(id: string, patch: Partial<BannerCard>) {
    setBanners(prev => prev.map(b => (String(b.id) === String(id) ? { ...b, ...patch, _dirty: true } : b)));
  }

  // demo
  async function saveCommission() {
    alert(`Komisyon güncellendi: %${commission}`);
  }

  // ---------- Banner add/update/delete (aynı)
  async function addBanner() {
    setSaving(true); setError(null); setOkMsg(null);
    try {
      const maybeUrl = [bannerLink, bannerDesc].find((x) => typeof x === "string" && /^https?:\/\//i.test(x.trim()));

      let images: string[] = [];
      let imageFileNames: string[] | undefined;

      if (bannerFile) {
        const b64 = await fileToBase64Raw(bannerFile);
        images = [b64];
        imageFileNames = [bannerFile.name];
      } else if (maybeUrl) {
        images = [maybeUrl.trim()];
      } else {
        setSaving(false);
        setError("Lütfen bir görsel dosyası seçin ya da bir görsel URL'si girin.");
        return;
      }

      const payload = {
        title: bannerTitle || "",
        link: bannerLink || "",
        description: bannerDesc || "",
        images,
        ...(imageFileNames ? { imageFileNames } : {}),
        isActive: true,
        isDeleted: false,
      };

      const url = joinUrl(API_BASE, "/api/Banner/set-banner");
      const res = await fetch(url, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      await handleResponse(res);

      setOkMsg("Banner eklendi.");
      setBannerTitle(""); setBannerLink(""); setBannerDesc(""); setBannerFile(null);
      await loadBanners();
    } catch (e: any) {
      setError(e?.message || "Banner kaydedilemedi.");
    } finally { setSaving(false); }
  }

  async function updateBanner(b: BannerCard) {
    setSaving(true); setError(null); setOkMsg(null);
    try {
      const body: any = {
        id: b.numericId ?? undefined,
        guid: b.guid ?? undefined,
        title: b.title ?? "",
        link: b.link ?? "",
        description: b.description ?? "",
      };

      if (b._file) {
        const raw = await fileToBase64Raw(b._file);
        body.images = [raw];
        body.imageFileNames = [b._file.name];
      } else if (b.image) {
        body.images = [b.image];
      }

      const url = joinUrl(API_BASE, "/api/Banner/update-banner");
      const res = await fetch(url, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify(body),
      });

      await handleResponse(res);
      setOkMsg("Banner güncellendi.");
      await loadBanners();
    } catch (e: any) {
      setError(e?.message || "Banner güncellenemedi.");
    } finally { setSaving(false); }
  }

  async function removeBanner(idOrStr: string | number) {
    setSaving(true); setError(null); setOkMsg(null);
    try {
      const b = banners.find(x => String(x.id) === String(idOrStr));
      const bannerId = toNumericId(b, idOrStr);

      if (bannerId == null) {
        throw new Error("Bu banner için sayısal BannerId bulunamadı.");
      }

      const url = joinUrl(API_BASE, `/api/Banner/delete-banner/${bannerId}`);
      const res = await fetch(url, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      await handleResponse(res);

      setBanners(prev => prev.filter(x => toNumericId(x, x.id) !== bannerId));
      setOkMsg("Banner silindi.");
    } catch (e: any) {
      setError(e?.message || "Banner silinemedi.");
    } finally {
      setSaving(false);
    }
  }

  // logo "Kaydet" tuşu sadece logoPath'i doldurur (upload endpoint yoksa)
  function saveLogo() {
    if (logoFile) setLogoPath(logoFile.name);
    setOkMsg(logoFile ? `Logo path set: ${logoFile.name}` : "Logo seçili değil.");
  }

  return (
    <div className="settings">
      <h1 className="settings__title">Ayarlar</h1>

      {error && <div className="alert alert--error">{error}</div>}
      {okMsg && <div className="alert alert--ok">{okMsg}</div>}

      {/* Üst 2 kolon */}
      <div className="grid grid--two">
        {/* Komisyon (demo) */}
        <section className="card">
          <div className="card__head">Komisyon Yüzde Oranı</div>
          <div className="row row--with-action">
            <input className="field" value={commission} onChange={(e) => setCommission(e.target.value)} />
            <button onClick={saveCommission} className="btn btn--success">Güncelle</button>
          </div>
        </section>

        {/* Yeni Banner Ekle */}
        <section className="card">
          <div className="form">
            <div className="row">
              <div className="col">
                <label className="label">Başlık</label>
                <input className="field" value={bannerTitle} onChange={(e) => setBannerTitle(e.target.value)} placeholder="Banner başlığı" />
              </div>
              <div className="col">
                <label className="label">Link</label>
                <input className="field" value={bannerLink} onChange={(e) => setBannerLink(e.target.value)} placeholder="https://…" />
              </div>
            </div>
            <div className="row">
              <div className="col">
                <label className="label">Açıklama</label>
                <textarea className="field" rows={3} value={bannerDesc} onChange={(e) => setBannerDesc(e.target.value)} />
              </div>
            </div>
            <div className="row row--with-action">
              <div className="filepicker">
                <label className="label">Resim yükle</label>
                <div className="filepicker__grid">
                  <input readOnly className="field" value={bannerFile?.name ?? "Seçilen dosya yok"} />
                  <label className="btn btn--light filepicker__btn">
                    Dosya Seç
                    <input type="file" accept="image/*" className="hidden-input" onChange={(e) => setBannerFile(e.target.files?.[0] ?? null)} />
                  </label>
                </div>
              </div>
              <div className="align-end">
                <button onClick={addBanner} disabled={saving} className="btn btn--primary">
                  {saving ? "Kaydediliyor…" : "Kaydet"}
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      <br />

      {/* Orta bölüm – sol form + sağ liste */}
      <div className="grid grid--main">
        {/* Sol – GENERAL SETTINGS (bağlandı) */}
        <section className="card">
          <div className="form">
            {loadingGeneral && <div className="muted">Genel ayarlar yükleniyor…</div>}

            <div className="col">
              <label className="label">App Adı</label>
              <input className="field" value={appName} onChange={(e) => setAppName(e.target.value)} />
            </div>

            <div className="col">
              <label className="label">App Başlığı</label>
              <input className="field" value={appTitle} onChange={(e) => setAppTitle(e.target.value)} />
            </div>

            <div className="col">
              <label className="label">Keywords</label>
              <textarea className="field" rows={3} value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="Virgül ile ayır: kelime, öbek, ..." />
            </div>

            <div className="row">
              <div className="col">
                <label className="label">Email</label>
                <input className="field" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="col">
                <label className="label">WhatsApp</label>
                <input className="field" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
              </div>
            </div>

            <div className="col">
              <label className="label">Adres</label>
              <textarea className="field" rows={3} value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>

            <div className="col">
              <label className="label">Harita Embed Kodu</label>
              <textarea className="field" rows={3} value={mapEmbedCode} onChange={(e) => setMapEmbed(e.target.value)} />
            </div>

            <div className="col">
              <label className="label">Logo Path</label>
              <input className="field" value={logoPath} onChange={(e) => setLogoPath(e.target.value)} placeholder="uploads/logo.png vb." />
            </div>

            {/* İsteğe bağlı: dosya seç → logoPath'i dosya adına set eder */}
            <div className="row row--with-action">
              <div className="filepicker">
                <label className="label">Logo Dosyası (opsiyonel)</label>
                <div className="filepicker__grid">
                  <input readOnly className="field" value={logoFile?.name ?? "Seçilen dosya yok"} />
                  <label className="btn btn--light filepicker__btn">
                    Dosya Seç
                    <input type="file" accept="image/*" className="hidden-input" onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)} />
                  </label>
                </div>
              </div>
              <div className="align-end">
                <button onClick={saveLogo} className="btn btn--light">Logo Adını Kullan</button>
              </div>
            </div>

            <div className="align-end pt-2">
              <button onClick={saveGeneral} disabled={savingGeneral} className="btn btn--success">
                {savingGeneral ? "Kaydediliyor…" : "Genel Ayarları Kaydet"}
              </button>
            </div>
          </div>
        </section>

        {/* Sağ – Banner listesi */}
        <aside className="card card--list">
          {loadingList ? (
            <div className="muted">Yükleniyor…</div>
          ) : banners.length === 0 ? (
            <div className="muted">Henüz banner yok.</div>
          ) : (
            <div className="list">
              {banners.map((b) => (
                <div key={b.id} className="banner">
                  <button
                    onClick={() => removeBanner(b.id)}
                    className="icon-btn icon-btn--danger banner__delete"
                    title="Sil"
                  >
                    <Trash2 className="icon" />
                  </button>

                  {b.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={b.image} alt="banner" className="banner__img" loading="lazy" />
                  ) : (
                    <div className="banner__img banner__img--empty">Görsel yok</div>
                  )}

                  <div className="banner__form">
                    <input className="field" value={b.title} onChange={(e) => markDirty(b.id, { title: e.target.value })} placeholder="Başlık" />
                    <input className="field" value={b.link} onChange={(e) => markDirty(b.id, { link: e.target.value })} placeholder="https://…" />
                    <textarea className="field" rows={2} value={b.description} onChange={(e) => markDirty(b.id, { description: e.target.value })} placeholder="Açıklama" />
                    <div className="row">
                      <div className="filepicker__grid">
                        <input readOnly className="field" value={b._file?.name ?? "Yeni görsel seç (opsiyonel)"} />
                        <label className="btn btn--light filepicker__btn">
                          Dosya Seç
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden-input"
                            onChange={(e) => markDirty(b.id, { _file: e.target.files?.[0] || null })}
                          />
                        </label>
                      </div>
                      <div className="align-end">
                        <button
                          onClick={() => updateBanner(b)}
                          disabled={!b._dirty || saving}
                          className="btn btn--primary"
                        >
                          {saving ? "Kaydediliyor…" : "Güncelle"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

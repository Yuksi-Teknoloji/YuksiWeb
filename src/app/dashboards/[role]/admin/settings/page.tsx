// src/app/dashboards/[role]/admin/settings/page.tsx
"use client";

import * as React from "react";
import { Trash2 } from "lucide-react";
import "@/styles/admin-settings.css";
import { getAuthToken } from '@/utils/auth'; // ✅ auth token buradan


type BannerApiItem = {
  id: string;            // Swagger: string (GUID veya benzeri)
  title: string;
  image_url: string;
  priority: number;
  active: boolean;
};

type BannerCard = {
  id: string;            // API'den gelen id (string)
  title: string;
  imageUrl: string;
  priority: number;
  active: boolean;
  // UI state
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

// ─── helpers ─────────────────────────────────────────────────────────────
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
function toDisplaySrc(raw?: string): string {
  const s = (raw || "").trim();
  if (!s) return "";
  if (s.startsWith("http://") || s.startsWith("https://") || s.startsWith("data:")) return s;
  if (isBase64Like(s)) {
    const mime = guessMimeFromBase64(s);
    return `data:${mime};base64,${s}`;
  }
  const path = s.replace(/^\/+/, "");
  return `/yuksi/${path}`;
}
async function fileToBase64DataUrl(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  let bin = "";
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  const raw = btoa(bin);
  const mime =
    file.type && /^image\//.test(file.type) ? file.type :
    guessMimeFromBase64(raw);
  return `data:${mime};base64,${raw}`;
}

export default function SettingsPage() {
  // ─── GeneralSettings (SOL PANEL) ───────────────────────────────────────
  const [generalId, setGeneralId] = React.useState<string | null>(null); // ✅ GET ile gelen id'yi tut
  const [appName, setAppName] = React.useState("");
  const [appTitle, setAppTitle] = React.useState("");
  const [desc, setDesc] = React.useState(""); // not used by API, UI'da kalsın
  const [keywords, setKeywords] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [whatsapp, setWhatsapp] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [mapEmbedCode, setMapEmbed] = React.useState("");
  const [logoPath, setLogoPath] = React.useState("");
  const [logoFile, setLogoFile] = React.useState<File | null>(null);

  // ─── Diğer (demo) ──────────────────────────────────────────────────────
  const [commission, setCommission] = React.useState("30");

  // ─── Banner form (YENİ ŞEMA) ───────────────────────────────────────────
  const [bannerTitle, setBannerTitle] = React.useState("");
  const [bannerImageUrl, setBannerImageUrl] = React.useState("");
  const [bannerPriority, setBannerPriority] = React.useState<number | ''>(0);
  const [bannerActive, setBannerActive] = React.useState(true);
  const [bannerFile, setBannerFile] = React.useState<File | null>(null);

  // ─── List & state ──────────────────────────────────────────────────────
  const [banners, setBanners] = React.useState<BannerCard[]>([]);
  const [loadingList, setLoadingList] = React.useState(false);
  const [loadingGeneral, setLoadingGeneral] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [savingGeneral, setSavingGeneral] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [okMsg, setOkMsg] = React.useState<string | null>(null);

  // ─── auth headers ──────────────────────────────────────────────────────
  const [token, setToken] = React.useState<string | null>(null);
  React.useEffect(() => { setToken(getAuthToken()); }, []);
  const authHeaders = React.useMemo<HeadersInit>(() => {
    const h: HeadersInit = { Accept: "application/json" };
    if (token) (h as any).Authorization = `Bearer ${token}`;
    return h;
  }, [token]);

  // ─── GeneralSettings: GET  (✅ /api/GeneralSetting/get) ────────────────
  const loadGeneral = React.useCallback(async () => {
    setLoadingGeneral(true);
    setError(null);
    try {
      const res = await fetch(`/yuksi/GeneralSetting/get`, {
        cache: "no-store",
        headers: authHeaders,
      });
      if (!res.ok) {
        const prob = await readProblem(res);
        throw new Error(typeof prob === "string" ? prob : (prob?.title || prob?.message || `HTTP ${res.status}`));
      }
      const data = await res.json().catch(() => ({}));
      const d = (data?.data ?? data) || {};
      setGeneralId(d.id ? String(d.id) : null);
      setAppName(d.app_name ?? "");
      setAppTitle(d.app_title ?? "");
      setKeywords(d.keywords ?? "");
      setEmail(d.email ?? "");
      setWhatsapp(d.whatsapp ?? "");
      setAddress(d.address ?? "");
      setMapEmbed(d.map_embed_code ?? "");
      setLogoPath(d.logo_path ?? "");
    } catch (e: any) {
      setError(e?.message || "Genel ayarlar alınamadı.");
    } finally {
      setLoadingGeneral(false);
    }
  }, [authHeaders]);

  // ─── GeneralSettings: CREATE / UPDATE ──────────────────────────────────
  async function saveGeneral() {
    setSavingGeneral(true);
    setError(null);
    setOkMsg(null);

    const payload: any = {
      app_name: (appName || "").trim(),
      app_title: (appTitle || "").trim(),
      keywords: (keywords || "").trim(),
      email: (email || "").trim(),
      whatsapp: (whatsapp || "").trim(),
      address: (address || "").trim(),
      map_embed_code: (mapEmbedCode || "").trim(),
      logo_path: (logoPath || "").trim(),
    };

    if (!payload.app_name || !payload.app_title) {
      setSavingGeneral(false);
      setError("Lütfen App Adı ve App Başlığı alanlarını doldurun.");
      return;
    }

    const isUpdate = !!generalId;
    if (isUpdate) payload.id = generalId!;

    try {
      const res = await fetch(
        `/yuksi/GeneralSetting/${isUpdate ? "update" : "create"}`,
        {
          method: isUpdate ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json; charset=utf-8", ...authHeaders },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const prob = await readAny(res);
        const msg =
          (typeof prob === "string" && prob) ||
          prob?.title || prob?.message || prob?.detail ||
          `HTTP ${res.status}`;
        throw new Error(msg);
      }

      setOkMsg(isUpdate ? "Genel ayarlar güncellendi." : "Genel ayarlar oluşturuldu.");
      await loadGeneral();
    } catch (e: any) {
      setError(e?.message || "Genel ayarlar kaydedilemedi.");
    } finally {
      setSavingGeneral(false);
    }
  }

  // ─── Banner list (YENİ)  GET /yuksi/Banner/get-banners ────────────────
  const loadBanners = React.useCallback(async () => {
    setLoadingList(true);
    setError(null);
    try {
      const res = await fetch(`/yuksi/Banner/get-banners`, { cache: "no-store" });
      if (!res.ok) {
        const prob = await readProblem(res);
        throw new Error(typeof prob === "string" ? prob : (prob?.title || prob?.message || `HTTP ${res.status}`));
      }
      const data = await res.json().catch(() => ({} as any));
      const arr = (Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []) as BannerApiItem[];

      const mapped: BannerCard[] = arr.map(x => ({
        id: String(x.id),
        title: x.title ?? "",
        imageUrl: x.image_url ?? "",
        priority: Number.isFinite(x.priority as any) ? Number(x.priority) : 0,
        active: Boolean(x.active),
      }));

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

  // ─── Banner add: POST /yuksi/Banner/set-banner ────────────────────────
  async function addBanner() {
    setSaving(true); setError(null); setOkMsg(null);
    try {
      // image_url: dosya seçilmişse base64 data URL; yoksa yazılan URL
      let image_url = (bannerImageUrl || "").trim();
      if (!image_url && bannerFile) {
        image_url = await fileToBase64DataUrl(bannerFile);
      }
      if (!bannerTitle.trim() || !image_url) {
        setSaving(false);
        setError("Başlık ve görsel zorunludur.");
        return;
      }

      const payload = {
        title: bannerTitle.trim(),
        image_url,
        priority: bannerPriority === '' ? 0 : Number(bannerPriority),
        active: Boolean(bannerActive),
      };

      const res = await fetch(`/yuksi/Banner/set-banner`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const prob = await readProblem(res);
        throw new Error(typeof prob === "string" ? prob : (prob?.title || prob?.message || `HTTP ${res.status}`));
      }
      setOkMsg("Banner eklendi.");
      setBannerTitle(""); setBannerImageUrl(""); setBannerPriority(0); setBannerActive(true); setBannerFile(null);
      await loadBanners();
    } catch (e: any) {
      setError(e?.message || "Banner kaydedilemedi.");
    } finally { setSaving(false); }
  }

  // ─── Banner update: PATCH /yuksi/Banner/update-banner ─────────────────
  async function updateBanner(b: BannerCard) {
    setSaving(true); setError(null); setOkMsg(null);
    try {
      let image_url = (b.imageUrl || "").trim();
      if (b._file) {
        image_url = await fileToBase64DataUrl(b._file);
      }

      const body = {
        id: b.id,                       // string
        title: b.title ?? "",
        image_url,
        priority: Number.isFinite(b.priority as any) ? Number(b.priority) : 0,
        active: Boolean(b.active),
      };

      const res = await fetch(`/yuksi/Banner/update-banner`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const prob = await readProblem(res);
        throw new Error(typeof prob === "string" ? prob : (prob?.title || prob?.message || `HTTP ${res.status}`));
      }
      setOkMsg("Banner güncellendi.");
      await loadBanners();
    } catch (e: any) {
      setError(e?.message || "Banner güncellenemedi.");
    } finally { setSaving(false); }
  }

  // ─── Banner delete: DELETE /yuksi/Banner/delete-banner/{banner_id} ────
  async function removeBanner(idOrStr: string) {
    setSaving(true); setError(null); setOkMsg(null);
    try {
      const res = await fetch(`/yuksi/Banner/delete-banner/${encodeURIComponent(String(idOrStr))}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const prob = await readProblem(res);
        const msg = typeof prob === "string" ? prob : (prob?.title || prob?.message || `HTTP ${res.status}`);
        throw new Error(`Silinemedi: ${msg}`);
      }

      setBanners(prev => prev.filter(x => String(x.id) !== String(idOrStr)));
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

        {/* Yeni Banner Ekle (YENİ ŞEMA) */}
        <section className="card">
          <div className="form">
            <div className="row">
              <div className="col">
                <label className="label">Başlık</label>
                <input className="field" value={bannerTitle} onChange={(e) => setBannerTitle(e.target.value)} placeholder="Banner başlığı" />
              </div>
              <div className="col">
                <label className="label">Öncelik (priority)</label>
                <input
                  className="field"
                  type="number"
                  value={bannerPriority as any}
                  onChange={(e) => setBannerPriority(e.target.value === '' ? '' : Number(e.target.value))}
                />
              </div>
            </div>

            <div className="row">
              <div className="col">
                <label className="label">Görsel URL (image_url)</label>
                <input
                  className="field"
                  value={bannerImageUrl}
                  onChange={(e) => setBannerImageUrl(e.target.value)}
                  placeholder="https://… veya data:image/png;base64,…"
                />
              </div>
              <div className="col align-end">
                <label className="label">Aktif mi?</label>
                <div className="row">
                  <input type="checkbox" checked={bannerActive} onChange={(e) => setBannerActive(e.target.checked)} />
                  <span className="ml-2">Active</span>
                </div>
              </div>
            </div>

            <div className="row row--with-action">
              <div className="filepicker">
                <label className="label">İstersen Dosyadan Görsel Seç</label>
                <div className="filepicker__grid">
                  <input readOnly className="field" value={bannerFile?.name ?? "Seçilen dosya yok"} />
                  <label className="btn btn--light filepicker__btn">
                    Dosya Seç
                    <input type="file" accept="image/*" className="hidden-input" onChange={(e) => setBannerFile(e.target.files?.[0] ?? null)} />
                  </label>
                </div>
                <div className="muted" style={{marginTop: 6}}>
                  Dosya seçerseniz, <code>image_url</code> alanı otomatik olarak base64 data URL’e çevrilir.
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
        {/* Sol – GENERAL SETTINGS (dokunulmadı) */}
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
                {savingGeneral ? "Kaydediliyor…" : (generalId ? "Genel Ayarları Güncelle" : "Genel Ayarları Kaydet")}
              </button>
            </div>
          </div>
        </section>

        {/* Sağ – Banner listesi (YENİ ŞEMA) */}
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

                  {b.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={toDisplaySrc(b.imageUrl)} alt="banner" className="banner__img" loading="lazy" />
                  ) : (
                    <div className="banner__img banner__img--empty">Görsel yok</div>
                  )}

                  <div className="banner__form">
                    <input
                      className="field"
                      value={b.title}
                      onChange={(e) => markDirty(b.id, { title: e.target.value })}
                      placeholder="Başlık"
                    />

                    <input
                      className="field"
                      value={b.imageUrl}
                      onChange={(e) => markDirty(b.id, { imageUrl: e.target.value })}
                      placeholder="image_url (https://… veya data:…)"
                    />

                    <div className="row">
                      <div className="col">
                        <label className="label">Öncelik</label>
                        <input
                          className="field"
                          type="number"
                          value={b.priority}
                          onChange={(e) => markDirty(b.id, { priority: Number(e.target.value) })}
                        />
                      </div>
                      <div className="col align-end">
                        <label className="label">Aktif mi?</label>
                        <div className="row">
                          <input
                            type="checkbox"
                            checked={b.active}
                            onChange={(e) => markDirty(b.id, { active: e.target.checked })}
                          />
                          <span className="ml-2">Active</span>
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="filepicker__grid">
                        <input readOnly className="field" value={b._file?.name ?? "Dosyadan güncelle (opsiyonel)"} />
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

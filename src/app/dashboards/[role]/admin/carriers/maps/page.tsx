// src/app/dashboards/[role]/admin/carriers/maps/page.tsx
'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';

// ---- küçük yardımcılar
type GpsPoint = {
  driver_id: string;
  latitude: number;
  longitude: number;
  updated_at?: string | null;
};

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  for (const k of ['auth_token', 'token', 'access_token', 'jwt', 'auth']) {
    const v = localStorage.getItem(k);
    if (v && v.trim()) return v.replace(/^Bearer\s+/i, '').trim();
  }
  return null;
}
async function readJson<T = any>(res: Response): Promise<T> {
  const t = await res.text();
  try { return t ? JSON.parse(t) : (null as any); } catch { return (t as any); }
}
const pickMsg = (d: any, fb: string) => d?.message || d?.detail || d?.title || fb;
const fmt = (iso?: string | null) => (iso ? new Date(iso).toLocaleString('tr-TR') : '-');

// ---- asıl sayfa
export default function MapsPage() {
  const { role } = useParams<{ role: string }>();

  // Leaflet'i sadece istemcide dinamik import edeceğiz
  const mapRef = React.useRef<L.Map | null>(null);
  const markersRef = React.useRef<Map<string, L.Marker>>(new Map());

  const [Llib, setLlib] = React.useState<typeof import('leaflet') | null>(null);
  const [points, setPoints] = React.useState<GpsPoint[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [autoFit, setAutoFit] = React.useState(true);
  const [intervalMs, setIntervalMs] = React.useState(10000);

  // tek sürücü arama
  const [driverId, setDriverId] = React.useState('');

  const headers = React.useMemo<HeadersInit>(() => {
    const h: HeadersInit = { Accept: 'application/json' };
    const tok = getAuthToken();
    if (tok) (h as any).Authorization = `Bearer ${tok}`;
    return h;
  }, []);

  // Leaflet’i yükle + CSS
  React.useEffect(() => {
    (async () => {
      const L = await import('leaflet');
      // @ts-ignore – Next/webpack ile css import
      await import('leaflet/dist/leaflet.css');

      // default marker ikonlarını düzelt (Next bundling)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';
      // @ts-ignore
      L.Icon.Default.mergeOptions({ iconUrl, shadowUrl });

      setLlib(L);
    })();
  }, []);

  // haritayı kur
  React.useEffect(() => {
    if (!Llib) return;
    if (mapRef.current) return;

    const L = Llib;
    const map = L.map('courier-map', {
      center: [41.015137, 28.97953], // İstanbul
      zoom: 10,
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap',
    }).addTo(map);

    mapRef.current = map;
  }, [Llib]);

  // tüm GPS noktalarını çek
  const fetchAll = React.useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch('/yuksi/GPS/all', { headers, cache: 'no-store' });
      const j: any = await readJson(res);
      if (!res.ok || j?.success === false) throw new Error(pickMsg(j, `HTTP ${res.status}`));
      const list: GpsPoint[] = Array.isArray(j?.data) ? j.data : (Array.isArray(j) ? j : []);
      setPoints(list);
    } catch (e: any) {
      setError(e?.message || 'Konumlar alınamadı.');
      setPoints([]);
    } finally {
      setLoading(false);
    }
  }, [headers]);

  // periyodik yenileme
  React.useEffect(() => {
    void fetchAll();
    const id = setInterval(fetchAll, Math.max(3000, intervalMs));
    return () => clearInterval(id);
  }, [fetchAll, intervalMs]);

  // marker’ları güncelle
  React.useEffect(() => {
    if (!Llib || !mapRef.current) return;

    const L = Llib;
    const map = mapRef.current!;
    const store = markersRef.current;

    // gelen noktalar için marker ekle/güncelle
    const seen = new Set<string>();
    points.forEach(p => {
      if (!Number.isFinite(p.latitude) || !Number.isFinite(p.longitude)) return;
      const key = String(p.driver_id);
      seen.add(key);

      const latlng = L.latLng(p.latitude, p.longitude);
      const popupHtml =
        `<div class="text-sm">
          <div><b>Sürücü:</b> ${key}</div>
          <div><b>Enlem:</b> ${p.latitude.toFixed(5)}, <b>Boylam:</b> ${p.longitude.toFixed(5)}</div>
          <div><b>Güncel:</b> ${fmt(p.updated_at)}</div>
        </div>`;

      if (store.has(key)) {
        const m = store.get(key)!;
        m.setLatLng(latlng).bindPopup(popupHtml);
      } else {
        const m = L.marker(latlng).addTo(map).bindPopup(popupHtml);
        store.set(key, m);
      }
    });

    // listede olmayan markerları kaldır
    for (const [key, m] of store.entries()) {
      if (!seen.has(key)) {
        map.removeLayer(m);
        store.delete(key);
      }
    }

    // otomatik fit
    if (autoFit && store.size > 0) {
      const group = L.featureGroup(Array.from(store.values()));
      map.fitBounds(group.getBounds().pad(0.2));
    }
  }, [points, Llib, autoFit]);

  // tek sürücüyü ara ve ortala
  async function centerSingle() {
    if (!driverId.trim() || !mapRef.current) return;
    try {
      const res = await fetch(`/yuksi/GPS/get/${encodeURIComponent(driverId.trim())}`, {
        headers, cache: 'no-store',
      });
      const j: any = await readJson(res);
      if (!res.ok || j?.success === false) throw new Error(pickMsg(j, `HTTP ${res.status}`));
      // bazı kurulumlar tek obje, bazıları data: { ... } döndürebilir
      const d = j?.data ?? j;
      const lat = Number(d?.latitude), lng = Number(d?.longitude);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) throw new Error('Geçersiz koordinat.');
      const map = mapRef.current!;
      map.setView([lat, lng], Math.max(map.getZoom(), 14));

      // marker varsa popup aç
      const m = markersRef.current.get(driverId.trim());
      if (m) m.openPopup();
    } catch (e: any) {
      alert(e?.message || 'Konum bulunamadı.');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Kurye Canlı Konumları</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchAll()}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700"
          >
            Yenile
          </button>
        </div>
      </div>

      <section className="rounded-2xl border border-neutral-200/70 bg-white shadow-sm">
        {/* Kontroller */}
        <div className="p-4 sm:p-6 grid gap-3 sm:grid-cols-3">
          <div className="flex items-center gap-2">
            <label className="text-sm text-neutral-600">Oto Fit</label>
            <input
              type="checkbox"
              checked={autoFit}
              onChange={(e) => setAutoFit(e.target.checked)}
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-neutral-600">Yenileme</label>
            <select
              value={intervalMs}
              onChange={(e) => setIntervalMs(Number(e.target.value))}
              className="rounded-lg border border-neutral-300 bg-neutral-100 px-3 py-2 text-sm"
            >
              <option value={5000}>5 sn</option>
              <option value={10000}>10 sn</option>
              <option value={15000}>15 sn</option>
              <option value={30000}>30 sn</option>
            </select>
          </div>

          <div className="grid grid-cols-[1fr_auto] gap-2">
            <input
              value={driverId}
              onChange={(e) => setDriverId(e.target.value)}
              placeholder="Sürücü ID ile bul (driver_id)"
              className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 text-neutral-800 outline-none ring-2 ring-transparent transition placeholder:text-neutral-400 focus:bg-white focus:ring-sky-200"
            />
            <button
              onClick={centerSingle}
              className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-sky-600"
            >
              Git
            </button>
          </div>
        </div>

        {error && <div className="px-6 pb-4 text-sm text-rose-600">{error}</div>}

        {/* Harita */}
        <div className="overflow-hidden rounded-b-2xl border-t border-neutral-200/70">
          <div id="courier-map" className="h-[70vh] w-full" />
        </div>

        <div className="flex items-center justify-between px-6 py-3 text-sm text-neutral-600 border-t">
          <div>
            Toplam marker: <b className="text-neutral-900">{points.length}</b>
            {loading && <span className="ml-2 text-neutral-500">• Yükleniyor…</span>}
          </div>
          <div>Kaynak: <code className="text-xs">/yuksi/GPS/all</code></div>
        </div>
      </section>
    </div>
  );
}

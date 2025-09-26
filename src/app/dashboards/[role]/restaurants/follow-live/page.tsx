'use client';

import * as React from 'react';
import { MapPin, Bike, Clock, Phone, RefreshCcw, Search } from 'lucide-react';

/** ---- Demo Types ---- */
type CourierStatus = 'Dağıtımda' | 'Beklemede' | 'Yolda' | 'Teslim Ediyor';
type Courier = {
  id: string;
  name: string;
  phone: string;
  vehicle: 'Motosiklet' | 'Minivan' | 'Panelvan';
  status: CourierStatus;
  // Very rough lat/lng around İstanbul for the demo
  lat: number;
  lng: number;
  lastUpdate: number; // ts
};

/** ---- Demo Seed (İstanbul çevresi) ---- */
const SEED: Courier[] = [
  {
    id: 'c1',
    name: 'Mehmet K.',
    phone: '05xx 111 22 33',
    vehicle: 'Motosiklet',
    status: 'Dağıtımda',
    lat: 41.0405,
    lng: 29.009,
    lastUpdate: Date.now(),
  },
  {
    id: 'c2',
    name: 'Ayşe D.',
    phone: '05xx 222 33 44',
    vehicle: 'Motosiklet',
    status: 'Yolda',
    lat: 41.0205,
    lng: 28.975,
    lastUpdate: Date.now(),
  },
  {
    id: 'c3',
    name: 'Burak T.',
    phone: '05xx 333 44 55',
    vehicle: 'Minivan',
    status: 'Beklemede',
    lat: 41.075,
    lng: 29.01,
    lastUpdate: Date.now(),
  },
  {
    id: 'c4',
    name: 'Elif S.',
    phone: '05xx 444 55 66',
    vehicle: 'Motosiklet',
    status: 'Teslim Ediyor',
    lat: 41.055,
    lng: 28.99,
    lastUpdate: Date.now(),
  },
];

/** ---- Basit “harita” sınırları (İstanbul kabaca) ---- */
const BOUNDS = {
  minLat: 40.96,
  maxLat: 41.13,
  minLng: 28.88,
  maxLng: 29.10,
};

/** Lat/Lng -> yüzde konum (container’a göre) */
function project(lat: number, lng: number) {
  const x =
    ((lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng)) * 100; // %
  const y =
    (1 - (lat - BOUNDS.minLat) / (BOUNDS.maxLat - BOUNDS.minLat)) * 100; // %
  return { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) };
}

/** Duruma göre renk */
function statusColor(s: CourierStatus) {
  switch (s) {
    case 'Dağıtımda':
      return 'bg-sky-500';
    case 'Yolda':
      return 'bg-amber-500';
    case 'Teslim Ediyor':
      return 'bg-emerald-500';
    default:
      return 'bg-neutral-400';
  }
}

export default function FollowLivePage() {
  const [q, setQ] = React.useState('');
  const [status, setStatus] = React.useState<CourierStatus | ''>('');
  const [rows, setRows] = React.useState<Courier[]>(SEED);
  const [selected, setSelected] = React.useState<string | null>(SEED[0].id);

  /** Demo hareket: her 2 sn küçük jitter */
  React.useEffect(() => {
    const t = setInterval(() => {
      setRows((prev) =>
        prev.map((c) => {
          const jitterLat = (Math.random() - 0.5) * 0.0018; // ~200m
          const jitterLng = (Math.random() - 0.5) * 0.0024; // ~250m
          const lat = clamp(c.lat + jitterLat, BOUNDS.minLat, BOUNDS.maxLat);
          const lng = clamp(c.lng + jitterLng, BOUNDS.minLng, BOUNDS.maxLng);
          return { ...c, lat, lng, lastUpdate: Date.now() };
        })
      );
    }, 2000);
    return () => clearInterval(t);
  }, []);

  const filtered = React.useMemo(() => {
    return rows.filter((c) => {
      const mQ =
        !q ||
        c.name.toLowerCase().includes(q.toLowerCase()) ||
        c.phone.replace(/\s/g, '').includes(q.replace(/\s/g, ''));
      const mS = !status || c.status === status;
      return mQ && mS;
    });
  }, [rows, q, status]);

  const sel = filtered.find((c) => c.id === selected) ?? filtered[0] ?? null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Canlı Takip</h1>
        <button
          onClick={() => setRows(SEED.map((c) => ({ ...c, lastUpdate: Date.now() })))}
          className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm shadow-sm hover:bg-neutral-50"
          title="Yenile (demo)"
        >
          <RefreshCcw className="h-4 w-4" />
          Yenile
        </button>
      </div>

      <section className="rounded-2xl border border-neutral-200/70 bg-white shadow-sm soft-card overflow-hidden">
        {/* Üst filtre alanı */}
        <div className="px-4 lg:px-6 py-4 sm:py-6">
          <div className="grid items-end gap-3 md:grid-cols-[minmax(220px,1fr)_200px_auto]">
            <div>
              <label className="mb-1 block text-sm font-semibold text-neutral-700">
                Kurye / Telefon
              </label>
              <div className="relative">
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="İsim veya tel ara…"
                  className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 pl-9 outline-none ring-2 ring-transparent transition focus:ring-sky-200"
                />
                <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-neutral-700">
                Durum
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as CourierStatus | '')}
                className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 outline-none ring-2 ring-transparent transition focus:ring-sky-200"
              >
                <option value="">Tümü</option>
                <option>Beklemede</option>
                <option>Yolda</option>
                <option>Dağıtımda</option>
                <option>Teslim Ediyor</option>
              </select>
            </div>

            <div className="flex justify-end">
              <span className="inline-flex items-center gap-2 rounded-xl bg-orange-50 px-3 py-2 text-sm text-orange-700">
                Aktif Kurye: <strong>{filtered.length}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Alt: Harita + Liste + Detay */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] border-t border-neutral-200/70">
          {/* Harita + liste */}
          <div className="grid grid-rows-[1fr_auto]">
            {/* Map */}
            <div className="relative">
              {/* Basit arkaplan (harita efekti) */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,#f1f5f9,transparent_60%),radial-gradient(circle_at_70%_70%,#eef2ff,transparent_60%)]" />
              <div className="absolute inset-0">
                {/* Markers */}
                {filtered.map((c) => {
                  const p = project(c.lat, c.lng);
                  const active = sel?.id === c.id;
                  return (
                    <button
                      key={c.id}
                      title={`${c.name} • ${c.status}`}
                      onClick={() => setSelected(c.id)}
                      className="group absolute -translate-x-1/2 -translate-y-full"
                      style={{ left: `${p.x}%`, top: `${p.y}%` }}
                    >
                      <div
                        className={`rounded-full px-2 py-1 text-[11px] font-medium text-white shadow
                        ${statusColor(c.status)} ${active ? 'ring-2 ring-offset-2 ring-offset-white ring-orange-400' : ''}`}
                      >
                        {c.name.split(' ')[0]}
                      </div>
                      <div className="mx-auto h-5 w-[2px] bg-neutral-500/40" />
                      <MapPin
                        className={`h-5 w-5 mx-auto ${
                          active ? 'text-orange-500' : 'text-neutral-700'
                        }`}
                        fill={active ? 'currentColor' : 'none'}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Liste (alt bar) */}
            <div className="overflow-x-auto border-t border-neutral-200/70 bg-white">
              <div className="flex gap-3 px-4 py-3">
                {filtered.map((c) => {
                  const active = sel?.id === c.id;
                  return (
                    <button
                      key={c.id}
                      onClick={() => setSelected(c.id)}
                      className={`min-w-[220px] flex items-center gap-3 rounded-xl border px-3 py-2 text-left transition ${
                        active
                          ? 'border-orange-300 bg-orange-50'
                          : 'border-neutral-200 bg-white hover:bg-neutral-50'
                      }`}
                    >
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${statusColor(
                          c.status
                        )}`}
                      />
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-neutral-900">
                          {c.name}
                        </div>
                        <div className="text-xs text-neutral-500">{c.status}</div>
                      </div>
                      <Bike className="h-4 w-4 text-neutral-400" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sağ detay paneli */}
          <aside className="border-t lg:border-t-0 lg:border-l border-neutral-200/70 bg-white p-4 lg:p-6">
            {!sel ? (
              <div className="grid h-full place-items-center text-sm text-neutral-500">
                Kurye seçiniz.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-lg font-semibold">{sel.name}</div>
                    <div className="text-sm text-neutral-500">{sel.vehicle}</div>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold text-white ${statusColor(
                      sel.status
                    )}`}
                  >
                    {sel.status}
                  </span>
                </div>

                <div className="rounded-xl border border-neutral-200 p-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-neutral-500" />
                    <a
                      className="text-sky-600 hover:underline"
                      href={`tel:${sel.phone.replace(/\s/g, '')}`}
                    >
                      {sel.phone}
                    </a>
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-neutral-500" />
                    <span className="text-neutral-700">
                      Son güncelleme:{' '}
                      <b>
                        {new Date(sel.lastUpdate).toLocaleTimeString('tr-TR', {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </b>
                    </span>
                  </div>
                </div>

                <div className="rounded-xl bg-orange-50 p-3 text-sm text-orange-800">
                  <p className="font-semibold mb-1">Tahmini Bilgiler (demo)</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Yakın sipariş sayısı: 2</li>
                    <li>Tahmini varış: 12–18 dk</li>
                    <li>Güzergâh: Kadıköy → Moda → Caferağa</li>
                  </ul>
                </div>

                <div className="flex gap-2">
                  <button
                    className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm hover:bg-neutral-50"
                    onClick={() => alert('Mesaj gönder (demo)')}
                  >
                    Mesaj Gönder
                  </button>
                  <button
                    className="rounded-xl bg-orange-500 px-3 py-2 text-sm font-semibold text-white hover:bg-orange-600"
                    onClick={() => alert('Canlı rota izle (demo)')}
                  >
                    Canlı Rota
                  </button>
                </div>
              </div>
            )}
          </aside>
        </div>
      </section>
    </div>
  );
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

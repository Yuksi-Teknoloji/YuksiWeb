// src/app/dashboards/[role]/admin/carriers/maps/page.tsx
'use client';

import * as React from 'react';

export default function MapsPage() {
  const [mode, setMode] = React.useState<'search' | 'coords'>('search');
  const [query, setQuery] = React.useState('İstanbul');
  const [lat, setLat] = React.useState('41.015137');     // İstanbul
  const [lng, setLng] = React.useState('28.979530');
  const [zoom, setZoom] = React.useState(11);

  // iframe için src oluşturucu
  const src = React.useMemo(() => {
    const base = 'https://maps.google.com/maps';
    if (mode === 'search' && query.trim()) {
      const q = encodeURIComponent(query.trim());
      return `${base}?q=${q}&z=${zoom}&output=embed`;
    }
    const q = `${lat || '41.015137'},${lng || '28.979530'}`;
    return `${base}?q=${q}&z=${zoom}&output=embed`;
  }, [mode, query, lat, lng, zoom]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Harita</h1>

      <section className="rounded-2xl border border-neutral-200/70 bg-white shadow-sm">
        {/* Kontroller */}
        <div className="p-4 sm:p-6">
          <div className="mb-4 flex items-center gap-2">
            <button
              onClick={() => setMode('search')}
              className={`rounded-xl px-3 py-1.5 text-sm font-semibold shadow-sm ${
                mode === 'search'
                  ? 'bg-indigo-500 text-white'
                  : 'bg-neutral-100 text-neutral-800'
              }`}
            >
              Adres Ara
            </button>
            <button
              onClick={() => setMode('coords')}
              className={`rounded-xl px-3 py-1.5 text-sm font-semibold shadow-sm ${
                mode === 'coords'
                  ? 'bg-indigo-500 text-white'
                  : 'bg-neutral-100 text-neutral-800'
              }`}
            >
              Enlem / Boylam
            </button>
          </div>

          {mode === 'search' ? (
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Adres, konum, yer (ör. Kadıköy Rıhtım)"
                className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 text-neutral-800 outline-none ring-2 ring-transparent transition placeholder:text-neutral-400 focus:bg-white focus:ring-sky-200"
              />
              <ZoomSelect zoom={zoom} setZoom={setZoom} />
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
              <input
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                placeholder="Enlem (lat) — ör. 41.015137"
                className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 text-neutral-800 outline-none ring-2 ring-transparent transition placeholder:text-neutral-400 focus:bg-white focus:ring-sky-200"
              />
              <input
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                placeholder="Boylam (lng) — ör. 28.979530"
                className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 text-neutral-800 outline-none ring-2 ring-transparent transition placeholder:text-neutral-400 focus:bg-white focus:ring-sky-200"
              />
              <ZoomSelect zoom={zoom} setZoom={setZoom} />
            </div>
          )}
        </div>

        {/* Harita */}
        <div className="overflow-hidden rounded-b-2xl border-t border-neutral-200/70">
          <div className="relative w-full" style={{ paddingTop: '56.25%' /* 16:9 */ }}>
            <iframe
              key={src} // src değişince yeniden yüklesin
              src={src}
              aria-label="Google Maps"
              className="absolute left-0 top-0 h-full w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function ZoomSelect({
  zoom,
  setZoom,
}: {
  zoom: number;
  setZoom: (z: number) => void;
}) {
  return (
    <select
      value={zoom}
      onChange={(e) => setZoom(Number(e.target.value))}
      className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 text-neutral-800 outline-none ring-2 ring-transparent transition focus:bg-white focus:ring-sky-200"
      title="Yakınlaştırma"
    >
      {[8, 9, 10, 11, 12, 13, 14, 15].map((z) => (
        <option key={z} value={z}>
          Yakınlaştırma: {z}
        </option>
      ))}
    </select>
  );
}

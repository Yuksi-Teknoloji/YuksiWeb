// src/app/dashboards/[role]/admin/shipments/shipping-list/page.tsx
'use client';

import * as React from 'react';

type Row = {
  id: string;
  name: string;      // isim / plaka / tel
  type: 'Bugün' | 'Randevulu' | 'Ekspres' | 'Standart';
  status: 'Beklemede' | 'Yolda' | 'Tamamlandı' | 'İptal';
  date: string;      // ISO yyyy-mm-dd
};

const SEED: Row[] = [
  { id: '1', name: '34ABC123 · 0532 000 00 00', type: 'Bugün',    status: 'Yolda',      date: '2025-09-22' },
  { id: '2', name: 'Emre Kuzey · 0541 111 22 33', type: 'Randevulu', status: 'Beklemede', date: '2025-09-22' },
];

export default function ShippingListPage() {
  const [q, setQ] = React.useState('');
  const [passType, setPassType] = React.useState<string>('');
  const [byStatus, setByStatus] = React.useState<string>('');
  const [start, setStart] = React.useState<string>(today());
  const [end, setEnd] = React.useState<string>(today());
  const [rows] = React.useState<Row[]>(SEED);

  const filtered = React.useMemo(() => {
    const s = start ? new Date(start) : undefined;
    const e = end ? new Date(end) : undefined;

    return rows.filter((r) => {
      const matchesQ =
        !q ||
        r.name.toLowerCase().includes(q.toLowerCase());

      const matchesType = !passType || r.type === passType;
      const matchesStatus = !byStatus || r.status === byStatus;

      const d = new Date(r.date);
      const inRange = (!s || d >= s) && (!e || d <= e);

      return matchesQ && matchesType && matchesStatus && inRange;
    });
  }, [rows, q, passType, byStatus, start, end]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Taşıma Listesi</h1>
      </div>

      <section className="rounded-2xl border border-neutral-200/70 bg-white shadow-sm soft-card">
        {/* Filtreler */}
        <div className="p-4 sm:p-6">
          <div className="-ml-2 md:-ml-4 grid gap-4 md:grid-cols-[minmax(240px,1fr)_120px_140px_160px_160px_auto] items-end">
            {/* isim, plaka veya telefon */}
            <div className='w-full max-w-[290px]'>
              <div className="mb-1 text-sm font-semibold text-neutral-700">
                İsim,Plaka veya Telefon No
              </div>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Plaka veya telefon no"
                className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-2.5 py-1.5 text-sm
               text-neutral-800 outline-none ring-2 ring-transparent transition
               placeholder:text-neutral-400 focus:bg-white focus:ring-sky-200"
              />
            </div>

            {/* Geçiş Türü */}
            <div>
              <div className=" -ml-2 md:-ml-4 mb-1 text-sm font-semibold text-neutral-700">
                Geçiş Türü
              </div>
              <select
                value={passType}
                onChange={(e) => setPassType(e.target.value)}
                className="-ml-2 md:-ml-4  w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 outline-none ring-2 ring-transparent transition focus:bg-white focus:ring-sky-200"
              >
                <option value="">Tümü</option>
                <option>Bugün</option>
                <option>Randevulu</option>
                <option>Ekspres</option>
                <option>Standart</option>
              </select>
            </div>

            {/* Duruma Göre */}
            <div>
              <div className=" -ml-2 md:-ml-4 mb-1 text-sm font-semibold text-neutral-700">
                Duruma Göre
              </div>
              <select
                value={byStatus}
                onChange={(e) => setByStatus(e.target.value)}
                className="-ml-2 md:-ml-4 w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 outline-none ring-2 ring-transparent transition focus:bg-white focus:ring-sky-200"
              >
                <option value="">Tümü</option>
                <option>Beklemede</option>
                <option>Yolda</option>
                <option>Tamamlandı</option>
                <option>İptal</option>
              </select>
            </div>

            {/* Başlangıç */}
            <div>
              <div className="-ml-2 md:-ml-4 mb-1 text-sm font-semibold text-neutral-700">
                Başlangıç:
              </div>
              <div className="relative">
                <input
                  type="date"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  className="-ml-2 md:-ml-4 w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 pr-10 outline-none ring-2 ring-transparent transition focus:bg-white focus:ring-sky-200"
                />
                <CalendarIcon />
              </div>
            </div>

            {/* Bitiş */}
            <div>
              <div className="-ml-2 md:-ml-4 mb-1 text-sm font-semibold text-neutral-700">
                Bitiş:
              </div>
              <div className="relative">
                <input
                  type="date"
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                  className="-ml-2 md:-ml-4 w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 pr-10 outline-none ring-2 ring-transparent transition focus:bg-white focus:ring-sky-200"
                />
                <CalendarIcon />
              </div>
            </div>
          </div>
        </div>

        {/* Tablo */}
        <div className="border-t border-neutral-200/70">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="text-left text-sm text-neutral-500">
                  <th className="px-4 py-2 font-medium">İsim / Plaka / Tel</th>
                  <th className="px-4 py-2 font-medium">Geçiş Türü</th>
                  <th className="px-4 py-2 font-medium">Durum</th>
                  <th className="px-4 py-2 font-medium">Tarih</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-t border-neutral-200/70 hover:bg-neutral-50">
                    <td className="px-6 py-3">{r.name}</td>
                    <td className="px-6 py-3">{r.type}</td>
                    <td className="px-6 py-3">{r.status}</td>
                    <td className="px-6 py-3">
                      {new Date(r.date).toLocaleDateString('tr-TR')}
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-sm text-neutral-500">
                      Kayıt bulunamadı.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}

/* Küçük ikonlar (inline SVG) */
function CalendarIcon() {
  return (
    <svg
      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

function BarsIcon() {
  return (
    <svg
      className="h-5 w-5 text-neutral-600"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <rect x="3" y="5" width="4" height="14" rx="1.5" />
      <rect x="10" y="9" width="4" height="10" rx="1.5" />
      <rect x="17" y="7" width="4" height="12" rx="1.5" />
    </svg>
  );
}

function today() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

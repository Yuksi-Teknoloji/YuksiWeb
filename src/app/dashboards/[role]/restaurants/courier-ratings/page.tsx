'use client';

import * as React from 'react';
import { Star, StarHalf, Search, SortAsc, X } from 'lucide-react';

type Courier = {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  vehicle: 'Motosiklet' | 'Minivan' | 'Panelvan';
  avg: number;     // 0-5
  votes: number;   // oy adedi
  completed: number;
  lastComment?: string;
};

const SEED: Courier[] = [
  { id: 'c1', name: 'Mehmet K.',  phone: '05xx 111 22 33', avatar: '/icons/1.jpg', vehicle: 'Motosiklet', avg: 4.7, votes: 86, completed: 1240, lastComment: 'Hızlı ve nazik.' },
  { id: 'c2', name: 'Ayşe D.',    phone: '05xx 222 33 44', avatar: '/icons/1.jpg', vehicle: 'Motosiklet', avg: 4.3, votes: 42, completed: 820,  lastComment: 'Paket sıcak geldi.' },
  { id: 'c3', name: 'Burak T.',   phone: '05xx 333 44 55', avatar: '/icons/3.jpg', vehicle: 'Minivan',    avg: 4.9, votes: 51, completed: 910,  lastComment: 'Süper hizmet.' },
  { id: 'c4', name: 'Elif S.',    phone: '05xx 444 55 66', avatar: '/icons/4.jpg', vehicle: 'Motosiklet', avg: 4.1, votes: 33, completed: 605,  lastComment: 'Güzel iletişim.' },
  { id: 'c5', name: 'Onur A.',    phone: '05xx 555 66 77', avatar: '/icons/5.jpg', vehicle: 'Panelvan',   avg: 3.8, votes: 20, completed: 300,  lastComment: 'Biraz gecikme oldu.' },
];

export default function CourierRatingsPage() {
  const [rows, setRows] = React.useState<Courier[]>(SEED);
  const [q, setQ] = React.useState('');
  const [minRating, setMinRating] = React.useState<number>(0);
  const [sortKey, setSortKey] = React.useState<'avg' | 'completed' | 'name'>('avg');
  const [sortAsc, setSortAsc] = React.useState(false);

  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [tempRating, setTempRating] = React.useState<number>(0);
  const [hoverRating, setHoverRating] = React.useState<number>(0);
  const [comment, setComment] = React.useState('');

  const active = rows.find(r => r.id === activeId) ?? null;

  const filtered = React.useMemo(() => {
    let list = rows.filter(r => {
      const mQ = !q || r.name.toLowerCase().includes(q.toLowerCase()) || r.phone.replace(/\s/g, '').includes(q.replace(/\s/g, ''));
      const mR = r.avg >= minRating;
      return mQ && mR;
    });
    list.sort((a, b) => {
      let v = 0;
      if (sortKey === 'avg') v = a.avg - b.avg;
      if (sortKey === 'completed') v = a.completed - b.completed;
      if (sortKey === 'name') v = a.name.localeCompare(b.name, 'tr');
      return sortAsc ? v : -v;
    });
    return list;
  }, [rows, q, minRating, sortKey, sortAsc]);

  function openRate(id: string) {
    setActiveId(id);
    setTempRating(0);
    setHoverRating(0);
    setComment('');
  }

  function submitRating() {
    if (!active || tempRating <= 0) return;
    setRows(prev =>
      prev.map(c => {
        if (c.id !== active.id) return c;
        const sum = c.avg * c.votes + tempRating;
        const votes = c.votes + 1;
        const avg = +(sum / votes).toFixed(2);
        return { ...c, avg, votes, lastComment: comment || c.lastComment };
      })
    );
    setActiveId(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Kurye Puanları</h1>
        <div className="hidden md:flex items-center gap-2 text-sm text-neutral-500">
          <SortButton
            active={sortKey === 'avg'} asc={sortAsc}
            onClick={() => { setSortKey('avg'); setSortAsc(k => !k); }}
            label="Ort."
          />
          <SortButton
            active={sortKey === 'completed'} asc={sortAsc}
            onClick={() => { setSortKey('completed'); setSortAsc(k => !k); }}
            label="Teslim"
          />
          <SortButton
            active={sortKey === 'name'} asc={sortAsc}
            onClick={() => { setSortKey('name'); setSortAsc(k => !k); }}
            label="İsim"
          />
        </div>
      </div>

      <section className="rounded-2xl border border-neutral-200/70 bg-white shadow-sm soft-card overflow-hidden">
        {/* Filtreler */}
        <div className="px-4 lg:px-6 py-4 sm:py-6">
          <div className="grid items-end gap-4 md:grid-cols-[minmax(240px,1fr)_220px_200px]">
            <div>
              <label className="mb-1 block text-sm font-semibold text-neutral-700">Kurye / Telefon</label>
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
              <label className="mb-1 block text-sm font-semibold text-neutral-700">Minimum Puan</label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={0}
                  max={5}
                  step={0.5}
                  value={minRating}
                  onChange={(e) => setMinRating(parseFloat(e.target.value))}
                  className="w-full"
                />
                <Star className="h-4 w-4 text-orange-500" />
                <span className="w-8 text-sm tabular-nums">{minRating.toFixed(1)}</span>
              </div>
            </div>

            <div className="flex justify-end">
              <span className="inline-flex items-center gap-2 rounded-xl bg-orange-50 px-3 py-2 text-sm text-orange-700">
                Listelenen: <strong>{filtered.length}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Tablo */}
        <div className="border-t border-neutral-200/70">
          <div className="overflow-x-auto bg-white px-4 lg:px-6">
            <table className="w-full table-fixed">
              <thead>
                <tr className="text-left text-sm text-neutral-500">
                  <th className="px-4 lg:px-6 py-3 font-medium w-[120px]"> </th>
                  <th className="px-4 lg:px-6 py-3 font-medium">Kurye</th>
                  <th className="px-4 lg:px-6 py-3 font-medium w-40">Puan</th>
                  <th className="px-4 lg:px-6 py-3 font-medium w-32">Teslim</th>
                  <th className="px-4 lg:px-6 py-3 font-medium">Son Yorum</th>
                  <th className="px-4 lg:px-6 py-3 font-medium w-40">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="border-t border-neutral-200/70 hover:bg-neutral-50 align-middle">
                    <td className="px-4 lg:px-6 py-3">
                      <img
                        src={c.avatar}
                        alt={c.name}
                        className="h-10 w-10 rounded-full object-cover ring-2 ring-white shadow"
                      />
                    </td>
                    <td className="px-4 lg:px-6 py-3">
                      <div className="font-medium text-neutral-900">{c.name}</div>
                      <div className="text-xs text-neutral-500">{c.vehicle} · {c.phone}</div>
                    </td>
                    <td className="px-4 lg:px-6 py-3">
                      <RatingView value={c.avg} /> 
                      <div className="text-xs text-neutral-500 mt-0.5">({c.votes})</div>
                    </td>
                    <td className="px-4 lg:px-6 py-3 tabular-nums">{c.completed}</td>
                    <td className="px-4 lg:px-6 py-3 truncate max-w-[280px]">{c.lastComment ?? '—'}</td>
                    <td className="px-4 lg:px-6 py-3">
                      <button
                        onClick={() => openRate(c.id)}
                        className="rounded-lg bg-orange-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-orange-600"
                      >
                        Puan Ver
                      </button>
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-neutral-500">
                      Kayıt bulunamadı.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Puan verme modali */}
      {active && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <div className="font-semibold">Puan Ver</div>
              <button onClick={() => setActiveId(null)} className="p-1 rounded-md hover:bg-neutral-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-5 py-4 space-y-4">
              <div className="flex items-center gap-3">
                <img src={active.avatar} alt={active.name} className="h-10 w-10 rounded-full object-cover" />
                <div>
                  <div className="font-medium">{active.name}</div>
                  <div className="text-xs text-neutral-500">{active.phone}</div>
                </div>
              </div>

              <div>
                <div className="mb-2 text-sm text-neutral-700">Puanınız</div>
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map((i) => (
                    <button
                      key={i}
                      className="p-1"
                      onMouseEnter={() => setHoverRating(i)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setTempRating(i)}
                      aria-label={`${i} yıldız`}
                    >
                      <Star
                        className={`h-7 w-7 transition ${
                          (hoverRating || tempRating) >= i ? 'fill-orange-500 text-orange-500' : 'text-neutral-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm tabular-nums">{(hoverRating || tempRating) || '-'}/5</span>
                </div>
              </div>

              <div>
                <div className="mb-1 text-sm text-neutral-700">Yorum (opsiyonel)</div>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Teslimat deneyiminizi kısaca yazın…"
                  className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 outline-none ring-2 ring-transparent transition focus:ring-sky-200"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 px-5 py-4 border-t">
              <button
                onClick={() => setActiveId(null)}
                className="rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm hover:bg-neutral-50"
              >
                Vazgeç
              </button>
              <button
                onClick={submitRating}
                disabled={tempRating === 0}
                className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* --- küçük yardımcı bileşenler --- */
function RatingView({ value }: { value: number }) {
  // tam/yarım/yok yıldızları çizer
  const full = Math.floor(value);
  const half = value - full >= 0.25 && value - full < 0.75 ? 1 : 0;
  const empty = 5 - full - half;

  return (
    <div className="flex items-center">
      {Array.from({ length: full }).map((_, i) => (
        <Star key={`f-${i}`} className="h-4 w-4 fill-orange-500 text-orange-500" />
      ))}
      {half === 1 && <StarHalf className="h-4 w-4 fill-orange-500 text-orange-500" />}
      {Array.from({ length: empty }).map((_, i) => (
        <Star key={`e-${i}`} className="h-4 w-4 text-neutral-300" />
      ))}
      <span className="ml-2 text-sm tabular-nums">{value.toFixed(1)}</span>
    </div>
  );
}

function SortButton({
  active, asc, onClick, label,
}: { active: boolean; asc: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={[
        'inline-flex items-center gap-1 rounded-md px-2 py-1',
        active ? 'bg-orange-100 text-orange-700' : 'hover:bg-neutral-100',
      ].join(' ')}
      title={`Sırala (${label})`}
    >
      <SortAsc className={`h-4 w-4 ${asc ? 'rotate-180' : ''}`} />
      {label}
    </button>
  );
}

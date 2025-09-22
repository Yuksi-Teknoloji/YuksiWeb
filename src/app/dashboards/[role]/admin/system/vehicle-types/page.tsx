'use client';

import * as React from 'react';

type VehicleType = {
  id: string;
  name: string;          // Araç Tipi adı
  code: string | number; // Kod
  imageUrl: string;      // Görsel
  category: string;      // Sınıf / Kalıp
};

const CATEGORY_OPTIONS = [
  'Araç Sınıfı',
  'Hatchback',
  'Sedan',
  'SUV',
  'Minivan',
  'Panelvan',
] as const;

const initialRows: VehicleType[] = [
  {
    id: 'v-1',
    name: 'Kurye Motosiklet',
    code: 1,
    imageUrl: '/images/kurye.png',
    category: 'Araç Sınıfı',
  },
  {
    id: 'v-2',
    name: 'Minivan',
    code: 5,
    imageUrl: '/images/minivan.png',
    category: 'Araç Sınıfı',
  },
  {
    id: 'v-3',
    name: 'Panelvan',
    code: 10,
    imageUrl: '/images/panelvan.png',
    category: 'Araç Sınıfı',
  },
];

export default function VehicleTypesPage() {
  const [rows, setRows] = React.useState<VehicleType[]>(initialRows);

  const handleAdd = () => {
    const n = rows.length + 1;
    setRows(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: `Yeni Araç Tipi ${n}`,
        code: n,
        imageUrl: '/images/placeholder.png',
        category: 'Araç Sınıfı',
      },
    ]);
  };

  const handleDelete = (id: string) => {
    setRows(prev => prev.filter(r => r.id !== id));
  };

  const handleCategory = (id: string, value: string) => {
    setRows(prev => prev.map(r => (r.id === id ? { ...r, category: value } : r)));
  };

  return (
    <div className="space-y-4">
      {/* Başlık + breadcrumb alanı, istersen admin/layout.tsx’te de olabilir */}
      <div className="px-2 sm:px-0">
        <h1 className="text-2xl font-semibold tracking-tight">Araç Tipleri</h1>
      </div>

      {/* Kart / Kapsayıcı */}
      <section className="rounded-2xl border border-neutral-200/70 bg-white shadow-sm">
        {/* Üst şerit */}
        <div className="flex items-center justify-between gap-4 p-5 sm:p-6">
          <div className="text-lg font-semibold">Araç Tipleri</div>
          <button
            onClick={handleAdd}
            className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-sky-600 active:translate-y-px"
          >
            Yeni Araç Tipi Ekle
          </button>
        </div>

        <div className="h-px w-full bg-neutral-200/70" />

        {/* Tablo */}
        <div className="overflow-x-auto">
          <table className="min-w-full table-fixed">
            <thead>
              <tr className="text-left text-sm text-neutral-500">
                <th className="w-24 px-6 py-3 font-medium">#</th>
                <th className="px-6 py-3 font-medium">Araç Adı</th>
                <th className="w-40 px-6 py-3 font-medium">Kod</th>
                <th className="w-60 px-6 py-3 font-medium">Sınıf</th>
                <th className="w-24 px-6 py-3" />
              </tr>
            </thead>

            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-neutral-200/70 align-middle">
                  {/* Görsel hücresi */}
                  <td className="px-6 py-4">
                    <div className="h-16 w-16 overflow-hidden rounded-lg ring-1 ring-neutral-200">
                      {/* İstersen <Image /> da kullanabilirsin */}
                      <img
                        src={r.imageUrl}
                        alt={r.name}
                        className="h-full w-full object-contain bg-white"
                      />
                    </div>
                  </td>

                  {/* İsim */}
                  <td className="px-6 py-4">
                    <div className="font-semibold text-neutral-900">{r.name}</div>
                  </td>

                  {/* Kod */}
                  <td className="px-6 py-4 text-neutral-900">{r.code}</td>

                  {/* Sınıf / Kalıp seçimi */}
                  <td className="px-6 py-4">
                    <select
                      value={r.category}
                      onChange={(e) => handleCategory(r.id, e.target.value)}
                      className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none ring-2 ring-transparent transition focus:border-neutral-300 focus:ring-sky-200"
                    >
                      {CATEGORY_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Sil butonu */}
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="rounded-xl bg-red-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-600 active:translate-y-px"
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              ))}

              {rows.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-sm text-neutral-500"
                  >
                    Henüz bir araç tipi yok. Sağ üstten <strong>“Yeni Araç Tipi Ekle”</strong> ile ekleyebilirsin.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

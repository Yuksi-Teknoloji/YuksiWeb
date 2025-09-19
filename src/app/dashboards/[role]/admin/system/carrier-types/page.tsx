'use client';

import * as React from 'react';

type CarrierType = {
  id: string;
  name: string;
  openingKm: number;
  openingPrice: number;
  kmPrice: number;
  imageUrl: string; // public/images/* ya da tam URL
};

const initialData: CarrierType[] = [
  { id: 'ct-1', name: 'Kurye',    openingKm: 5,  openingPrice: 100,  kmPrice: 50,  imageUrl: '/images/kurye.png' },
  { id: 'ct-2', name: 'Minivan',  openingKm: 5,  openingPrice: 500,  kmPrice: 50,  imageUrl: '/images/minivan.png' },
  { id: 'ct-3', name: 'Panelvan', openingKm: 30, openingPrice: 2000, kmPrice: 100, imageUrl: '/images/panelvan.png' },
];

export default function CarrierTypesPage() {
  const [rows, setRows] = React.useState<CarrierType[]>(initialData);

  const handleAdd = () => {
    const n = rows.length + 1;
    setRows(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: `Yeni Tür ${n}`,
        openingKm: 5,
        openingPrice: 100,
        kmPrice: 50,
        imageUrl: '/images/placeholder.png',
      },
    ]);
  };

  const handleDelete = (id: string) => {
    setRows(prev => prev.filter(r => r.id !== id));
  };

  return (
    <main className="card">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 p-6">
        <h2 className="text-lg font-semibold">Taşıyıcı Türleri</h2>
        <button
          onClick={handleAdd}
          className="btn-accent rounded-2xl px-4 py-2 text-sm font-medium shadow-sm transition active:translate-y-px"
        >
          Yeni Taşıyıcı Türü Ekle
        </button>
      </div>

      <div className="h-px w-full bg-neutral-200" />

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full table-fixed">
          <thead>
            <tr className="text-left text-sm text-neutral-500">
              <th className="w-40 px-6 py-4 font-medium">Resim</th>
              <th className="px-6 py-4 font-medium">Taşıyıcı Türü</th>
              <th className="w-40 px-6 py-4 font-medium">Açılış Km</th>
              <th className="w-44 px-6 py-4 font-medium">Açılış Fiyatı</th>
              <th className="w-40 px-6 py-4 font-medium">Km Fiyatı</th>
              <th className="w-24 px-6 py-4" />
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id} className="border-t border-neutral-200 align-middle">
                <td className="px-6 py-5">
                  <img
                    src={r.imageUrl}
                    alt={r.name}
                    className="h-16 w-auto rounded-xl bg-white object-contain ring-1 ring-neutral-200"
                  />
                </td>
                <td className="px-6 py-5">
                  <div className="font-semibold text-neutral-900">{r.name}</div>
                </td>
                <td className="px-6 py-5 text-neutral-900">{r.openingKm}</td>
                <td className="px-6 py-5 text-neutral-900">{r.openingPrice}</td>
                <td className="px-6 py-5 text-neutral-900">{r.kmPrice}</td>
                <td className="px-6 py-5">
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="rounded-xl bg-red-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-600 active:translate-y-px"
                    aria-label={`Sil: ${r.name}`}
                  >
                    Sil
                  </button>
                </td>
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-sm text-neutral-500">
                  Henüz kayıt yok. Sağ üstten <strong>“Yeni Taşıyıcı Türü Ekle”</strong> ile ekleyebilirsin.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}

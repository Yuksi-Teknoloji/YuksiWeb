'use client';

import * as React from 'react';

type LoadType = {
  id: string;
  name: string;        // Çeşit Adı
  extraPrice: number;  // Ekstra Fiyat
};

const initialRows: LoadType[] = [
  { id: 'lt-1', name: 'Sıvı',       extraPrice: 0 },
  { id: 'lt-2', name: 'Paletli',    extraPrice: 3 },
  { id: 'lt-3', name: 'Sert Cisim', extraPrice: 5 },
];

export default function LoadTypesPage() {
  const [rows, setRows] = React.useState<LoadType[]>(initialRows);

  const handleAdd = () => {
    const n = rows.length + 1;
    setRows(prev => [
      ...prev,
      { id: crypto.randomUUID(), name: `Yeni Çeşit ${n}`, extraPrice: 0 },
    ]);
  };

  const handleDelete = (id: string) => {
    setRows(prev => prev.filter(r => r.id !== id));
  };

  const handleEdit = (id: string) => {
    // hızlı inline prompt (sonra modal yapılabilir)
    const target = rows.find(r => r.id === id);
    if (!target) return;
    const newName = prompt('Çeşit Adı', target.name) ?? target.name;
    const newPriceStr = prompt('Ekstra Fiyat', String(target.extraPrice)) ?? String(target.extraPrice);
    const newPrice = Number(newPriceStr) || 0;
    setRows(prev => prev.map(r => (r.id === id ? { ...r, name: newName, extraPrice: newPrice } : r)));
  };

  return (
    <div className="space-y-4">
      {/* Başlık */}
      <div className="px-2 sm:px-0">
        <h1 className="text-2xl font-semibold tracking-tight">Yük Tipleri</h1>
      </div>

      {/* Kart/kapsayıcı */}
      <section className="rounded-2xl border border-neutral-200/70 bg-white shadow-sm">
        {/* Üst şerit */}
        <div className="flex items-center justify-between p-5 sm:p-6">
          <button
            onClick={handleAdd}
            className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-sky-600 active:translate-y-px"
          >
            Ana Çeşit Ekle
          </button>
        </div>

        <div className="h-px w-full bg-neutral-200/70" />

        {/* Tablo */}
        <div className="overflow-x-auto">
          <table className="min-w-full table-fixed">
            <thead>
              <tr className="text-left text-sm text-neutral-500">
                <th className="px-6 py-3 font-medium">Çeşit Adı</th>
                <th className="w-48 px-6 py-3 font-medium">Ekstra Fiyat</th>
                <th className="w-44 px-6 py-3" />
              </tr>
            </thead>

            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-neutral-200/70 align-middle">
                  <td className="px-6 py-4">
                    <span className="font-semibold text-neutral-900">{r.name}</span>
                  </td>
                  <td className="px-6 py-4 text-neutral-900">
                    {Number.isFinite(r.extraPrice) ? r.extraPrice : 0}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="rounded-md bg-red-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-600 active:translate-y-px"
                      >
                        Sil
                      </button>
                      <button
                        onClick={() => handleEdit(r.id)}
                        className="rounded-md bg-green-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-600 active:translate-y-px"
                      >
                        Düzenle
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {rows.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-sm text-neutral-500">
                    Henüz yük tipi yok. Üstteki <strong>“Ana Çeşit Ekle”</strong> ile ekleyebilirsin.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Alt kaydırma izi (görsel benzetim için, istersen kaldır) */}
        <div className="px-5 pb-5">
          <div className="h-2 rounded-full bg-purple-200/60">
            <div className="h-2 w-24 rounded-full bg-purple-400/60" />
          </div>
        </div>
      </section>
    </div>
  );
}

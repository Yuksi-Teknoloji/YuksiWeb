'use client';

import * as React from 'react';

type AdditionalCost = {
  id: string;
  carrier: string;   // Taşıyıcı
  service: string;   // Talep Edilen Hizmet
  price: number;     // Fiyat
};

const CARRIER_OPTIONS = ['Kurye', 'Araç', 'Taşıyıcıpaketi'] as const;

const initialRows: AdditionalCost[] = [
  { id: 'ac-1', carrier: 'Kurye',         service: 'Bahşiş - 10TL',        price: 10 },
  { id: 'ac-2', carrier: 'Kurye',         service: 'Hediye Paketi',        price: 100 },
  { id: 'ac-3', carrier: 'Araç',          service: 'Taşıma Yardımı',       price: 100 },
  { id: 'ac-4', carrier: 'Araç',          service: 'İndir - Bindirme Ücreti', price: 1000 },
  { id: 'ac-5', carrier: 'Taşıyıcıpaketi',service: 'Haftalık Paket',       price: 1000 },
  { id: 'ac-6', carrier: 'Araç',          service: 'Tüm Yükleme İşçiliği', price: 2000 },
  { id: 'ac-7', carrier: 'Taşıyıcıpaketi',service: 'Aylık Paket',          price: 2500 },
];

export default function AdditionalCostsPage() {
  const [rows, setRows] = React.useState<AdditionalCost[]>(initialRows);

  const handleAdd = () => {
    const n = rows.length + 1;
    setRows(prev => [
      ...prev,
      { id: crypto.randomUUID(), carrier: 'Kurye', service: `Yeni Ek Hizmet ${n}`, price: 0 },
    ]);
  };

  const handleDelete = (id: string) => {
    setRows(prev => prev.filter(r => r.id !== id));
  };

  const handleEdit = (id: string) => {
    const r = rows.find(x => x.id === id);
    if (!r) return;

    const c = prompt('Taşıyıcı (Kurye/Araç/Taşıyıcıpaketi):', r.carrier) ?? r.carrier;
    const s = prompt('Talep Edilen Hizmet:', r.service) ?? r.service;
    const pStr = prompt('Fiyat:', String(r.price)) ?? String(r.price);
    const p = Number(pStr) || 0;

    setRows(prev => prev.map(x => (x.id === id ? { ...x, carrier: c, service: s, price: p } : x)));
  };

  const handleCarrierChange = (id: string, value: string) => {
    setRows(prev => prev.map(r => (r.id === id ? { ...r, carrier: value } : r)));
  };

  return (
    <div className="space-y-4">
      {/* Başlık */}
      <div className="px-2 sm:px-0">
        <h1 className="text-2xl font-semibold tracking-tight">Ürünler</h1>
      </div>

      {/* Kart */}
      <section className="rounded-2xl border border-neutral-200/70 bg-white shadow-sm">
        {/* Üst şerit */}
        <div className="flex items-center justify-between p-5 sm:p-6">
          <button
            onClick={handleAdd}
            className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-sky-600 active:translate-y-px"
          >
            Yeni Ek Hizmet Ekle
          </button>
        </div>

        <div className="h-px w-full bg-neutral-200/70" />

        {/* Tablo */}
        <div className="overflow-x-auto">
          <table className="min-w-full table-fixed">
            <thead>
              <tr className="text-left text-sm text-neutral-500">
                <th className="px-6 py-3 font-medium">Taşıyıcı</th>
                <th className="px-6 py-3 font-medium">Talep Edilen Hizmet</th>
                <th className="w-40 px-6 py-3 font-medium">Fiyat</th>
                <th className="w-44 px-6 py-3" />
              </tr>
            </thead>

            <tbody>
              {rows.map(r => (
                <tr key={r.id} className="border-t border-neutral-200/70 align-middle">
                  {/* Taşıyıcı */}
                  <td className="px-6 py-4">
                    {/* İstersen select’i kaldırıp düz text yapabilirsin */}
                    <select
                      value={r.carrier}
                      onChange={e => handleCarrierChange(r.id, e.target.value)}
                      className="rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none ring-2 ring-transparent transition focus:border-neutral-300 focus:ring-sky-200"
                    >
                      {CARRIER_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Talep Edilen Hizmet */}
                  <td className="px-6 py-4">
                    <span className="font-semibold text-neutral-900">{r.service}</span>
                  </td>

                  {/* Fiyat */}
                  <td className="px-6 py-4 text-neutral-900 font-semibold">
                    {Number.isFinite(r.price) ? r.price : 0}
                  </td>

                  {/* Aksiyonlar */}
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
                  <td colSpan={4} className="px-6 py-12 text-center text-sm text-neutral-500">
                    Henüz ek hizmet yok. Üstten <strong>“Yeni Ek Hizmet Ekle”</strong> ile ekleyebilirsin.
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

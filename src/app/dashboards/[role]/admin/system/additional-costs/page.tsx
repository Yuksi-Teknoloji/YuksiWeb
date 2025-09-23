// src/app/dashboards/[role]/admin/system/additional-costs/page.tsx
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
  { id: 'ac-1', carrier: 'Kurye',          service: 'Bahşiş - 10TL',           price: 10 },
  { id: 'ac-2', carrier: 'Kurye',          service: 'Hediye Paketi',           price: 100 },
  { id: 'ac-3', carrier: 'Araç',           service: 'Taşıma Yardımı',          price: 100 },
  { id: 'ac-4', carrier: 'Araç',           service: 'İndir - Bindirme Ücreti', price: 1000 },
  { id: 'ac-5', carrier: 'Taşıyıcıpaketi', service: 'Haftalık Paket',          price: 1000 },
  { id: 'ac-6', carrier: 'Araç',           service: 'Tüm Yükleme İşçiliği',    price: 2000 },
  { id: 'ac-7', carrier: 'Taşıyıcıpaketi', service: 'Aylık Paket',             price: 2500 },
];

export default function AdditionalCostsPage() {
  const [rows, setRows] = React.useState<AdditionalCost[]>(initialRows);
  const [open, setOpen] = React.useState(false);

  function handleCreate(item: Omit<AdditionalCost, 'id'>) {
    setRows(prev => [{ id: crypto.randomUUID(), ...item }, ...prev]);
    setOpen(false);
  }

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
            onClick={() => setOpen(true)}
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

      {open && (
        <AddAdditionalCostModal
          onClose={() => setOpen(false)}
          onCreate={handleCreate}
        />
      )}
    </div>
  );
}

/* ---------------- Modal: Yeni Ürün/Ek Hizmet ekle ---------------- */

function AddAdditionalCostModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (item: Omit<AdditionalCost, 'id'>) => void;
}) {
  const [carrier, setCarrier] = React.useState<string>('');
  const [service, setService] = React.useState<string>('');
  const [price, setPrice] = React.useState<string>('');

  const canSave = carrier !== '' && service.trim() !== '' && price !== '';

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSave) return;
    onCreate({
      carrier,
      service: service.trim(),
      price: Number(price) || 0,
    });
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-4xl rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h3 className="text-2xl font-semibold">Yeni Ürün ekle</h3>
          <button
            className="rounded-full p-2 hover:bg-neutral-100"
            onClick={onClose}
            aria-label="Kapat"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <form onSubmit={submit} className="space-y-4 p-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Taşıyıcı Tipi</label>
            <select
              value={carrier}
              onChange={(e) => setCarrier(e.target.value)}
              className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-neutral-800 outline-none ring-2 ring-transparent transition focus:border-neutral-300 focus:ring-sky-200"
            >
              <option value="">Seçiniz</option>
              {CARRIER_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Hizmet Adı</label>
            <input
              value={service}
              onChange={(e) => setService(e.target.value)}
              className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-neutral-800 outline-none ring-2 ring-transparent transition focus:border-neutral-300 focus:ring-sky-200"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Fiyat</label>
            <input
              type="number"
              inputMode="decimal"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-neutral-800 outline-none ring-2 ring-transparent transition focus:border-neutral-300 focus:ring-sky-200"
            />
          </div>

          {/* Footer */}
          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="submit"
              disabled={!canSave}
              className="rounded-xl bg-emerald-500 px-6 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-600 disabled:opacity-50"
            >
              Kaydet
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-rose-100 px-6 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-200"
            >
              İptal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

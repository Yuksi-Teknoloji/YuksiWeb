// src/app/dashboards/[role]/admin/system/km-prices/page.tsx
'use client';

import * as React from 'react';

type KmPackage = {
  id: string;
  carrier: string; // “10000 km satışı” gibi
  days: number;    // Talep Edilen Hizmet (gün)
  price: number;   // ₺
};

const INITIAL: KmPackage[] = [
  { id: 'kmp-1', carrier: '10000 km satışı', days: 10000, price: 1000 },
  { id: 'kmp-2', carrier: '20000 km satışı', days: 20000, price: 1800 },
];

export default function KmPricesPage() {
  const [rows, setRows] = React.useState<KmPackage[]>(INITIAL);
  const [open, setOpen] = React.useState(false);

  function onCreate(item: Omit<KmPackage, 'id'>) {
    setRows((p) => [{ id: crypto.randomUUID(), ...item }, ...p]);
    setOpen(false);
  }
  function onDelete(id: string) {
    setRows((p) => p.filter((r) => r.id !== id));
  }
  function onEdit(id: string) {
    const r = rows.find((x) => x.id === id);
    if (!r) return;
    const newCarrier = prompt('Taşıyıcı', r.carrier) ?? r.carrier;
    const newDays = Number(prompt('Talep Edilen Hizmet (gün)', String(r.days)) ?? r.days) || r.days;
    const newPrice = Number(prompt('Fiyat (₺)', String(r.price)) ?? r.price) || r.price;
    setRows((p) => p.map((x) => (x.id === id ? { ...x, carrier: newCarrier, days: newDays, price: newPrice } : x)));
  }

  return (
    <div className="space-y-6">
      <div className="px-2 sm:px-0">
        <h1 className="text-2xl font-semibold tracking-tight">Paketler</h1>
      </div>

      <section className="rounded-2xl border border-neutral-200/70 bg-white shadow-sm soft-card">
        <div className="flex items-center justify-between p-5 sm:p-6">
          <button
            onClick={() => setOpen(true)}
            className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-sky-600 active:translate-y-px"
          >
            Yeni Paket Ekle
          </button>
        </div>

        <div className="h-px w-full bg-neutral-200/70" />

        <div className="overflow-x-auto">
          <table className="min-w-full table-fixed">
            <thead>
              <tr className="text-left text-sm text-neutral-500">
                <th className="px-6 py-3 font-medium">Taşıyıcı</th>
                <th className="w-64 px-6 py-3 font-medium">Talep Edilen Hizmet</th>
                <th className="w-40 px-6 py-3 font-medium">Fiyat</th>
                <th className="w-44 px-6 py-3" />
              </tr>
            </thead>

            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-neutral-200/70 align-middle">
                  <td className="px-6 py-4">
                    <span className="font-semibold text-neutral-900">{r.carrier}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-neutral-900">{r.days}</span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-neutral-900">{r.price}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onDelete(r.id)}
                        className="rounded-md bg-red-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-600 active:translate-y-px"
                      >
                        Sil
                      </button>
                      <button
                        onClick={() => onEdit(r.id)}
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
                    Henüz paket yok. Üstten <strong>“Yeni Paket Ekle”</strong> ile ekleyebilirsin.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* alt taraftaki mor bar (ekran görüntüsü benzetimi) */}
        <div className="px-5 pb-5">
          <div className="h-2 rounded-full bg-purple-200/60">
            <div className="h-2 w-40 rounded-full bg-purple-400/60" />
          </div>
        </div>
      </section>

      {open && <AddPackageModal onClose={() => setOpen(false)} onCreate={onCreate} />}
    </div>
  );
}

/* ---------------- Modal ---------------- */

function AddPackageModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (item: Omit<KmPackage, 'id'>) => void;
}) {
  const [carrier, setCarrier] = React.useState('');
  const [days, setDays] = React.useState<number | ''>('');
  const [price, setPrice] = React.useState<number | ''>('');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!carrier || days === '' || price === '') return;
    onCreate({ carrier, days: Number(days), price: Number(price) });
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
      <div className="w-full max-w-3xl rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h3 className="text-2xl font-semibold">Yeni Ürün ekle</h3>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-neutral-100"
            aria-label="Kapat"
          >
            ✕
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4 p-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Hizmet Adı</label>
            <input
              value={carrier}
              onChange={(e) => setCarrier(e.target.value)}
              className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-2 outline-none ring-2 ring-transparent transition focus:bg-white focus:ring-sky-200"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Süre / gün</label>
            <input
              type="number"
              value={days}
              onChange={(e) => setDays(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-2 outline-none ring-2 ring-transparent transition focus:bg-white focus:ring-sky-200"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Fiyat</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-2 outline-none ring-2 ring-transparent transition focus:bg-white focus:ring-sky-200"
            />
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="submit"
              disabled={!carrier || days === '' || price === ''}
              className="rounded-xl bg-emerald-500 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-600 disabled:opacity-50"
            >
              Kaydet
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-rose-100 px-5 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-200"
            >
              İptal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

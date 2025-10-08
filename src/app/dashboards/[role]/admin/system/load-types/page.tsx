// src/app/dashboards/[role]/admin/system/load-types/page.tsx
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
  const [open, setOpen] = React.useState(false);

  function handleCreate(item: Omit<LoadType, 'id'>) {
    setRows(prev => [{ id: crypto.randomUUID(), ...item }, ...prev]);
    setOpen(false);
  }

  const handleDelete = (id: string) => {
    setRows(prev => prev.filter(r => r.id !== id));
  };

  const handleEdit = (id: string) => {
    const target = rows.find(r => r.id === id);
    if (!target) return;
    const newName = prompt('Çeşit Adı', target.name) ?? target.name;
    const newPriceStr = prompt('Ekstra Fiyat', String(target.extraPrice)) ?? String(target.extraPrice);
    const newPrice = Number(newPriceStr) || 0;
    setRows(prev => prev.map(r => (r.id === id ? { ...r, name: newName, extraPrice: newPrice } : r)));
  };

  return (
    <div className="space-y-4">
      <div className="px-2 sm:px-0">
        <h1 className="text-2xl font-semibold tracking-tight">Yük Tipleri</h1>
      </div>

      <section className="rounded-2xl border border-neutral-200/70 bg-white shadow-sm">
        <div className="flex items-center justify-between p-5 sm:p-6">
          <button
            onClick={() => setOpen(true)}
            className="btn-accent rounded-2xl bg-orange-500 text-white px-4 py-2 text-sm font-medium shadow-sm transition active:translate-y-px"
          >
            Ana Çeşit Ekle
          </button>
        </div>

        <div className="h-px w-full bg-neutral-200/70" />

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

        <div className="px-5 pb-5">
          <div className="h-2 rounded-full bg-purple-200/60">
            <div className="h-2 w-24 rounded-full bg-purple-400/60" />
          </div>
        </div>
      </section>

      {open && <AddLoadTypeModal onClose={() => setOpen(false)} onCreate={handleCreate} />}
    </div>
  );
}

/* ---------------- Modal: Yeni yük tipi ekle ---------------- */

function AddLoadTypeModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (item: Omit<LoadType, 'id'>) => void;
}) {
  const [name, setName] = React.useState('');
  const [price, setPrice] = React.useState<string>('');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const n = Number(price);
    if (!name.trim()) return;
    onCreate({ name: name.trim(), extraPrice: Number.isFinite(n) ? n : 0 });
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-4xl rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h3 className="text-2xl font-semibold">Yeni yük tipi ekle</h3>
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
            <label className="mb-1 block text-sm font-medium text-neutral-700">Yük Tipi</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-neutral-800 outline-none ring-2 ring-transparent transition focus:border-neutral-300 focus:ring-sky-200"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Ekstra Fiyat</label>
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
              className="rounded-xl bg-emerald-500 px-6 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-600 disabled:opacity-50"
              disabled={!name.trim()}
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

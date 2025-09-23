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
  const [open, setOpen] = React.useState(false);

  const handleDelete = (id: string) => {
    setRows(prev => prev.filter(r => r.id !== id));
  };

  function handleCreate(newItem: Omit<CarrierType, 'id'>) {
    setRows(prev => [{ id: crypto.randomUUID(), ...newItem }, ...prev]);
    setOpen(false);
  }

  return (
    <main className="card">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 p-6">
        <h2 className="text-lg font-semibold">Taşıyıcı Türleri</h2>
        <button
          onClick={() => setOpen(true)}
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

      {open && <AddCarrierTypeModal onClose={() => setOpen(false)} onCreate={handleCreate} />}
    </main>
  );
}

/* ---------------------- Modal Component ---------------------- */

function AddCarrierTypeModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (item: Omit<CarrierType, 'id'>) => void;
}) {
  const [name, setName] = React.useState('');
  const [openingKm, setOpeningKm] = React.useState<number | ''>('');
  const [openingPrice, setOpeningPrice] = React.useState<number | ''>('');
  const [kmPrice, setKmPrice] = React.useState<number | ''>('');
  const [file, setFile] = React.useState<File | null>(null);
  const [preview, setPreview] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || openingKm === '' || openingPrice === '' || kmPrice === '') return;

    // Demo için resmi local object url ile gösteriyoruz;
    const imageUrl = preview ?? '/images/placeholder.png';

    onCreate({
      name,
      openingKm: Number(openingKm),
      openingPrice: Number(openingPrice),
      kmPrice: Number(kmPrice),
      imageUrl,
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-3xl rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h3 className="text-xl font-semibold">Yeni Taşıyıcı Türü Ekle</h3>
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
            <label className="label">Taşıyıcı Türü</label>
            <select
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 text-neutral-800 outline-none ring-2 ring-transparent transition focus:bg-white focus:border-neutral-300 focus:ring-sky-200"
            >
              <option value="">Seçiniz</option>
              <option value="Kurye">Kurye</option>
              <option value="Minivan">Minivan</option>
              <option value="Panelvan">Panelvan</option>
              <option value="Kamyonet">Kamyonet</option>
              <option value="Kamyon">Kamyon</option>
            </select>
          </div>

          <div>
            <label className="label">Açılış Km</label>
            <input
              className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 text-neutral-800 placeholder:text-neutral-400 outline-none ring-2 ring-transparent transition focus:bg-white focus:border-neutral-300 focus:ring-sky-200"
              type="number"
              value={openingKm}
              onChange={(e) => setOpeningKm(e.target.value === '' ? '' : Number(e.target.value))}
            />
          </div>

          <div>
            <label className="label">Açılış Fiyatı</label>
            <input
              className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 text-neutral-800 placeholder:text-neutral-400 outline-none ring-2 ring-transparent transition focus:bg-white focus:border-neutral-300 focus:ring-sky-200"
              type="number"
              value={openingPrice}
              onChange={(e) => setOpeningPrice(e.target.value === '' ? '' : Number(e.target.value))}
            />
          </div>

          <div>
            <label className="label">Km Fiyat</label>
            <input
              className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 text-neutral-800 placeholder:text-neutral-400 outline-none ring-2 ring-transparent transition focus:bg-white focus:border-neutral-300 focus:ring-sky-200"
              type="number"
              value={kmPrice}
              onChange={(e) => setKmPrice(e.target.value === '' ? '' : Number(e.target.value))}
            />
          </div>

          <div>
            <label className="label">Resmi Yükle</label>
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 text-neutral-800 outline-none ring-2 ring-transparent transition focus:bg-white focus:border-neutral-300 focus:ring-sky-200 cursor-pointer"
              />
              {preview && (
                <img
                  src={preview}
                  alt="Önizleme"
                  className="h-14 w-14 rounded-lg object-cover ring-1 ring-neutral-200"
                />
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              className="rounded-xl bg-rose-100 px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-200"
              onClick={onClose}
            >
              İptal
            </button>
            <button
              type="submit"
              className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-600 disabled:opacity-50"
              disabled={!name || openingKm === '' || openingPrice === '' || kmPrice === ''}
            >
              Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

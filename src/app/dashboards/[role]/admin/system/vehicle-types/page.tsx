// src/app/dashboards/[role]/admin/system/vehicle-types/page.tsx
'use client';

import * as React from 'react';

/* ---------- Types ---------- */
type ProductRow = {
  id: string;
  name: string;
  code: string | number;
  imageUrl: string;
  mold: string; // "Ürün Kalıbı" vb.
};

/* ---------- Options & Seed ---------- */
const MOLD_OPTIONS = [
  'Ürün Kalıbı',
  'Kutu',
  'Zarf',
  'Paket',
  'Palet',
] as const;

const SEED: ProductRow[] = [
  {
    id: 'p-1',
    name: '1kg',
    code: 1,
    imageUrl: '/images/kurye.png',
    mold: 'Ürün Kalıbı',
  },
  {
    id: 'p-2',
    name: '5kg',
    code: 5,
    imageUrl: '/images/minivan.png',
    mold: 'Ürün Kalıbı',
  },
  {
    id: 'p-3',
    name: '10',
    code: 10,
    imageUrl: '/images/panelvan.png',
    mold: 'Ürün Kalıbı',
  },
];

/* ---------- Page ---------- */
export default function ProductListPage() {
  const [rows, setRows] = React.useState<ProductRow[]>(SEED);
  const [open, setOpen] = React.useState(false);

  function handleDelete(id: string) {
    setRows(prev => prev.filter(r => r.id !== id));
  }

  function handleMoldChange(id: string, value: string) {
    setRows(prev => prev.map(r => (r.id === id ? { ...r, mold: value } : r)));
  }

  function handleCreate(item: Omit<ProductRow, 'id' | 'imageUrl'> & { file?: File | null }) {
    // Demo: yükleme yapmıyoruz, sadece placeholder koyuyoruz
    const imageUrl = '/images/placeholder.png';
    setRows(prev => [
      {
        id: crypto.randomUUID(),
        imageUrl,
        ...item,
      },
      ...prev,
    ]);
    setOpen(false);
  }

  return (
    <div className="space-y-4">
      {/* Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setOpen(true)}
          className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-600 active:translate-y-px"
        >
          Yeni Ürün Ekle
        </button>
      </div>

      {/* Table card */}
      <section className="rounded-2xl border border-neutral-200/70 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full table-fixed">
            <thead>
              <tr className="text-left text-sm text-neutral-500">
                <th className="w-28 px-6 py-4 font-medium">#</th>
                <th className="px-6 py-4 font-medium">Ürün Adı</th>
                <th className="w-40 px-6 py-4 font-medium">Ürün Kodu</th>
                <th className="w-[340px] px-6 py-4 font-medium">Kalıp</th>
                <th className="w-28 px-6 py-4" />
              </tr>
            </thead>

            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-neutral-200/70 align-middle">
                  {/* Image */}
                  <td className="px-6 py-4">
                    <div className="h-24 w-24 overflow-hidden rounded-lg ring-1 ring-neutral-200">
                      <img
                        src={r.imageUrl}
                        alt={r.name}
                        className="h-full w-full object-contain bg-white"
                      />
                    </div>
                  </td>

                  {/* Name */}
                  <td className="px-6 py-4">
                    <div className="font-semibold text-neutral-900">{r.name}</div>
                  </td>

                  {/* Code */}
                  <td className="px-6 py-4 text-neutral-900">{r.code}</td>

                  {/* Mold select */}
                  <td className="px-6 py-4">
                    <select
                      value={r.mold}
                      onChange={(e) => handleMoldChange(r.id, e.target.value)}
                      className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none ring-2 ring-transparent transition focus:border-neutral-300 focus:ring-sky-200"
                    >
                      {MOLD_OPTIONS.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Delete */}
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="rounded-xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-rose-600 active:translate-y-px"
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              ))}

              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-neutral-500">
                    Henüz ürün yok. Sol üstten <strong>“Yeni Ürün Ekle”</strong> ile ekleyebilirsiniz.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {open && <AddProductModal onClose={() => setOpen(false)} onCreate={handleCreate} />}
    </div>
  );
}

/* ---------- Modal ---------- */
function AddProductModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (item: Omit<ProductRow, 'id' | 'imageUrl'> & { file?: File | null }) => void;
}) {
  const [name, setName] = React.useState('');
  const [code, setCode] = React.useState<string>('');
  const [mold, setMold] = React.useState<string>(MOLD_OPTIONS[0]);
  const [file, setFile] = React.useState<File | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !code) return;
    onCreate({ name, code, mold, file });
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-3xl rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h3 className="text-xl font-semibold">Yeni Ürün ekle</h3>
          <button className="rounded-full p-2 hover:bg-neutral-100" onClick={onClose} aria-label="Kapat">
            ✕
          </button>
        </div>

        {/* Body */}
        <form onSubmit={submit} className="space-y-4 p-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Ürün Adı</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-neutral-800 outline-none ring-2 ring-transparent transition focus:border-neutral-300 focus:ring-sky-200"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Ürün Kodu</label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-neutral-800 outline-none ring-2 ring-transparent transition focus:border-neutral-300 focus:ring-sky-200"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Ürün Kalıbı</label>
            <select
              value={mold}
              onChange={(e) => setMold(e.target.value)}
              className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none ring-2 ring-transparent transition focus:border-neutral-300 focus:ring-sky-200"
            >
              {MOLD_OPTIONS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Örnek Ürün Resmi Yükle</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="block w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none ring-2 ring-transparent transition file:mr-3 file:rounded-lg file:border-0 file:bg-neutral-100 file:px-3 file:py-2 hover:file:bg-neutral-200 focus:border-neutral-300 focus:ring-sky-200"
            />
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
              disabled={!name || !code}
            >
              Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

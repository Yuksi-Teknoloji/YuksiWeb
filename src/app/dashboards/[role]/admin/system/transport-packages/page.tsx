'use client';

import * as React from 'react';

// --- Tipler ---
type TransportPackage = {
  id: string;
  carrier: string;     // Paket/Hizmet Adı
  days: number;        // Gün
  price: number;       // ₺
};

type PaymentRow = {
  id: string;
  date: string;
  carrier: string;
  days: number;
  price: number;
  status: 'success' | 'failed' | 'pending';
};

// --- Başlangıç verisi ---
const initialPackages: TransportPackage[] = [
  { id: 'tp-1', carrier: 'Aylık paket', days: 30, price: 5300 },
];

const initialPayments: PaymentRow[] = [
  {
    id: 'pm-1',
    date: '20.09.2025 20:09',
    carrier: 'emre kuzey\n5319677149\n06ank06',
    days: 30,
    price: 5300,
    status: 'failed',
  },
];

export default function TransportPackagesPage() {
  const [rows, setRows] = React.useState<TransportPackage[]>(initialPackages);
  const [payments] = React.useState<PaymentRow[]>(initialPayments);
  const [open, setOpen] = React.useState(false);

  // Modal kaydet
  function handleCreate(item: Omit<TransportPackage, 'id'>) {
    setRows(prev => [{ id: crypto.randomUUID(), ...item }, ...prev]);
    setOpen(false);
  }

  const handleDelete = (id: string) => {
    setRows(prev => prev.filter(r => r.id !== id));
  };

  const handleEdit = (id: string) => {
    const r = rows.find(x => x.id === id);
    if (!r) return;

    const newCarrier = prompt('Paket / Hizmet Adı', r.carrier) ?? r.carrier;
    const newDaysStr = prompt('Süre (gün)', String(r.days)) ?? String(r.days);
    const newPriceStr = prompt('Fiyat (₺)', String(r.price)) ?? String(r.price);

    const newDays = Math.max(0, Number(newDaysStr) || 0);
    const newPrice = Math.max(0, Number(newPriceStr) || 0);

    setRows(prev =>
      prev.map(x =>
        x.id === id ? { ...x, carrier: newCarrier, days: newDays, price: newPrice } : x,
      ),
    );
  };

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="px-2 sm:px-0">
        <h1 className="text-2xl font-semibold tracking-tight">Ürünler</h1>
      </div>

      {/* KART 1: Taşıyıcı Paketleri */}
      <section className="rounded-2xl border border-neutral-200/70 bg-white shadow-sm">
        {/* Üst şerit */}
        <div className="flex items-center justify-between p-5 sm:p-6">
          <button
            onClick={() => setOpen(true)}
            className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-sky-600 active:translate-y-px"
          >
            Yeni Paket Ekle
          </button>
        </div>

        <div className="h-px w-full bg-neutral-200/70" />

        {/* Tablo */}
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
              {rows.map(r => (
                <tr key={r.id} className="border-t border-neutral-200/70 align-middle">
                  <td className="px-6 py-4">
                    <span className="font-semibold text-neutral-900">{r.carrier}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-neutral-900">{r.days}</span>
                  </td>
                  <td className="px-6 py-4 text-neutral-900 font-semibold">{r.price}</td>
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
                    Henüz paket yok. Üstten <strong>“Yeni Paket Ekle”</strong> ile ekleyebilirsin.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Altta mor progress görseli */}
        <div className="px-5 pb-5">
          <div className="h-2 rounded-full bg-purple-200/60">
            <div className="h-2 w-40 rounded-full bg-purple-400/60" />
          </div>
        </div>
      </section>

      {/* KART 2: Ödemeler (değiştirilmedi) */}
      <section className="rounded-2xl border border-neutral-200/70 bg-white shadow-sm">
        <header className="p-5 sm:p-6">
          <h2 className="text-2xl font-semibold tracking-tight">Ödemeler</h2>
        </header>

        <div className="h-px w-full bg-neutral-200/70" />

        <div className="overflow-x-auto">
          <table className="min-w-full table-fixed">
            <thead>
              <tr className="text-left text-sm text-neutral-500">
                <th className="w-56 px-6 py-3 font-medium">Tarih</th>
                <th className="px-6 py-3 font-medium">Taşıyıcı</th>
                <th className="w-40 px-6 py-3 font-medium">Talep Edilen Gün</th>
                <th className="w-40 px-6 py-3 font-medium">Fiyat</th>
                <th className="w-44 px-6 py-3" />
              </tr>
            </thead>
            <tbody>
              {initialPayments.map(p => (
                <tr key={p.id} className="border-t border-neutral-200/70 align-top">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-neutral-900">{p.date}</td>
                  <td className="px-6 py-4 whitespace-pre-line text-neutral-900">{p.carrier}</td>
                  <td className="px-6 py-4 text-neutral-900">{p.days} gün</td>
                  <td className="px-6 py-4 font-semibold text-neutral-900">{p.price} ₺</td>
                  <td className="px-6 py-4">
                    {p.status === 'failed' ? (
                      <span className="inline-flex items-center rounded-md bg-red-500 px-3 py-2 text-sm font-semibold text-white shadow-sm">
                        Başarısız Ödeme
                      </span>
                    ) : p.status === 'pending' ? (
                      <span className="inline-flex items-center rounded-md bg-amber-500 px-3 py-2 text-sm font-semibold text-white shadow-sm">
                        Beklemede
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-md bg-emerald-500 px-3 py-2 text-sm font-semibold text-white shadow-sm">
                        Başarılı
                      </span>
                    )}
                  </td>
                </tr>
              ))}

              {initialPayments.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-neutral-500">
                    Henüz ödeme kaydı yok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {open && (
        <AddPackageModal
          onClose={() => setOpen(false)}
          onCreate={handleCreate}
        />
      )}
    </div>
  );
}

/* ---------------- Modal: Yeni Paket Ekle ---------------- */

function AddPackageModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (item: Omit<TransportPackage, 'id'>) => void;
}) {
  const [title, setTitle] = React.useState('');
  const [days, setDays] = React.useState<string>('');    // input raw
  const [price, setPrice] = React.useState<string>('');  // input raw

  const canSave = title.trim() !== '' && days !== '' && price !== '';

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSave) return;
    onCreate({
      carrier: title.trim(),
      days: Math.max(0, Number(days) || 0),
      price: Math.max(0, Number(price) || 0),
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
            <label className="mb-1 block text-sm font-medium text-neutral-700">Hizmet Adı</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-neutral-800 outline-none ring-2 ring-transparent transition focus:border-neutral-300 focus:ring-sky-200"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Süre / gün</label>
            <input
              type="number"
              inputMode="numeric"
              value={days}
              onChange={(e) => setDays(e.target.value)}
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

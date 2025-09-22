'use client';

import * as React from 'react';

// --- Tipler ---
type TransportPackage = {
  id: string;
  carrier: string;     // Taşıyıcı
  days: number;        // Talep Edilen Hizmet (gün)
  price: number;       // Fiyat (₺)
};

type PaymentRow = {
  id: string;
  date: string;        // ISO ya da gösterilecek string
  carrier: string;     // Taşıyıcı adı
  days: number;        // Talep Edilen Gün
  price: number;       // ₺
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
    carrier: 'ebubekir deregözü\n5469060844\n01fbu76',
    days: 30,
    price: 5300,
    status: 'failed',
  },
];

export default function TransportPackagesPage() {
  const [rows, setRows] = React.useState<TransportPackage[]>(initialPackages);
  const [payments, setPayments] = React.useState<PaymentRow[]>(initialPayments);

  // --- Handlers: Paketler ---
  const handleAdd = () => {
    const n = rows.length + 1;
    setRows(prev => [
      ...prev,
      { id: crypto.randomUUID(), carrier: `Yeni Paket ${n}`, days: 30, price: 0 },
    ]);
  };

  const handleDelete = (id: string) => {
    setRows(prev => prev.filter(r => r.id !== id));
  };

  const handleEdit = (id: string) => {
    const r = rows.find(x => x.id === id);
    if (!r) return;

    const newCarrier = prompt('Taşıyıcı / Paket Adı', r.carrier) ?? r.carrier;
    const newDaysStr = prompt('Talep Edilen Hizmet (gün)', String(r.days)) ?? String(r.days);
    const newPriceStr = prompt('Fiyat (₺)', String(r.price)) ?? String(r.price);

    const newDays = Math.max(0, Number(newDaysStr) || 0);
    const newPrice = Math.max(0, Number(newPriceStr) || 0);

    setRows(prev => prev.map(x => (x.id === id ? { ...x, carrier: newCarrier, days: newDays, price: newPrice } : x)));
  };

  // --- Handlers: Ödemeler ---
  const markFailed = (id: string) => {
    setPayments(prev => prev.map(p => (p.id === id ? { ...p, status: 'failed' } : p)));
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
            onClick={handleAdd}
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

        {/* Altta mor progress görseli (screenshot benzeri) */}
        <div className="px-5 pb-5">
          <div className="h-2 rounded-full bg-purple-200/60">
            <div className="h-2 w-40 rounded-full bg-purple-400/60" />
          </div>
        </div>
      </section>

      {/* KART 2: Ödemeler */}
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
              {payments.map(p => (
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

              {payments.length === 0 && (
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
    </div>
  );
}

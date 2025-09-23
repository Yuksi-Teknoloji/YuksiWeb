// src/app/dashboards/[role]/admin/dealers/dealer-list/page.tsx
'use client';

import * as React from 'react';

type Dealer = {
  id: string;
  name: string;
  category: string;   // ör: "reseller"
  phone: string;
  email: string;
  avatarUrl?: string;
};

const SEED: Dealer[] = [
  {
    id: 'd1',
    name: 'rıdvan çalış',
    category: 'reseller',
    phone: '05365042516',
    email: 'kalpronizma26@gmail.com',
    avatarUrl: '/images/minivan.png',
  },
  {
    id: 'd2',
    name: 'yyy',
    category: 'reseller',
    phone: '5552804836',
    email: 'info@istanbulsoftware.com1',
    avatarUrl: '/images/panelvan.png',
  },
  {
    id: 'd3',
    name: 'Demo Bayi',
    category: 'distributor',
    phone: '5322036117',
    email: 'demo@bayi.com',
    avatarUrl: '/images/kurye.png',
  },
];

export default function DealerListPage() {
  const [query, setQuery] = React.useState('');
  const [rows, setRows] = React.useState<Dealer[]>(SEED);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      [r.name, r.email, r.phone, r.category]
        .filter(Boolean)
        .some((v) => v.toLowerCase().includes(q)),
    );
  }, [rows, query]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Bayi Listesi</h1>

      {/* Arama & filtre kutusu */}
      <section className="rounded-2xl border border-neutral-200/70 bg-white shadow-sm soft-card">
        <div className="p-6">
          <h2 className="mb-3 text-lg font-semibold">Kullanıcı İşlemleri</h2>

          <div className="space-y-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Arama yap"
              className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 text-neutral-800 outline-none ring-2 ring-transparent transition placeholder:text-neutral-400 focus:bg-white focus:ring-sky-200"
            />
            <p className="text-sm text-neutral-500">
              Ad, email, telefon no ile arama yapabilirsiniz
            </p>
          </div>
        </div>

        {/* Tablo */}
        <div className="overflow-x-auto">
          <table className="min-w-full border-t border-neutral-200/70">
            <thead>
              <tr className="text-left text-sm text-neutral-500">
                <th className="px-6 py-3 font-medium">Resim</th>
                <th className="px-6 py-3 font-medium">Kategori Adı</th>
                <th className="px-6 py-3 font-medium">Telefon</th>
                <th className="px-6 py-3 font-medium">E-posta</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr
                  key={r.id}
                  className="border-t border-neutral-200/70 hover:bg-neutral-50"
                >
                  <td className="px-6 py-4">
                    <div className="h-12 w-12 overflow-hidden rounded-lg ring-1 ring-neutral-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={r.avatarUrl || 'https://via.placeholder.com/96x64.png?text=Bayi'}
                        alt={r.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="font-semibold text-neutral-900">{r.name}</div>
                    <div className="text-sm text-neutral-500">{r.category}</div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="text-neutral-900">{r.phone}</div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="text-neutral-900">{r.email}</div>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center text-sm text-neutral-500"
                  >
                    Sonuç bulunamadı.
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

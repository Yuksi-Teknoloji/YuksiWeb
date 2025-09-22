'use client';

import * as React from 'react';
import Link from 'next/link';

type UserRow = {
  id: string;
  name: string;
  phone: string;
  createdAt: string;
  docStatus: 'Evrak Bekleniyor' | 'Onaylandı' | 'Reddedildi';
  city?: string;
  status?: string;
};

const initialRows: UserRow[] = [
  {
    id: 'u-1',
    name: 'Hüsnü özel',
    phone: '5322036117',
    createdAt: '18.09.2025 19:09',
    docStatus: 'Evrak Bekleniyor',
    city: '',
    status: '',
  },
  {
    id: 'u-2',
    name: 'Hakan BOSTANCI',
    phone: '5448686358',
    createdAt: '18.09.2025 17:09',
    docStatus: 'Evrak Bekleniyor',
    city: '',
    status: '',
  },
];

export default function UserListPage() {
  const [rows] = React.useState<UserRow[]>(initialRows);
  const [q, setQ] = React.useState('');

  const filtered = rows.filter(
    r =>
      r.name.toLowerCase().includes(q.toLowerCase()) ||
      r.phone.includes(q)
  );

  return (
    <div className="space-y-4">
      {/* Başlık */}
      <div className="px-2 sm:px-0">
        <h1 className="text-2xl font-semibold tracking-tight">Kullanıcı Listesi</h1>
      </div>

      {/* Kart */}
      <section className="rounded-2xl border border-neutral-200/70 bg-white shadow-sm">
        {/* Üst bar: Yeni butonu sağda yeşil */}
        <div className="flex items-center justify-end p-5 sm:p-6">
          <Link
            href="./user-list/edit-profile"
            className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600 active:translate-y-px"
          >
            Yeni Kullanıcı Oluştur
          </Link>
        </div>

        <div className="h-px w-full bg-neutral-200/70" />

        {/* Kullanıcı işlemleri + arama */}
        <div className="p-5 sm:p-6">
          <h2 className="mb-2 text-lg font-semibold">Kullanıcı İşlemleri</h2>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Arama yap"
            className="mb-1 w-full rounded-xl border border-neutral-300 px-3 py-2 outline-none ring-2 ring-transparent transition focus:border-neutral-300 focus:ring-sky-200"
          />
          <p className="text-xs text-neutral-500">Ad, Soyad, Plaka, Telefon no</p>
        </div>

        {/* Tablo */}
        <div className="h-px w-full bg-neutral-200/70" />

        <div className="overflow-x-auto">
          <table className="min-w-full table-fixed">
            <thead>
              <tr className="text-left text-sm text-neutral-500">
                <th className="px-6 py-3 font-medium">Ad ve Soyad</th>
                <th className="w-56 px-6 py-3 font-medium">Kayıt Tarihi</th>
                <th className="w-56 px-6 py-3 font-medium">Evraklar / TCK</th>
                <th className="w-40 px-6 py-3 font-medium">Şehir Bilgisi</th>
                <th className="w-40 px-6 py-3 font-medium">Durum</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-t border-neutral-200/70 align-top">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-neutral-900">{r.name}</div>
                    <div className="text-sm text-neutral-500">{r.phone}</div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-neutral-900">{r.createdAt}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700">
                      {r.docStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-neutral-700">{r.city || '\u00A0'}</td>
                  <td className="px-6 py-4 text-neutral-700">{r.status || '\u00A0'}</td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-neutral-500">
                    Eşleşen kullanıcı bulunamadı.
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

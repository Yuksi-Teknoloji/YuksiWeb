'use client';

import * as React from 'react';
import Link from 'next/link';

type Person = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  plate?: string;
  createdAt: string;      // "DD.MM.YYYY HH:mm"
  docStatus: string;      // Evrak/TCK statüsü
  city?: string;
  district?: string;
};

const SEED: Person[] = [
  {
    id: 'p1',
    name: 'muzaffersencompany',
    email: 'info@istanbulsoftware.com',
    plate: '34yy5555',
    createdAt: '05.08.2025 20:08',
    docStatus: 'Evrak Bekleniyor',
    city: 'İstanbul',
    district: 'Kadıköy',
  },
  {
    id: 'p2',
    name: 'tttt',
    email: 'tttt',
    phone: 'tttt',
    createdAt: '23.07.2025 20:07',
    docStatus: 'Evrak Bekleniyor',
    city: 'Ankara',
    district: 'Çankaya',
  },
];

export default function AuthorizedPersonPage({ params }: { params: { role: string } }) {
  const role = params.role;
  const [q, setQ] = React.useState('');

  const data = React.useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return SEED;
    return SEED.filter((r) =>
      [
        r.name,
        r.email,
        r.phone,
        r.plate,
        r.city,
        r.district,
        r.createdAt,
        r.docStatus,
      ]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(t))
    );
  }, [q]);

  function handleEdit(id: string) {
    // burada /edit route’una yönlendirebilirsin
    alert(`Düzenle: ${id}`);
  }
  function handleDelete(id: string) {
    if (confirm('Bu yetkiliyi silmek istiyor musun?')) {
      alert(`Silindi (demo): ${id}`);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 soft-card">
      <h1 className="mb-4 text-3xl font-semibold">Kullanıcı Listesi</h1>

      <section className="rounded-2xl border border-neutral-200/70 bg-white shadow-sm">
        {/* üst çubuk */}
        <div className="flex items-center justify-end p-5 sm:p-6">
          <Link
            href="../user-list/edit-profile"
            className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600 active:translate-y-px"
          >
            Yeni Kullanıcı Oluştur
          </Link>
        </div>

        {/* arama */}
        <div className="px-5 pb-4 pt-5 soft-card">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Arama yap"
            className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 outline-none ring-2 ring-transparent transition focus:bg-white focus:ring-sky-200"
          />
          <p className="mt-1 text-xs text-neutral-500">Ad, Soyad, Plaka, Telefon no</p>
        </div>

        {/* başlık satırı */}
        <div className="hidden border-t border-neutral-200/70 px-5 py-2 text-sm font-semibold text-neutral-700 md:grid md:grid-cols-[2fr_1.1fr_1.2fr_1.2fr_130px]">
          <div>Ad ve Soyad</div>
          <div>Kayıt Tarihi</div>
          <div>Evraklar / TCK</div>
          <div>Şehir Bilgisi</div>
          <div className="text-right">Durum</div>
        </div>

        {/* liste */}
        <ul className="divide-y divide-neutral-200">
          {data.map((r) => (
            <li
              key={r.id}
              className="grid gap-3 px-5 py-4 md:grid-cols-[2fr_1.1fr_1.2fr_1.2fr_130px]"
            >
              {/* Ad soyad + alt bilgiler */}
              <div>
                <div className="font-medium text-neutral-900">{r.name}</div>
                <div className="mt-1 space-y-0.5 text-sm text-neutral-600">
                  {r.email && <div>{r.email}</div>}
                  {r.phone && <div>{r.phone}</div>}
                  {r.plate && <div>{r.plate}</div>}
                </div>
              </div>

              {/* kayıt tarihi */}
              <div className="self-center text-neutral-900">{r.createdAt}</div>

              {/* evrak durumu */}
              <div className="self-center">
                <div className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-700">
                  {r.docStatus}
                </div>
              </div>

              {/* şehir bilgisi */}
              <div className="self-center text-neutral-800">
                {[r.city, r.district].filter(Boolean).join(' / ') || '—'}
              </div>

              {/* aksiyonlar */}
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => handleEdit(r.id)}
                  className="rounded-lg bg-green-500 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-green-600"
                >
                  Düzenle
                </button>
                <button
                  onClick={() => handleDelete(r.id)}
                  className="rounded-lg bg-red-500 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-600"
                >
                  Sil
                </button>
              </div>

              {/* küçük ekranlarda aksiyon butonlarını alta da göster */}
              <div className="md:hidden col-span-full -mt-2 flex justify-end gap-2">
                <button
                  onClick={() => handleEdit(r.id)}
                  className="rounded-lg bg-green-500 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-green-600"
                >
                  Düzenle
                </button>
                <button
                  onClick={() => handleDelete(r.id)}
                  className="rounded-lg bg-red-500 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-600"
                >
                  Sil
                </button>
              </div>
            </li>
          ))}

          {data.length === 0 && (
            <li className="px-5 py-12 text-center text-sm text-neutral-500">
              Kayıt bulunamadı.
            </li>
          )}
        </ul>
      </section>
    </div>
  );
}

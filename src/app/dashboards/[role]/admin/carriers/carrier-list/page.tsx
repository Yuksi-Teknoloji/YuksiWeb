// src/app/dashboards/[role]/admin/carriers/carrier-list/page.tsx
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

type CarrierRow = {
  id: string;
  name: string;
  tc?: string;
  plate?: string;
  createdAt: string;     // ISO ya da görüntülenecek string
  docsStatus: DocsStatus;
  city?: string;
  active: boolean;
};

type DocsStatus =
  | ''                    // seçilmemiş
  | 'Evrak Bekleniyor'
  | 'İnceleme Bekliyor'
  | 'Onaylandı'
  | 'Eksik Belge'
  | 'Reddedildi';

const SEED: CarrierRow[] = [
  {
    id: 'c1',
    name: 'emre kuzey',
    tc: '1111111111',
    plate: '35AAA445',
    createdAt: '22.09.2025 09:09',
    docsStatus: 'Evrak Bekleniyor',
    city: '',
    active: true,
  },
  {
    id: 'c2',
    name: 'Yusuf Çimen',
    tc: '22222222',
    plate: '31CNP972',
    createdAt: '21.09.2025 22:09',
    docsStatus: 'Evrak Bekleniyor',
    city: '',
    active: false,
  },
];

export default function CarrierListPage() {
  const [query, setQuery] = React.useState('');
  const [rows, setRows] = React.useState<CarrierRow[]>(SEED);

  const { role } = useParams<{ role: string }>();
  const createHref = `/dashboards/${role}/admin/dealers/create-dealer`;

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      [r.name, r.tc ?? '', r.plate ?? '', r.city ?? '']
        .some((v) => v.toLowerCase().includes(q)),
    );
  }, [rows, query]);

  function toggleActive(id: string) {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, active: !r.active } : r)),
    );
  }

  function onEdit(id: string) {
    // burada route push koyabilirsin
    alert(`Düzenle: ${id}`);
  }
  function onDelete(id: string) {
    if (confirm('Bu kullanıcıyı silmek istediğine emin misin?')) {
      setRows((prev) => prev.filter((r) => r.id !== id));
    }
  }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Kullanıcı Listesi</h1>

        {/* Yönlendirme: /dashboards/[role]/admin/dealers/create-dealer */}
        <Link
          href={createHref}
          className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-600 active:translate-y-px"
        >
          Yeni Kullanıcı Oluştur
        </Link>
      </div>

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
              Ad, Soyad, Plaka, Telefon no
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-t border-neutral-200/70">
            <thead>
              <tr className="text-left text-sm text-neutral-500">
                <th className="px-6 py-3 font-medium">Ad ve Soyad</th>
                <th className="px-6 py-3 font-medium">Kayıt Tarihi</th>
                <th className="px-6 py-3 font-medium">Evraklar / TCK</th>
                <th className="px-6 py-3 font-medium">Şehir Bilgisi</th>
                <th className="px-6 py-3 font-medium">Durum</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((r) => (
                <tr
                  key={r.id}
                  className="border-t border-neutral-200/70 align-top hover:bg-neutral-50"
                >
                  {/* Ad & alt bilgiler */}
                  <td className="px-6 py-4">
                    <div className="font-semibold text-neutral-900">{r.name}</div>
                    <div className="mt-1 text-sm text-neutral-500">
                      {r.tc || '-'}
                      <br />
                      {r.plate || '-'}
                    </div>
                  </td>

                  {/* Kayıt Tarihi */}
                  <td className="px-6 py-4">
                    <div className="font-semibold text-neutral-900">{r.createdAt}</div>
                  </td>

                  {/* Evrak / TCK select */}
                  <td className="px-6 py-4">
                    <select
                      value={r.docsStatus}
                      onChange={(e) =>
                        setRows((prev) =>
                          prev.map((x) =>
                            x.id === r.id ? { ...x, docsStatus: e.target.value as DocsStatus } : x
                          )
                        )
                      }
                      className="w-[280px] rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 text-sm text-neutral-800 outline-none ring-2 ring-transparent transition focus:bg-white focus:ring-sky-200"
                    >
                      <option value="">Evrak / TCK</option>
                      <option value="Evrak Bekleniyor">Evrak Bekleniyor</option>
                      <option value="İnceleme Bekliyor">İnceleme Bekliyor</option>
                      <option value="Onaylandı">Onaylandı</option>
                      <option value="Eksik Belge">Eksik Belge</option>
                      <option value="Reddedildi">Reddedildi</option>
                    </select>
                  </td>

                  {/* Şehir */}
                  <td className="px-6 py-4">
                    <div className="text-neutral-900">{r.city || '-'}</div>
                  </td>

                  {/* Aktif/Pasif toggle */}
                  <td className="px-6 py-4">
                    <Toggle
                      checked={r.active}
                      onChange={() => toggleActive(r.id)}
                    />
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onEdit(r.id)}
                        className="rounded-lg bg-emerald-500 px-3 py-1.5 text-sm font-semibold text-white shadow hover:bg-emerald-600"
                      >
                        Düzenle
                      </button>
                      <button
                        onClick={() => onDelete(r.id)}
                        className="rounded-lg bg-rose-500 px-3 py-1.5 text-sm font-semibold text-white shadow hover:bg-rose-600"
                      >
                        Sil
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-sm text-neutral-500"
                  >
                    Kayıt bulunamadı.
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

/* Basit Toggle */
function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
      className={`relative inline-flex h-9 w-16 items-center rounded-full transition ${
        checked ? 'bg-indigo-500' : 'bg-neutral-300'
      }`}
    >
      <span
        className={`absolute left-1 top-1 h-7 w-7 rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-7' : ''
        }`}
      />
    </button>
  );
}

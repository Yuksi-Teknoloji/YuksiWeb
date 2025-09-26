'use client';

import * as React from 'react';
import Link from 'next/link';
import Modal from '@/components/UI/Modal';

// API modelinle eşleşen mock tip (örnek)
type ApiUser = {
  id: string;
  firstName: string;
  lastName: string;
  userType: string;  // "Admin" | "Restoran" | ...
  status: string;    // "Aktif" | "Pasif" | "Belge Bekliyor" | ...
};

type UserRow = {
  id: string;
  name: string;
  phone: string;
  createdAt: string;
  docStatus: 'Evrak Bekleniyor' | 'Onaylandı' | 'Reddedildi';
  city?: string;
  status?: string;
};

// --- seed örneği (API gelene kadar) ---
const MOCK_USERS: ApiUser[] = [
  { id: "u-1001", firstName: "Rıdvan", lastName: "Çalış",    userType: "Admin",    status: "Aktif" },
  { id: "u-1002", firstName: "Ayşe",   lastName: "Kaya",     userType: "Restoran", status: "Belge Bekliyor" },
];

const initialRows: UserRow[] = [
  {
    id: 'u-1001',
    name: 'Rıdvan Çalış',
    phone: '5322036117',
    createdAt: '18.09.2025 19:09',
    docStatus: 'Onaylandı',
    city: 'İstanbul',
    status: 'Aktif',
  },
  {
    id: 'u-1002',
    name: 'Ayşe Kaya',
    phone: '5448686358',
    createdAt: '18.09.2025 17:09',
    docStatus: 'Evrak Bekleniyor',
    city: 'Ankara',
    status: 'Belge Bekliyor',
  },
];

export default function UserListPage() {
  const [rows, setRows] = React.useState<UserRow[]>(initialRows);
  const [q, setQ] = React.useState('');

  // Modal state
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [detailUser, setDetailUser] = React.useState<ApiUser | null>(null);
  const openDetails = (userId: string) => {
    // API ile:
    // fetch(`/users/get-user/${userId}`)
    //   .then(r => r.json())
    //   .then(setDetailUser)
    //   .finally(() => setDetailOpen(true));

    // şimdilik seed’ten:
    const found = MOCK_USERS.find(u => u.id === userId) ?? null;
    setDetailUser(found);
    setDetailOpen(true);
  };

  const filtered = rows.filter(
    r =>
      r.name.toLowerCase().includes(q.toLowerCase()) ||
      r.phone.includes(q)
  );

  // Status değiştir (Askıya al / Aktif et)
  const toggleStatus = async (userId: string) => {
    // API:
    // await fetch(`/users/change-status/${userId}`, { method: 'PATCH' });
    setRows(prev =>
      prev.map(r =>
        r.id === userId
          ? { ...r, status: r.status === 'Aktif' ? 'Pasif' : 'Aktif' }
          : r
      )
    );
  };

  // Sil
  const removeUser = async (userId: string) => {
    // API:
    // await fetch(`/users/delete-user/${userId}`, { method: 'DELETE' });
    setRows(prev => prev.filter(r => r.id !== userId));
  };

  return (
    <div className="space-y-4">
      {/* Başlık */}
      <div className="px-2 sm:px-0">
        <h1 className="text-2xl font-semibold tracking-tight">Kullanıcı Listesi</h1>
      </div>

      {/* Kart */}
      <section className="rounded-2xl border border-neutral-200/70 bg-white shadow-sm">
        {/* Üst bar */}
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
            className="mb-1 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 outline-none ring-2 ring-transparent transition focus:border-neutral-300 focus:ring-sky-200"
          />
          <p className="text-xs text-neutral-500">Ad, Soyad, Telefon</p>
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
                <th className="w-40 px-6 py-3 font-medium">Şehir</th>
                <th className="w-40 px-6 py-3 font-medium">Durum</th>
                <th className="w-[320px] px-6 py-3 font-medium">İşlemler</th>
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

                  {/* İşlemler */}
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => openDetails(r.id)}
                        className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm hover:bg-neutral-50"
                        title="Detay görüntüle"
                      >
                        Detay
                      </button>

                      <button
                        onClick={() => toggleStatus(r.id)}
                        className={[
                          "rounded-lg px-3 py-1.5 text-sm font-semibold text-white",
                          (r.status ?? 'Aktif') === "Aktif"
                            ? "bg-emerald-500 hover:bg-emerald-600"
                            : "bg-orange-500 hover:bg-orange-600",
                        ].join(" ")}
                        title="Askıya Al / Aktif Et"
                      >
                        {(r.status ?? 'Aktif') === "Aktif" ? "Askıya Al" : "Aktif Et"}
                      </button>

                      <button
                        onClick={() => removeUser(r.id)}
                        className="rounded-lg bg-rose-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-rose-600"
                        title="Hesabı Sil"
                      >
                        Sil
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-neutral-500">
                    Eşleşen kullanıcı bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ---- DETAY MODAL ---- */}
      <Modal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title="Kullanıcı Detayı"
        actions={
          <>
            <button
              onClick={() => setDetailOpen(false)}
              className="rounded-lg px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
            >
              Kapat
            </button>
            {detailUser && (
              <Link
                href={`./user-list/edit-profile?id=${detailUser.id}`}
                className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
              >
                Profili Düzenle
              </Link>
            )}
          </>
        }
      >
        {!detailUser ? (
          <div className="text-sm text-neutral-600">Yükleniyor…</div>
        ) : (
          <div className="grid gap-3 text-sm">
            <div className="grid grid-cols-[140px_1fr] gap-2">
              <div className="text-neutral-500">Kullanıcı ID</div>
              <div className="font-medium">{detailUser.id}</div>

              <div className="text-neutral-500">Ad Soyad</div>
              <div className="font-medium">
                {detailUser.firstName} {detailUser.lastName}
              </div>

              <div className="text-neutral-500">Tip</div>
              <div className="font-medium">{detailUser.userType}</div>

              <div className="text-neutral-500">Durum</div>
              <div className="font-medium">{detailUser.status}</div>
            </div>

            {/* burada daha fazla alan gösterebilirsin (mail, tel, belge durumu vb.) */}
          </div>
        )}
      </Modal>
    </div>
  );
}

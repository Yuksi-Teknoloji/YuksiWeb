// src/app/dashboards/[role]/admin/user-list/page.tsx
'use client';

import * as React from 'react';
import Link from 'next/link';
import Modal from '@/components/UI/Modal';
import { API_BASE } from '@/configs/api'; 

type ApiUser = {
  userId: number | string;
  firstName: string;
  lastName: string;
  userType: string;
  status: string;
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

const USERS_ENDPOINT = `${API_BASE}/api/Users/get-all-users`;

export default function UserListPage() {
  const [rows, setRows] = React.useState<UserRow[]>([]);
  const [q, setQ] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // detay için ham kullanıcılar (id -> ApiUser)
  const [apiUsers, setApiUsers] = React.useState<Record<string, ApiUser>>({});
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [detailUser, setDetailUser] = React.useState<ApiUser | null>(null);

  const fetchUsers = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(USERS_ENDPOINT, { cache: 'no-store' });
      const text = await res.text();
      const data = text ? JSON.parse(text) : null;
      if (!res.ok) {
        throw new Error(data?.title || data?.message || `HTTP ${res.status}`);
      }
      const list: any[] = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];

      const dict: Record<string, ApiUser> = {};
      const mapped: UserRow[] = list.map((u) => {
        const id = String(u?.userId ?? crypto.randomUUID());
        dict[id] = {
          userId: id,
          firstName: u?.firstName ?? '',
          lastName: u?.lastName ?? '',
          userType: u?.userType ?? '',
          status: u?.status ?? '',
        };
        return {
          id,
          name: [u?.firstName, u?.lastName].filter(Boolean).join(' ').trim() || '-',
          phone: '-',                   // API vermediği için placeholder
          createdAt: '-',               // API vermediği için placeholder
          docStatus: 'Evrak Bekleniyor',// istenen kolon kalsın
          city: '-',                    // istenen kolon kalsın
          status: u?.status ?? '-',
        };
      });

      setApiUsers(dict);
      setRows(mapped);
    } catch (e: any) {
      setError(e?.message || 'Kullanıcı listesi alınamadı.');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filtered = React.useMemo(
    () =>
      rows.filter(
        (r) =>
          r.name.toLowerCase().includes(q.toLowerCase()) ||
          r.phone.includes(q)
      ),
    [rows, q]
  );

  const openDetails = (userId: string) => {
    setDetailUser(apiUsers[userId] ?? null);
    setDetailOpen(true);
  };

  const toggleStatus = (userId: string) => {
    setRows((prev) =>
      prev.map((r) =>
        r.id === userId ? { ...r, status: r.status === 'Aktif' ? 'Pasif' : 'Aktif' } : r
      )
    );
  };

  const removeUser = (userId: string) => {
    setRows((prev) => prev.filter((r) => r.id !== userId));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2 sm:px-0">
        <h1 className="text-2xl font-semibold tracking-tight">Kullanıcı Listesi</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchUsers}
            className="rounded-xl bg-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-300"
          >
            Yenile
          </button>
          <Link
            href="./user-list/edit-profile"
            className="btn-accent rounded-2xl bg-orange-500 text-white px-4 py-2 text-sm font-medium shadow-sm transition active:translate-y-px"
          >
            Yeni Kullanıcı Oluştur
          </Link>
        </div>
      </div>

      <section className="rounded-2xl border border-neutral-200/70 bg-white shadow-sm">
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
              {loading && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-neutral-500">
                    Yükleniyor…
                  </td>
                </tr>
              )}

              {!loading && error && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-rose-600">
                    {error}
                  </td>
                </tr>
              )}

              {!loading &&
                !error &&
                filtered.map((r) => (
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
                            'rounded-lg px-3 py-1.5 text-sm font-semibold text-white',
                            (r.status ?? 'Aktif') === 'Aktif'
                              ? 'bg-emerald-500 hover:bg-emerald-600'
                              : 'bg-orange-500 hover:bg-orange-600',
                          ].join(' ')}
                          title="Askıya Al / Aktif Et"
                        >
                          {(r.status ?? 'Aktif') === 'Aktif' ? 'Askıya Al' : 'Aktif Et'}
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

              {!loading && !error && filtered.length === 0 && (
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
                href={`./user-list/edit-profile?id=${detailUser.userId}`}
                className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
              >
                Profili Düzenle
              </Link>
            )}
          </>
        }
      >
        {!detailUser ? (
          <div className="text-sm text-neutral-600">Detay bulunamadı.</div>
        ) : (
          <div className="grid gap-3 text-sm">
            <div className="grid grid-cols-[140px_1fr] gap-2">
              <div className="text-neutral-500">Kullanıcı ID</div>
              <div className="font-medium">{detailUser.userId}</div>

              <div className="text-neutral-500">Ad Soyad</div>
              <div className="font-medium">
                {detailUser.firstName} {detailUser.lastName}
              </div>

              <div className="text-neutral-500">Tip</div>
              <div className="font-medium">{detailUser.userType}</div>

              <div className="text-neutral-500">Durum</div>
              <div className="font-medium">{detailUser.status}</div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

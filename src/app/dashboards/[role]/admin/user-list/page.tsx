// src/app/dashboards/[role]/admin/user-list/page.tsx
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import Modal from '@/components/UI/Modal';
import { getAuthToken } from '@/utils/auth';
import ChartPie from '@/components/chart/ChartPie';

/** ======================== API TYPES ======================== **/
type CourierFromApi = {
  userId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  isActive?: boolean;
  deleted?: boolean;
  createdAt?: string;
  countryName?: string | null;
  stateName?: string | null;
  workingType?: number | null;
  vehicleType?: number | null;
  vehicleCapacity?: number | null;
  vehicleYear?: number | null;
};

type RestaurantFromApi = {
  userId: string;
  email?: string;
  name?: string;
  contactPerson?: string;
  taxNumber?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  fullAddress?: string;
  latitude?: number | null;
  longitude?: number | null;
  openingHour?: string | null;
  closingHour?: string | null;
  createdAt?: string;
};

type AdminFromApi = {
  userId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  createdAt?: string;
};

type DealerFromApi = {
  userId: string;
  name?: string;
  surname?: string;
  email?: string;
  phone?: string;
  address?: string;
  accountType?: string;
  countryName?: string;
  cityName?: string;
  stateName?: string;
  taxOffice?: string;
  taxNumber?: string;
  iban?: string;
  resume?: string;
  status?: string;
  createdAt?: string;
};

type UsersBuckets = {
  couriers?: CourierFromApi[];
  restaurants?: RestaurantFromApi[];
  admins?: AdminFromApi[];
  dealers?: DealerFromApi[];
};

type UsersAllResponse = {
  success: boolean;
  message?: string;
  data?: {
    users?: UsersBuckets;
    totals?: { couriers: number; restaurants: number; admins: number; dealers: number; total: number };
  };
};

/** ======================== UI TYPES ======================== **/
type RowType = 'courier' | 'restaurant' | 'admin' | 'dealer' | 'unknown';

type UserRow = {
  id: string;
  type: RowType;
  name: string;
  phone: string;
  createdAt: string;
  city?: string;
  status?: string;
};

type DetailUser =
  | ({ type: 'courier' } & CourierFromApi)
  | ({ type: 'restaurant' } & RestaurantFromApi)
  | ({ type: 'admin' } & AdminFromApi)
  | ({ type: 'dealer' } & DealerFromApi);

/** ======================== HELPERS ======================== **/
async function readJson<T = any>(res: Response): Promise<T> {
  const txt = await res.text().catch(() => '');
  try {
    return txt ? JSON.parse(txt) : ({} as any);
  } catch {
    return txt as any;
  }
}

const errMsg = (d: any, fb: string) =>
  d?.error?.message || d?.message || d?.title || d?.detail || fb;

/** ======================== PAGE ======================== **/
export default function AdminUserListPage() {
  const { role } = useParams<{ role: string }>();
  const sp = useSearchParams();

  const [rows, setRows] = React.useState<UserRow[]>([]);
  const [rawDetails, setRawDetails] = React.useState<Record<string, DetailUser>>({});
  const [totals, setTotals] = React.useState<UsersAllResponse['data'] extends { totals: infer T } ? T : any>();
  const [q, setQ] = React.useState(sp.get('q') ?? '');
  const [filterType, setFilterType] = React.useState<RowType | 'all'>('all');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const token = React.useMemo(getAuthToken, []);
  const headers = React.useMemo<HeadersInit>(() => {
    const h: HeadersInit = { Accept: 'application/json' };
    if (token) (h as any).Authorization = `Bearer ${token}`;
    return h;
  }, [token]);

  const fetchUsers = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Swagger ekranındaki endpoint: GET /api/admin/users/all
      // rewrite kuralı: /yuksi/:path* → https://www.yuksi.dev/api/:path*
      const url = new URL('/yuksi/admin/users/all', window.location.origin);
      // istersen buraya query ekleyebilirsin (type, search, limit, offset)
      // url.searchParams.set('type', 'all');
      // url.searchParams.set('search', '');
      const res = await fetch(url.toString(), { cache: 'no-store', headers });
      const data = (await readJson<UsersAllResponse>(res)) as UsersAllResponse;
      if (!res.ok) throw new Error(errMsg(data, `HTTP ${res.status}`));

      const buckets: UsersBuckets = data?.data?.users ?? {};
      setTotals(data?.data?.totals);

      const dict: Record<string, DetailUser> = {};
      const list: UserRow[] = [];

      // couriers
      (buckets.couriers ?? []).forEach((u) => {
        const id = String(u.userId);
        dict[id] = { type: 'courier', ...u };
        list.push({
          id,
          type: 'courier',
          name: [u.firstName, u.lastName].filter(Boolean).join(' ').trim() || '-',
          phone: u.phone || '-',
          createdAt: u.createdAt ?? '-',
          city: u.stateName || u.countryName || undefined,
          status: u.isActive ? 'Aktif' : u.deleted ? 'Silinmiş' : 'Pasif',
        });
      });

      // restaurants
      (buckets.restaurants ?? []).forEach((u) => {
        const id = String(u.userId);
        dict[id] = { type: 'restaurant', ...u };
        list.push({
          id,
          type: 'restaurant',
          name: u.name || '-',
          phone: u.phone || '-',
          createdAt: u.createdAt ?? '-',
          city: u.fullAddress || u.addressLine1 || undefined,
          status: 'Aktif', // API durum vermiyor; istersen null bırak
        });
      });

      // admins
      (buckets.admins ?? []).forEach((u) => {
        const id = String(u.userId);
        dict[id] = { type: 'admin', ...u };
        list.push({
          id,
          type: 'admin',
          name: [u.firstName, u.lastName].filter(Boolean).join(' ').trim() || '-',
          phone: u.email || '-',
          createdAt: u.createdAt ?? '-',
          status: 'Aktif',
        });
      });

      // dealers
      (buckets.dealers ?? []).forEach((u) => {
        const id = String(u.userId);
        dict[id] = { type: 'dealer', ...u };
        list.push({
          id,
          type: 'dealer',
          name: [u.name, u.surname].filter(Boolean).join(' ').trim() || '-',
          phone: u.phone || '-',
          createdAt: u.createdAt ?? '-',
          city: [u.cityName, u.stateName].filter(Boolean).join(' / ') || undefined,
          status: u.status || 'Aktif',
        });
      });

      setRawDetails(dict);
      setRows(list);
    } catch (e: any) {
      setError(e?.message || 'Kullanıcı listesi alınamadı.');
      setRawDetails({});
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [headers]);

  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filtered = React.useMemo(() => {
    const qq = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (filterType !== 'all' && r.type !== filterType) return false;
      if (!qq) return true;
      return (
        r.name.toLowerCase().includes(qq) ||
        (r.phone || '').toLowerCase().includes(qq) ||
        (r.city || '').toLowerCase().includes(qq) ||
        (r.status || '').toLowerCase().includes(qq)
      );
    });
  }, [rows, q, filterType]);

  // modal
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [detailUser, setDetailUser] = React.useState<DetailUser | null>(null);

  const openDetails = (id: string) => {
    setDetailUser(rawDetails[id] ?? null);
    setDetailOpen(true);
  };

  const toggleStatusLocal = (id: string) => {
    setRows((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: r.status === 'Aktif' ? 'Pasif' : 'Aktif' } : r,
      ),
    );
  };

  const removeLocal = (id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
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
        </div>
      </div>

      {/* Totals strip */}
      {totals && (
        <div className="flex flex-wrap gap-3 text-sm text-neutral-700">
          <span className="rounded-lg border px-3 py-1.5 bg-white">Toplam: {totals.total}</span>
          <span className="rounded-lg border px-3 py-1.5 bg-white">Kurye: {totals.couriers}</span>
          <span className="rounded-lg border px-3 py-1.5 bg-white">Restoran: {totals.restaurants}</span>
          <span className="rounded-lg border px-3 py-1.5 bg-white">Admin: {totals.admins}</span>
          <span className="rounded-lg border px-3 py-1.5 bg-white">Bayi: {totals.dealers}</span>
        </div>
      )}

      <ChartPie name={rows.map(r => r.type)}></ChartPie>

      <section className="rounded-2xl border border-neutral-200/70 bg-white shadow-sm">
        <div className="grid gap-3 p-5 sm:p-6 sm:grid-cols-[1fr_auto]">
          <div className="flex gap-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Ara: ad, telefon, şehir, durum…"
              className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 outline-none ring-2 ring-transparent transition focus:ring-sky-200"
            />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-200"
              title="Kullanıcı tipi"
            >
              <option value="all">Tümü</option>
              <option value="courier">Kurye</option>
              <option value="restaurant">Restoran</option>
              <option value="admin">Admin</option>
              <option value="dealer">Bayi</option>
            </select>
          </div>
          <div className="text-right text-sm text-neutral-500 self-center">
            Toplam {filtered.length} kayıt{q ? ` (filtre: “${q}”)` : ''}
          </div>
        </div>

        <div className="h-px w-full bg-neutral-200/70" />
        <div className="overflow-x-auto">
          <table className="min-w-full table-fixed">
            <thead>
              <tr className="text-left text-sm text-neutral-500">
                <th className="w-28 px-6 py-3 font-medium">Tip</th>
                <th className="px-6 py-3 font-medium">Ad / Ünvan</th>
                <th className="w-56 px-6 py-3 font-medium">Kayıt Tarihi</th>
                <th className="w-64 px-6 py-3 font-medium">Şehir / Adres</th>
                <th className="w-36 px-6 py-3 font-medium">Durum</th>
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
                    <td className="px-6 py-4 capitalize text-neutral-700">{r.type}</td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-neutral-900">{r.name}</div>
                      <div className="text-sm text-neutral-500">{r.phone}</div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-neutral-900">{r.createdAt || '-'}</td>
                    <td className="px-6 py-4 text-neutral-700">{r.city || '\u00A0'}</td>
                    <td className="px-6 py-4 text-neutral-700">{r.status || '\u00A0'}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => openDetails(r.id)}
                          className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm hover:bg-neutral-50"
                          title="Detay"
                        >
                          Detay
                        </button>
                        <button
                          onClick={() => toggleStatusLocal(r.id)}
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
                          onClick={() => removeLocal(r.id)}
                          className="rounded-lg bg-rose-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-rose-600"
                          title="Sil"
                        >
                          Sil
                        </button>
                        <Link
                          href={`./user-list/edit-profile?id=${r.id}`}
                          className="rounded-lg bg-sky-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-sky-700"
                        >
                          Düzenle
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}

              {!loading && !error && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-neutral-500">
                    Eşleşen kayıt bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Detail Modal */}
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

              <div className="text-neutral-500">Tip</div>
              <div className="font-medium capitalize">{detailUser.type}</div>

              {/* Tip'e göre temel alanlar */}
              {detailUser.type === 'courier' && (
                <>
                  <div className="text-neutral-500">Ad Soyad</div>
                  <div className="font-medium">
                    {(detailUser as any).firstName} {(detailUser as any).lastName}
                  </div>
                  <div className="text-neutral-500">Telefon</div>
                  <div className="font-medium">{(detailUser as any).phone || '-'}</div>
                  <div className="text-neutral-500">Araç</div>
                  <div className="font-medium">
                    {(detailUser as any).vehicleType ?? '-'} / yıl {(detailUser as any).vehicleYear ?? '-'}
                  </div>
                </>
              )}

              {detailUser.type === 'restaurant' && (
                <>
                  <div className="text-neutral-500">Ad</div>
                  <div className="font-medium">{(detailUser as any).name || '-'}</div>
                  <div className="text-neutral-500">Adres</div>
                  <div className="font-medium">{(detailUser as any).fullAddress || '-'}</div>
                </>
              )}

              {detailUser.type === 'admin' && (
                <>
                  <div className="text-neutral-500">Ad Soyad</div>
                  <div className="font-medium">
                    {(detailUser as any).firstName} {(detailUser as any).lastName}
                  </div>
                  <div className="text-neutral-500">E-posta</div>
                  <div className="font-medium">{(detailUser as any).email || '-'}</div>
                </>
              )}

              {detailUser.type === 'dealer' && (
                <>
                  <div className="text-neutral-500">Ad Soyad</div>
                  <div className="font-medium">
                    {(detailUser as any).name} {(detailUser as any).surname}
                  </div>
                  <div className="text-neutral-500">Adres</div>
                  <div className="font-medium">{(detailUser as any).address || '-'}</div>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

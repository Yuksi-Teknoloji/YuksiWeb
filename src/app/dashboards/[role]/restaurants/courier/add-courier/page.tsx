// src/app/dashboards/[role]/restaurants/courier/add-courier/page.tsx
'use client';

import * as React from 'react';
import { Loader2, RefreshCcw, Search, UserRoundCheck, X } from 'lucide-react';

/* ================= Helpers ================= */
export function getAuthToken(): string | null {
  try {
    const ls = localStorage.getItem('auth_token');
    if (ls) return ls;
  } catch {}

  if (typeof document !== 'undefined') {
    const m = document.cookie.match(/(?:^|;\s*)auth_token=([^;]+)/);
    if (m) return decodeURIComponent(m[1]);
  }
  return null;
}

type JwtPayload = {
  sub?: string;
  unique_name?: string;
  userId?: string;
  email?: string;
  userType?: string;
  role?: string[];
  exp?: number;
};

function parseJwt(token?: string | null): JwtPayload | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length < 2) return null;
  try {
    const json = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decodeURIComponent(escape(json)));
  } catch {
    try {
      return JSON.parse(atob(parts[1]));
    } catch {
      return null;
    }
  }
}

function bearerHeaders(token?: string | null): HeadersInit {
  const h: HeadersInit = { Accept: 'application/json' };
  if (token) (h as any).Authorization = `Bearer ${token}`;
  return h;
}

async function readJson<T = any>(res: Response): Promise<T> {
  const t = await res.text();
  try { return t ? JSON.parse(t) : (null as any); } catch { return (t as any); }
}

const pickMsg = (d: any, fb: string) => d?.message || d?.detail || d?.title || fb;
const fmt = (iso?: string | null) => (iso ? new Date(iso).toLocaleString('tr-TR') : '—');

/* ================= API types (esnek) ================= */
type OrderItem = {
  id: string;
  code?: string;
  created_at?: string | null;
  status?: string | null;
  total?: number | null;
  // ek alanlar olabilir
};

type CourierItem = {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  vehicle_type?: string | number | null;
  is_active?: boolean | null;
  // ek alanlar olabilir
};

/* ================= Page ================= */
export default function AssignCourierPage() {
  const token = React.useMemo(getAuthToken, []);
  const jwt = React.useMemo(() => parseJwt(token || undefined), [token]);
  const restaurantId = React.useMemo(() => jwt?.userId || jwt?.sub || '', [jwt]); // KULLANICIYA GÖSTERİLMEZ

  const headers = React.useMemo<HeadersInit>(() => bearerHeaders(token), [token]);

  // state
  const [orders, setOrders] = React.useState<OrderItem[]>([]);
  const [ordersLoading, setOrdersLoading] = React.useState(false);
  const [ordersError, setOrdersError] = React.useState<string | null>(null);

  const [couriers, setCouriers] = React.useState<CourierItem[]>([]);
  const [couriersLoading, setCouriersLoading] = React.useState(false);
  const [couriersError, setCouriersError] = React.useState<string | null>(null);

  const [selectedOrderId, setSelectedOrderId] = React.useState<string>('');
  const [selectedCourierId, setSelectedCourierId] = React.useState<string>('');
  const [assigning, setAssigning] = React.useState(false);
  const [okMsg, setOkMsg] = React.useState<string | null>(null);
  const [errMsg, setErrMsg] = React.useState<string | null>(null);

  // simple filters
  const [qOrder, setQOrder] = React.useState('');
  const [qCourier, setQCourier] = React.useState('');

  // load orders
  const loadOrders = React.useCallback(async () => {
    if (!restaurantId) {
      setOrdersError('Restoran kimliği bulunamadı (token).');
      return;
    }
    setOrdersLoading(true);
    setOrdersError(null);
    try {
      const res = await fetch(`/yuksi/restaurant/${restaurantId}/order-history`, {
        cache: 'no-store',
        headers,
      });
      const j: any = await readJson(res);
      if (!res.ok || j?.success === false) throw new Error(pickMsg(j, `HTTP ${res.status}`));

      const list = Array.isArray(j?.data?.orders)
      ? j.data.orders
      : Array.isArray(j?.orders)
      ? j.orders
      : Array.isArray(j)
      ? j
      : [];

    const mapped: OrderItem[] = list
      // (opsiyonel) sadece paket_servis olanlar
      // .filter((o: any) => o?.type === 'paket_servis')
      .map((o: any) => ({
        id: String(o?.id ?? ''),
        code: o?.code ? String(o.code) : undefined,
        created_at: o?.created_at ?? null,
        status: o?.status ?? null,
        total: o?.total_amount != null
          ? Number(o.total_amount)
          : o?.amount != null
          ? Number(o.amount)
          : null,
      }))
      .filter((o: OrderItem) => o.id);

      setOrders(mapped);
    } catch (e: any) {
      setOrders([]); setOrdersError(e?.message || 'Siparişler alınamadı.');
    } finally {
      setOrdersLoading(false);
    }
  }, [restaurantId, headers]);

  // load couriers
  const loadCouriers = React.useCallback(async () => {
    setCouriersLoading(true);
    setCouriersError(null);
    try {
      const res = await fetch('/yuksi/Courier/list', { cache: 'no-store', headers });
      const j: any = await readJson(res);
      if (!res.ok || j?.success === false) throw new Error(pickMsg(j, `HTTP ${res.status}`));

      const list = Array.isArray(j?.data) ? j.data : (Array.isArray(j) ? j : []);
      const mapped: CourierItem[] = list.map((c: any) => ({
        id: String(c?.id ?? ''),
        first_name: c?.first_name ?? null,
        last_name: c?.last_name ?? null,
        phone: c?.phone ?? null,
        vehicle_type: c?.vehicle_type ?? null,
        is_active: typeof c?.is_active === 'boolean' ? c.is_active : null,
      })).filter((c: CourierItem) => c.id);

      setCouriers(mapped);
    } catch (e: any) {
      setCouriers([]); setCouriersError(e?.message || 'Kurye listesi alınamadı.');
    } finally {
      setCouriersLoading(false);
    }
  }, [headers]);

  React.useEffect(() => { loadOrders(); }, [loadOrders]);
  React.useEffect(() => { loadCouriers(); }, [loadCouriers]);

  // assign
  async function assign() {
    setOkMsg(null); setErrMsg(null);

    if (!restaurantId) { setErrMsg('Restoran kimliği bulunamadı.'); return; }
    if (!selectedOrderId) { setErrMsg('Bir sipariş seçin.'); return; }
    if (!selectedCourierId) { setErrMsg('Bir kurye seçin.'); return; }

    setAssigning(true);
    try {
      const res = await fetch(`/yuksi/restaurant/${restaurantId}/orders/${selectedOrderId}/assign-courier`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({ courier_id: selectedCourierId }),
      });
      const j: any = await readJson(res);
      if (!res.ok || j?.success === false) throw new Error(pickMsg(j, `HTTP ${res.status}`));

      setOkMsg('Kurye siparişe atandı.');
      // istersen siparişleri tazele
      await loadOrders();
    } catch (e: any) {
      setErrMsg(e?.message || 'Kurye atama başarısız.');
    } finally {
      setAssigning(false);
    }
  }

  // filtered views
  const ordersFiltered = React.useMemo(() => {
    if (!qOrder.trim()) return orders;
    const q = qOrder.toLowerCase();
    return orders.filter(o =>
      (o.code?.toLowerCase().includes(q) ?? false) ||
      (o.status?.toLowerCase().includes(q) ?? false) ||
      o.id.toLowerCase().includes(q),
    );
  }, [orders, qOrder]);

  const couriersFiltered = React.useMemo(() => {
    if (!qCourier.trim()) return couriers;
    const q = qCourier.toLowerCase();
    return couriers.filter(c => {
      const name = [c.first_name, c.last_name].filter(Boolean).join(' ').toLowerCase();
      const veh = String(c.vehicle_type ?? '').toLowerCase();
      return name.includes(q) || (c.phone ?? '').toLowerCase().includes(q) || veh.includes(q) || c.id.toLowerCase().includes(q);
    });
  }, [couriers, qCourier]);

  const selectedOrder = orders.find(o => o.id === selectedOrderId) || null;
  const selectedCourier = couriers.find(c => c.id === selectedCourierId) || null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Siparişe Kurye Ata</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={loadOrders}
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-sm hover:bg-neutral-50"
            title="Siparişleri yenile"
          >
            <RefreshCcw className="h-4 w-4" />
            Siparişleri Yenile
          </button>
          <button
            onClick={loadCouriers}
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-sm hover:bg-neutral-50"
            title="Kuryeleri yenile"
          >
            <RefreshCcw className="h-4 w-4" />
            Kuryeleri Yenile
          </button>
        </div>
      </div>

      {/* Atama Alanı */}
      <section className="rounded-2xl border border-neutral-200/70 bg-white shadow-sm soft-card p-4 sm:p-6">
        <div className="grid gap-4 md:grid-cols-2">
          {/* Sipariş seç */}
          <div>
            <label className="mb-1 block text-sm font-semibold text-neutral-700">Sipariş</label>
            <div className="relative">
              <input
                value={qOrder}
                onChange={(e) => setQOrder(e.target.value)}
                placeholder="Sipariş ara… (kod, durum, ID)"
                className="mb-2 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 pl-9 outline-none ring-2 ring-transparent transition focus:ring-sky-200"
              />
              <Search className="pointer-events-none absolute left-2.5 top-[7px] h-4 w-4 text-neutral-400" />
            </div>
            <select
              value={selectedOrderId}
              onChange={(e) => setSelectedOrderId(e.target.value)}
              disabled={ordersLoading}
              className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 disabled:opacity-60"
            >
              <option value="">{ordersLoading ? 'Yükleniyor…' : 'Sipariş seçin…'}</option>
              {ordersError && <option value="">{ordersError}</option>}
              {!ordersLoading && !ordersError && ordersFiltered.map(o => (
                <option key={o.id} value={o.id}>
                  {o.code ? `#${o.code}` : `ID:${o.id}`} • {o.status ?? 'durum yok'} • {fmt(o.created_at)}
                </option>
              ))}
            </select>
          </div>

          {/* Kurye seç */}
          <div>
            <label className="mb-1 block text-sm font-semibold text-neutral-700">Kurye</label>
            <div className="relative">
              <input
                value={qCourier}
                onChange={(e) => setQCourier(e.target.value)}
                placeholder="Kurye ara… (isim, tel, araç)"
                className="mb-2 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 pl-9 outline-none ring-2 ring-transparent transition focus:ring-sky-200"
              />
              <Search className="pointer-events-none absolute left-2.5 top-[7px] h-4 w-4 text-neutral-400" />
            </div>
            <select
              value={selectedCourierId}
              onChange={(e) => setSelectedCourierId(e.target.value)}
              disabled={couriersLoading}
              className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 disabled:opacity-60"
            >
              <option value="">{couriersLoading ? 'Yükleniyor…' : 'Kurye seçin…'}</option>
              {couriersError && <option value="">{couriersError}</option>}
              {!couriersLoading && !couriersError && couriersFiltered.map(c => {
                const name = [c.first_name, c.last_name].filter(Boolean).join(' ') || 'İsimsiz';
                const badge = c.is_active === false ? ' (pasif)' : '';
                return (
                  <option key={c.id} value={c.id}>
                    {name}{badge} • {(c.phone ?? '').trim() || 'tel yok'}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            onClick={() => { setSelectedOrderId(''); setSelectedCourierId(''); setOkMsg(null); setErrMsg(null); }}
            className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm hover:bg-neutral-50"
          >
            Temizle
          </button>
          <button
            onClick={assign}
            disabled={assigning || !selectedOrderId || !selectedCourierId}
            className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-orange-700 disabled:opacity-60"
          >
            {assigning ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserRoundCheck className="h-4 w-4" />}
            Ata
          </button>
        </div>

        {okMsg && <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{okMsg}</div>}
        {errMsg && <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{errMsg}</div>}
      </section>

      {/* Mini listeler (bilgi amaçlı) */}
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-neutral-200/70 bg-white shadow-sm">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <div className="font-semibold">Son Siparişler</div>
            {ordersLoading && <span className="text-xs text-neutral-500">Yükleniyor…</span>}
          </div>
          <div className="max-h-[340px] overflow-auto">
            <table className="min-w-full">
              <thead>
                <tr className="text-left text-xs text-neutral-500">
                  <th className="px-4 py-2">Sipariş</th>
                  <th className="px-4 py-2">Durum</th>
                  <th className="px-4 py-2">Tarih</th>
                  <th className="px-4 py-2">Toplam</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id} className="border-t text-sm">
                    <td className="px-4 py-2">{o.code ? `#${o.code}` : o.id}</td>
                    <td className="px-4 py-2">{o.status ?? '—'}</td>
                    <td className="px-4 py-2">{fmt(o.created_at)}</td>
                    <td className="px-4 py-2">{o.total != null ? `${o.total} ₺` : '—'}</td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-6 text-center text-sm text-neutral-500">Kayıt yok.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-neutral-200/70 bg-white shadow-sm">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <div className="font-semibold">Kuryeler</div>
            {couriersLoading && <span className="text-xs text-neutral-500">Yükleniyor…</span>}
          </div>
          <div className="max-h-[340px] overflow-auto">
            <table className="min-w-full">
              <thead>
                <tr className="text-left text-xs text-neutral-500">
                  <th className="px-4 py-2">Kurye</th>
                  <th className="px-4 py-2">Telefon</th>
                  <th className="px-4 py-2">Durum</th>
                </tr>
              </thead>
              <tbody>
                {couriers.map(c => {
                  const name = [c.first_name, c.last_name].filter(Boolean).join(' ') || 'İsimsiz';
                  return (
                    <tr key={c.id} className="border-t text-sm">
                      <td className="px-4 py-2">{name}</td>
                      <td className="px-4 py-2">{c.phone ?? '—'}</td>
                      <td className="px-4 py-2">
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                          c.is_active ? 'bg-emerald-500 text-white' : 'bg-neutral-300 text-neutral-800'
                        }`}>
                          {c.is_active ? 'AKTİF' : 'PASİF'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {couriers.length === 0 && (
                  <tr><td colSpan={3} className="px-4 py-6 text-center text-sm text-neutral-500">Kayıt yok.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

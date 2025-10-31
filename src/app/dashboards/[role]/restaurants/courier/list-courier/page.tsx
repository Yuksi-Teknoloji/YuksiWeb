// src/app/dashboards/[role]/restaurants/courier/add-order-courier/page.tsx
'use client';

import * as React from 'react';
import { Loader2, RefreshCcw, Search, UserRoundCheck, CheckCircle2 } from 'lucide-react';

/* ================= Helpers ================= */
function getAuthToken(): string | null {
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
const fmtDT = (iso?: string | null) => (iso ? new Date(iso).toLocaleString('tr-TR') : '—');

/* ================= Types ================= */
type CourierItem = {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  vehicle_type?: string | number | null;
  is_active?: boolean | null;
  is_online?: boolean | null; // <-- eklendi
};

type RestaurantCourierRow = {
  assignment_id: string;
  courier_id: string;
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  is_active?: boolean | null;
  notes?: string | null;
  assigned_at?: string | null;
};

type OrderItem = {
  id: string;
  code?: string;
  created_at?: string | null;
  status?: string | null;
  total?: number | null;
};

/* ================= Page ================= */
export default function AddOrderCourierPage() {
  const token = React.useMemo(getAuthToken, []);
  const jwt = React.useMemo(() => parseJwt(token || undefined), [token]);
  const restaurantId = React.useMemo(() => jwt?.userId || jwt?.sub || '', [jwt]); // kullanıcıya gösterme
  const headers = React.useMemo<HeadersInit>(() => bearerHeaders(token), [token]);

  // === State: Active Couriers (global list) ===
  const [activeCouriers, setActiveCouriers] = React.useState<CourierItem[]>([]);
  const [activeCouriersLoading, setActiveCouriersLoading] = React.useState(false);
  const [activeCouriersError, setActiveCouriersError] = React.useState<string | null>(null);
  const [qActive, setQActive] = React.useState('');

  // === State: Restaurant Couriers (assigned to restaurant) ===
  const [restCouriers, setRestCouriers] = React.useState<RestaurantCourierRow[]>([]);
  const [restCouriersLoading, setRestCouriersLoading] = React.useState(false);
  const [restCouriersError, setRestCouriersError] = React.useState<string | null>(null);
  const [qRest, setQRest] = React.useState('');

  // === State: Orders ===
  const [orders, setOrders] = React.useState<OrderItem[]>([]);
  const [ordersLoading, setOrdersLoading] = React.useState(false);
  const [ordersError, setOrdersError] = React.useState<string | null>(null);
  const [qOrder, setQOrder] = React.useState('');
  const [selectedOrderId, setSelectedOrderId] = React.useState<string>('');

  // === Assign op ===
  const [assigningTo, setAssigningTo] = React.useState<string>(''); // courierId currently assigning
  const [okMsg, setOkMsg] = React.useState<string | null>(null);
  const [errMsg, setErrMsg] = React.useState<string | null>(null);

  function ok(m: string) { setOkMsg(m); setTimeout(() => setOkMsg(null), 3500); }
  function err(m: string) { setErrMsg(m); setTimeout(() => setErrMsg(null), 4500); }

  /* ===== Loads ===== */
  const loadActiveCouriers = React.useCallback(async () => {
    setActiveCouriersLoading(true);
    setActiveCouriersError(null);
    try {
      const res = await fetch('/yuksi/Courier/list', { cache: 'no-store', headers });
      const j: any = await readJson(res);
      if (!res.ok || j?.success === false) throw new Error(pickMsg(j, `HTTP ${res.status}`));

      const list = Array.isArray(j?.data) ? j.data : (Array.isArray(j) ? j : []);
      const mapped: CourierItem[] = list
        .map((c: any) => ({
          id: String(c?.id ?? ''),
          first_name: c?.first_name ?? null,
          last_name: c?.last_name ?? null,
          phone: c?.phone ?? null,
          vehicle_type: c?.vehicle_type ?? null,
          is_active: typeof c?.is_active === 'boolean' ? c.is_active : null,
          is_online: typeof c?.is_online === 'boolean' ? c.is_online : null, // <-- eklendi
        }))
        // sadece aktif **ve** online olanlar
        .filter((c: CourierItem) => c.id && c.is_active === true && c.is_online === true);
      setActiveCouriers(mapped);
    } catch (e: any) {
      setActiveCouriers([]); setActiveCouriersError(e?.message || 'Aktif kuryeler alınamadı.');
    } finally {
      setActiveCouriersLoading(false);
    }
  }, [headers]);

  const loadRestaurantCouriers = React.useCallback(async () => {
    if (!restaurantId) { setRestCouriersError('Restoran kimliği yok.'); return; }
    setRestCouriersLoading(true);
    setRestCouriersError(null);
    try {
      const res = await fetch(`/yuksi/Restaurant/${restaurantId}/couriers`, { cache: 'no-store', headers });
      const j: any = await readJson(res);
      if (!res.ok || j?.success === false) throw new Error(pickMsg(j, `HTTP ${res.status}`));
      const list = Array.isArray(j?.data?.couriers) ? j.data.couriers : (Array.isArray(j?.couriers) ? j.couriers : []);
      const mapped: RestaurantCourierRow[] = list.map((x: any) => ({
        assignment_id: String(x?.id ?? ''),
        courier_id: String(x?.courier_id ?? ''),
        first_name: x?.first_name ?? null,
        last_name: x?.last_name ?? null,
        phone: x?.phone ?? null,
        is_active: typeof x?.is_active === 'boolean' ? x.is_active : null,
        notes: x?.notes ?? null,
        assigned_at: x?.assigned_at ?? x?.created_at ?? null,
      })).filter((row: RestaurantCourierRow) => row.assignment_id && row.courier_id);
      setRestCouriers(mapped);
    } catch (e: any) {
      setRestCouriers([]); setRestCouriersError(e?.message || 'Restoran kuryeleri alınamadı.');
    } finally {
      setRestCouriersLoading(false);
    }
  }, [headers, restaurantId]);

  const loadOrders = React.useCallback(async () => {
    if (!restaurantId) { setOrdersError('Restoran kimliği yok.'); return; }
    setOrdersLoading(true);
    setOrdersError(null);
    try {
      const res = await fetch(`/yuksi/restaurant/${restaurantId}/order-history`, { cache: 'no-store', headers });
      const j: any = await readJson(res);
      if (!res.ok || j?.success === false) throw new Error(pickMsg(j, `HTTP ${res.status}`));

      const list = Array.isArray(j?.data?.orders)
        ? j.data.orders
        : Array.isArray(j?.orders)
        ? j.orders
        : Array.isArray(j)
        ? j
        : [];

      const mapped: OrderItem[] = list.map((o: any) => ({
        id: String(o?.id ?? ''),
        code: o?.code ? String(o.code) : undefined,
        created_at: o?.created_at ?? null,
        status: o?.status ?? null,
        total:
          o?.total_amount != null ? Number(o.total_amount)
          : o?.amount != null ? Number(o.amount)
          : null,
      })).filter((o: OrderItem) => o.id);

      setOrders(mapped);
      setSelectedOrderId((prev: string) => prev || (mapped[0]?.id ?? ''));
    } catch (e: any) {
      setOrders([]); setOrdersError(e?.message || 'Siparişler alınamadı.');
    } finally {
      setOrdersLoading(false);
    }
  }, [headers, restaurantId]);

  React.useEffect(() => { loadActiveCouriers(); }, [loadActiveCouriers]);
  React.useEffect(() => { loadRestaurantCouriers(); }, [loadRestaurantCouriers]);
  React.useEffect(() => { loadOrders(); }, [loadOrders]);

  /* ===== Filtering ===== */
  const activeCouriersFiltered: CourierItem[] = React.useMemo(() => {
    if (!qActive.trim()) return activeCouriers;
    const q = qActive.toLowerCase();
    return activeCouriers.filter((c: CourierItem) => {
      const name = [c.first_name, c.last_name].filter(Boolean).join(' ').toLowerCase();
      const veh = String(c.vehicle_type ?? '').toLowerCase();
      return name.includes(q) || (c.phone ?? '').toLowerCase().includes(q) || veh.includes(q) || c.id.toLowerCase().includes(q);
    });
  }, [activeCouriers, qActive]);

  const restCouriersFiltered: RestaurantCourierRow[] = React.useMemo(() => {
    if (!qRest.trim()) return restCouriers;
    const q = qRest.toLowerCase();
    return restCouriers.filter((c: RestaurantCourierRow) => {
      const name = [c.first_name, c.last_name].filter(Boolean).join(' ').toLowerCase();
      return name.includes(q) || (c.phone ?? '').toLowerCase().includes(q) || c.courier_id.toLowerCase().includes(q);
    });
  }, [restCouriers, qRest]);

  const ordersFiltered: OrderItem[] = React.useMemo(() => {
    if (!qOrder.trim()) return orders;
    const q = qOrder.toLowerCase();
    return orders.filter((o: OrderItem) =>
      (o.code?.toLowerCase().includes(q) ?? false) ||
      (o.status?.toLowerCase().includes(q) ?? false) ||
      o.id.toLowerCase().includes(q),
    );
  }, [orders, qOrder]);

  /* ===== Assign ===== */
  async function assignToCourier(courierId: string) {
    if (!selectedOrderId) { err('Önce bir sipariş seçin.'); return; }
    if (!restaurantId) { err('Restoran kimliği bulunamadı.'); return; }
    setAssigningTo(courierId);
    try {
      const res = await fetch(`/yuksi/restaurant/${restaurantId}/orders/${selectedOrderId}/assign-courier`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({ courier_id: courierId }),
      });
      const j: any = await readJson(res);
      if (!res.ok || j?.success === false) throw new Error(pickMsg(j, `HTTP ${res.status}`));
      ok('Sipariş kurye ile eşleştirildi.');
      await loadRestaurantCouriers();
      await loadOrders();
    } catch (e: any) {
      err(e?.message || 'Atama başarısız.');
    } finally {
      setAssigningTo('');
    }
  }

  /* ===== UI ===== */
  const selectedOrder: OrderItem | null = orders.find((o: OrderItem) => o.id === selectedOrderId) || null;

  return (
    <div className="space-y-6">
      {/* Üst şerit: Seçili sipariş */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Kuryeye Sipariş Ata</h1>
          <p className="text-sm text-neutral-600">Aşağıdan bir sipariş seçin ve bir kuryeye atayın.</p>
        </div>
        <div className="flex items-end gap-2">
          <div className="grid">
            <label className="mb-1 text-xs font-medium text-neutral-600">Seçili Sipariş</label>
            <select
              value={selectedOrderId}
              onChange={(e) => setSelectedOrderId(e.target.value)}
              className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm"
            >
              <option value="">Seçin…</option>
              {orders.map((o: OrderItem) => (
                <option key={o.id} value={o.id}>
                  {(o.code ? `#${o.code}` : o.id)} • {(o.status ?? 'durum yok')}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {(okMsg || errMsg) && (
        <div className={`rounded-xl px-4 py-3 text-sm ${okMsg ? 'border border-emerald-200 bg-emerald-50 text-emerald-700' : 'border border-rose-200 bg-rose-50 text-rose-700'}`}>
          {okMsg || errMsg}
        </div>
      )}

      {/* Siparişler */}
      <section className="rounded-2xl border border-neutral-200/70 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
          <div className="font-semibold">Siparişler</div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                value={qOrder}
                onChange={(e) => setQOrder(e.target.value)}
                placeholder="Ara… (kod, durum, ID)"
                className="w-56 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 pl-8 text-sm outline-none focus:ring-2 focus:ring-sky-200"
              />
              <Search className="pointer-events-none absolute left-2 top-1.5 h-4 w-4 text-neutral-400" />
            </div>
            <button
              onClick={loadOrders}
              className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-sm hover:bg-neutral-50"
              title="Yenile"
            >
              <RefreshCcw className="h-4 w-4" />
              Yenile
            </button>
          </div>
        </div>
        <div className="max-h-[360px] overflow-auto">
          <table className="min-w-full">
            <thead>
              <tr className="text-left text-xs text-neutral-500">
                <th className="px-4 py-2">Seç</th>
                <th className="px-4 py-2">Sipariş</th>
                <th className="px-4 py-2">Durum</th>
                <th className="px-4 py-2">Tarih</th>
                <th className="px-4 py-2">Toplam</th>
              </tr>
            </thead>
            <tbody>
              {ordersFiltered.map((o: OrderItem) => {
                const isSel = selectedOrderId === o.id;
                return (
                  <tr key={o.id} className={`border-t text-sm ${isSel ? 'bg-sky-50/60' : ''}`}>
                    <td className="px-4 py-2">
                      <input
                        type="radio"
                        name="orderSel"
                        checked={isSel}
                        onChange={() => setSelectedOrderId(o.id)}
                        aria-label="Sipariş seç"
                      />
                    </td>
                    <td className="px-4 py-2">{o.code ? `#${o.code}` : o.id}</td>
                    <td className="px-4 py-2">{o.status ?? '—'}</td>
                    <td className="px-4 py-2">{fmtDT(o.created_at)}</td>
                    <td className="px-4 py-2">{o.total != null ? `${o.total} ₺` : '—'}</td>
                  </tr>
                );
              })}
              {ordersFiltered.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-sm text-neutral-500">Kayıt yok.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {ordersLoading && <div className="px-4 py-2 text-xs text-neutral-500">Yükleniyor…</div>}
        {ordersError && <div className="m-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{ordersError}</div>}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Aktif Kuryeler (genel) */}
        <section className="rounded-2xl border border-neutral-200/70 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
            <div className="font-semibold">Aktif Kuryeler (Tümü)</div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  value={qActive}
                  onChange={(e) => setQActive(e.target.value)}
                  placeholder="Kurye ara…"
                  className="w-48 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 pl-8 text-sm outline-none focus:ring-2 focus:ring-sky-200"
                />
                <Search className="pointer-events-none absolute left-2 top-1.5 h-4 w-4 text-neutral-400" />
              </div>
              <button
                onClick={loadActiveCouriers}
                className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-sm hover:bg-neutral-50"
                title="Yenile"
              >
                <RefreshCcw className="h-4 w-4" />
                Yenile
              </button>
            </div>
          </div>
          <div className="max-h-[360px] overflow-auto">
            <table className="min-w-full">
              <thead>
                <tr className="text-left text-xs text-neutral-500">
                  <th className="px-4 py-2">Kurye</th>
                  <th className="px-4 py-2">Telefon</th>
                  <th className="px-4 py-2 w-36">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {activeCouriersFiltered.map((c: CourierItem) => {
                  const name = [c.first_name, c.last_name].filter(Boolean).join(' ') || 'İsimsiz';
                  const isWorking = assigningTo === c.id;
                  return (
                    <tr key={c.id} className="border-t text-sm">
                      <td className="px-4 py-2">{name}</td>
                      <td className="px-4 py-2">{c.phone ?? '—'}</td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => assignToCourier(c.id)}
                          disabled={isWorking || !selectedOrderId}
                          className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-orange-700 disabled:opacity-60"
                          title="Seçili siparişi bu kuryeye ata"
                        >
                          {isWorking ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserRoundCheck className="h-4 w-4" />}
                          Siparişi Ata
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {activeCouriersFiltered.length === 0 && (
                  <tr><td colSpan={3} className="px-4 py-6 text-center text-sm text-neutral-500">Kayıt yok.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          {activeCouriersLoading && <div className="px-4 py-2 text-xs text-neutral-500">Yükleniyor…</div>}
          {activeCouriersError && <div className="m-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{activeCouriersError}</div>}
        </section>

        {/* Restorana Ekli Kuryeler */}
        <section className="rounded-2xl border border-neutral-200/70 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
            <div className="font-semibold">Restorana Ekli Kuryeler</div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  value={qRest}
                  onChange={(e) => setQRest(e.target.value)}
                  placeholder="Kurye ara…"
                  className="w-48 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 pl-8 text-sm outline-none focus:ring-2 focus:ring-sky-200"
                />
                <Search className="pointer-events-none absolute left-2 top-1.5 h-4 w-4 text-neutral-400" />
              </div>
              <button
                onClick={loadRestaurantCouriers}
                className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-sm hover:bg-neutral-50"
                title="Yenile"
              >
                <RefreshCcw className="h-4 w-4" />
                Yenile
              </button>
            </div>
          </div>
          <div className="max-h-[360px] overflow-auto">
            <table className="min-w-full">
              <thead>
                <tr className="text-left text-xs text-neutral-500">
                  <th className="px-4 py-2">Kurye</th>
                  <th className="px-4 py-2">Telefon</th>
                  <th className="px-4 py-2">Atanma</th>
                  <th className="px-4 py-2 w-36">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {restCouriersFiltered.map((r: RestaurantCourierRow) => {
                  const name = [r.first_name, r.last_name].filter(Boolean).join(' ') || r.courier_id;
                  const isWorking = assigningTo === r.courier_id;
                  return (
                    <tr key={r.assignment_id} className="border-t text-sm">
                      <td className="px-4 py-2">{name}</td>
                      <td className="px-4 py-2">{r.phone ?? '—'}</td>
                      <td className="px-4 py-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] text-neutral-700">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          {fmtDT(r.assigned_at)}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => assignToCourier(r.courier_id)}
                          disabled={isWorking || !selectedOrderId}
                          className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-orange-700 disabled:opacity-60"
                          title="Seçili siparişi bu kuryeye ata"
                        >
                          {isWorking ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserRoundCheck className="h-4 w-4" />}
                          Siparişi Ata
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {restCouriersFiltered.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-6 text-center text-sm text-neutral-500">Kayıt yok.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          {restCouriersLoading && <div className="px-4 py-2 text-xs text-neutral-500">Yükleniyor…</div>}
          {restCouriersError && <div className="m-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{restCouriersError}</div>}
        </section>
      </div>

      {/* Seçili sipariş özeti */}
      <div className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-semibold">Seçili Sipariş:</span>
          {selectedOrder ? (
            <>
              <span>{selectedOrder.code ? `#${selectedOrder.code}` : selectedOrder.id}</span>
              <span>• {selectedOrder.status ?? 'durum yok'}</span>
              <span>• {fmtDT(selectedOrder.created_at)}</span>
              <span>• {selectedOrder.total != null ? `${selectedOrder.total} ₺` : '—'}</span>
            </>
          ) : (
            <span>Henüz sipariş seçilmedi.</span>
          )}
        </div>
      </div>
    </div>
  );
}

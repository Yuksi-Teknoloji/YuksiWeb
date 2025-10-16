// src/app/dashboards/[role]/admin/orders/order-history/page.tsx
'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, SortAsc, ChevronLeft, ChevronRight, X, Phone, Bike } from 'lucide-react';

/* ---------- API model & helpers ---------- */
type ApiOrderBrief = {
  id: string;
  code: string;
  customer: string;
  phone: string;
  address: string;
  type: 'paket_servis' | 'gel_al' | 'yerinde';
  amount: string;
  status: 'hazirlaniyor' | 'yolda' | 'teslim_edildi' | 'iptal';
  created_at: string;
};

type ApiOrderHistoryResp = {
  success: boolean;
  message?: string;
  data?: { orders: ApiOrderBrief[]; total_count: number; total_amount: number };
};

type ApiOrderDetails = {
  id: string;
  userId: string;
  code: string;
  customer: string;
  phone: string;
  address: string;
  delivery_address: string | null;
  type: 'paket_servis' | 'gel_al' | 'yerinde';
  status: 'hazirlaniyor' | 'yolda' | 'teslim_edildi' | 'iptal';
  amount: string;
  carrier_type?: string | null;
  vehicle_type?: string | null;
  cargo_type?: string | null;
  special_requests?: string | null;
  created_at: string;
  updated_at: string;
  restaurant_name?: string;
  items: { id: string; product_name: string; price: string; quantity: number; total: string }[];
};

type ApiOrderDetailsResp = { success: boolean; message?: string; data?: ApiOrderDetails };

/* UI Tipleri */
type Status = 'Hazırlanıyor' | 'Yolda' | 'Teslim Edildi' | 'İptal';
type Type   = 'Paket Servis' | 'Gel-Al' | 'Yerinde';
type Order = {
  id: string; code: string; customer: string; phone: string; address: string;
  type: Type; date: string; amount: number; status: Status;
};

/* Map'ler: API <-> UI */
const apiTypeToUi: Record<ApiOrderBrief['type'], Type> = {
  paket_servis: 'Paket Servis', gel_al: 'Gel-Al', yerinde: 'Yerinde',
};
const uiTypeToApi: Record<Type, ApiOrderBrief['type']> = {
  'Paket Servis': 'paket_servis', 'Gel-Al': 'gel_al', 'Yerinde': 'yerinde',
};
const apiStatusToUi: Record<ApiOrderBrief['status'], Status> = {
  hazirlaniyor: 'Hazırlanıyor', yolda: 'Yolda', teslim_edildi: 'Teslim Edildi', iptal: 'İptal',
};
const uiStatusToApi: Record<Status, ApiOrderBrief['status']> = {
  'Hazırlanıyor': 'hazirlaniyor', 'Yolda': 'yolda', 'Teslim Edildi': 'teslim_edildi', 'İptal': 'iptal',
};

/* ---------- küçük yardımcılar ---------- */
function trCurrency(n: number) {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(n);
}
function today() { const d = new Date(); const mm = String(d.getMonth()+1).padStart(2,'0'); const dd = String(d.getDate()).padStart(2,'0'); return `${d.getFullYear()}-${mm}-${dd}`; }
function firstDayOfMonth() { const d = new Date(); const mm = String(d.getMonth()+1).padStart(2,'0'); return `${d.getFullYear()}-${mm}-01`; }
function addDay(d: Date) { const c = new Date(d); c.setDate(c.getDate()+1); return c; }

async function readJson<T=any>(res: Response): Promise<T> {
  const t = await res.text(); try { return t ? JSON.parse(t) : (null as any); } catch { throw new Error('Geçersiz JSON'); }
}
const pickMsg = (d: any, fallback: string) => d?.message || d?.detail || d?.title || d?.error?.message || fallback;

/* ---------- TOKEN → restaurantId ---------- */
// Token’ı localStorage’daki muhtemel anahtarlardan bulur (Bearer öneki varsa keser)
function getRawTokenFromStorage(): string | null {
  if (typeof window === 'undefined') return null;
  const candidates = ['token', 'access_token', 'auth', 'jwt'];
  for (const key of candidates) {
    const v = localStorage.getItem(key);
    if (v && typeof v === 'string' && v.trim()) return v.replace(/^Bearer\s+/i, '').trim();
  }
  return null;
}
// Base64URL decode
function b64urlDecode(s: string) {
  s = s.replace(/-/g, '+').replace(/_/g, '/');
  const pad = s.length % 4 ? 4 - (s.length % 4) : 0;
  if (pad) s += '='.repeat(pad);
  try { return atob(s); } catch { return ''; }
}
type TokenPayload = {
  sub?: string; unique_name?: string; userId?: string; email?: string;
  userType?: string; role?: string[]; exp?: number;
};
// JWT payload’ından restaurant id (userId) al
function getRestaurantIdFromToken(): { id: string | null; bearer?: string } {
  const raw = getRawTokenFromStorage();
  if (!raw) return { id: null };
  const parts = raw.split('.');
  if (parts.length < 2) return { id: null, bearer: raw };
  const json = b64urlDecode(parts[1]);
  let payload: TokenPayload | null = null;
  try { payload = JSON.parse(json); } catch { payload = null; }
  const id = payload?.userId ? String(payload.userId) : null;
  return { id, bearer: raw };
}

const FALLBACK_RESTAURANT_ID = ''; // istersen sabit id

export default function OrderHistoryPage() {
  const searchParams = useSearchParams();
  const ridFromQuery = searchParams.get('rid') || '';
  const ridFromLS = (typeof window !== 'undefined' && localStorage.getItem('userId')) || '';

  // token’dan oku
  const tokenInfo = React.useMemo(() => getRestaurantIdFromToken(), []);
  const resolvedRestaurantId = ridFromQuery || tokenInfo.id || ridFromLS || FALLBACK_RESTAURANT_ID;

  const [restaurantId, setRestaurantId] = React.useState<string>(resolvedRestaurantId);

  // LS’e yaz (ileride fallback olsun)
  React.useEffect(() => {
    if (restaurantId) localStorage.setItem('userId', restaurantId);
  }, [restaurantId]);

  // filters
  const [q, setQ] = React.useState('');
  const [byStatus, setByStatus] = React.useState<'' | Status>('');
  const [byType, setByType] = React.useState<'' | Type>('');
  const [start, setStart] = React.useState(firstDayOfMonth());
  const [end, setEnd] = React.useState(today());
  const [sortKey, setSortKey] = React.useState<'date' | 'amount'>('date');
  const [sortAsc, setSortAsc] = React.useState(false);

  // data
  const [rows, setRows] = React.useState<Order[]>([]);
  const [totalAmount, setTotalAmount] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // pagination
  const [page, setPage] = React.useState(1);
  const pageSize = 8;

  // detail modal
  const [detail, setDetail] = React.useState<{ order: Order; items: { id: string; name: string; qty: number; price: number }[] } | null>(null);
  const [detailLoading, setDetailLoading] = React.useState(false);
  const [detailErr, setDetailErr] = React.useState<string | null>(null);

  // ortak header (token varsa Authorization ekler)
  const authHeaders = React.useMemo(() => {
    const h: HeadersInit = { Accept: 'application/json' };
    if (tokenInfo?.bearer) (h as any)['Authorization'] = `Bearer ${tokenInfo.bearer}`;
    return h;
  }, [tokenInfo?.bearer]);

  // Listeyi yükle
  const load = React.useCallback(async () => {
    if (!restaurantId) { setError('Token’dan restaurant_id bulunamadı. (Query "?rid=" ile de geçebilirsin.)'); return; }
    setLoading(true); setError(null);
    try {
      const url = new URL(`yuksi/restaurant/0d4b1d8e-a9e9-4012-9704-0fe69f5e0b67/order-history?offset=0`, location.origin);
      if (byStatus) url.searchParams.set('status', uiStatusToApi[byStatus]);
      if (byType)   url.searchParams.set('type', uiTypeToApi[byType]);



      const res  = await fetch(url.toString(), { cache: 'no-store', headers: authHeaders });
      const data = await readJson<ApiOrderHistoryResp>(res);
      if (!res.ok) throw new Error(pickMsg(data, `HTTP ${res.status}`));

      const list = data?.data?.orders ?? [];
      const mapped: Order[] = list.map(o => ({
        id: o.id, code: o.code, customer: o.customer, phone: o.phone, address: o.address,
        type: apiTypeToUi[o.type], date: o.created_at, amount: Number(o.amount ?? 0), status: apiStatusToUi[o.status],
      }));

      mapped.sort((a, b) => {
        let v = 0;
        if (sortKey === 'date') v = new Date(a.date).getTime() - new Date(b.date).getTime();
        if (sortKey === 'amount') v = a.amount - b.amount;
        return sortAsc ? v : -v;
      });

      setRows(mapped);
      setTotalAmount(Number(data?.data?.total_amount ?? 0));
      setPage(1);
    } catch (e: any) {
      setRows([]); setError(e?.message || 'Sipariş listesi alınamadı.');
    } finally {
      setLoading(false);
    }
  }, [restaurantId, byStatus, byType, q, start, end, sortKey, sortAsc, authHeaders]);

  React.useEffect(() => { setRestaurantId(resolvedRestaurantId); }, [resolvedRestaurantId]);
  React.useEffect(() => { load(); }, [load]);

  // detail fetcher
  async function openDetail(orderId: string) {
    if (!restaurantId) return;
    setDetailLoading(true); setDetailErr(null);
    try {
      const res  = await fetch(`/yuksi/restaurant/${restaurantId}/orders/${orderId}`, { cache: 'no-store', headers: authHeaders });
      const data = await readJson<ApiOrderDetailsResp>(res);
      if (!res.ok) throw new Error(pickMsg(data, `HTTP ${res.status}`));
      const d = data?.data!;
      const order: Order = {
        id: d.id, code: d.code, customer: d.customer, phone: d.phone,
        address: d.address || d.delivery_address || '', type: apiTypeToUi[d.type],
        date: d.created_at, amount: Number(d.amount ?? 0), status: apiStatusToUi[d.status],
      };
      const items = (d.items || []).map(it => ({ id: it.id, name: it.product_name, qty: Number(it.quantity||0), price: Number(it.price||0) }));
      setDetail({ order, items });
    } catch (e: any) {
      setDetailErr(e?.message || 'Detay alınamadı.'); setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  }

  // filtre değişince sayfayı başa al
  React.useEffect(() => { setPage(1); }, [q, byStatus, byType, start, end]);

  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const current = rows.slice((page - 1) * pageSize, page * pageSize);
  const total = rows.reduce((acc, r) => acc + r.amount, 0);

  return (
    <div className="space-y-6 overflow-x-hidden">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Sipariş Geçmişi</h1>

        <div className="hidden md:flex items-center gap-2 text-sm text-neutral-500">
          <SortBtn active={sortKey === 'date'} asc={sortAsc} onClick={() => { setSortKey('date'); setSortAsc(v => !v); }} label="Tarih" />
          <SortBtn active={sortKey === 'amount'} asc={sortAsc} onClick={() => { setSortKey('amount'); setSortAsc(v => !v); }} label="Tutar" />
        </div>
      </div>

      <section className="rounded-2xl border border-neutral-200/70 bg-white shadow-sm soft-card overflow-hidden mx-[-16px] lg:mx-[-24px]">
        {/* Filtreler */}
        <div className="px-4 lg:px-6 py-4 sm:py-6">
          <div className="grid grid-flow-col auto-cols-max items-end gap-3">
            <div className="w-[260px] sm:w-[320px] shrink-0">
              <label className="mb-1 block text-sm font-semibold text-neutral-700">Kod / Müşteri / Telefon</label>
              <div className="relative">
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ORD-..., isim veya telefon"
                  className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 pl-9 outline-none ring-2 ring-transparent transition focus:ring-sky-200" />
                <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-neutral-700">Durum</label>
              <select value={byStatus} onChange={(e) => setByStatus(e.target.value as Status | '')}
                className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 outline-none ring-2 ring-transparent transition focus:ring-sky-200">
                <option value="">Tümü</option>
                <option>Hazırlanıyor</option>
                <option>Yolda</option>
                <option>Teslim Edildi</option>
                <option>İptal</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-neutral-700">Teslimat Tipi</label>
              <select value={byType} onChange={(e) => setByType(e.target.value as Type | '')}
                className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 outline-none ring-2 ring-transparent transition focus:ring-sky-200">
                <option value="">Tümü</option>
                <option>Paket Servis</option>
                <option>Gel-Al</option>
                <option>Yerinde</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-neutral-700">Başlangıç</label>
              <input type="date" value={start} onChange={(e) => setStart(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 outline-none ring-2 ring-transparent transition focus:ring-sky-200" />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-neutral-700">Bitiş</label>
              <input type="date" value={end} onChange={(e) => setEnd(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 outline-none ring-2 ring-transparent transition focus:ring-sky-200" />
            </div>

            <button onClick={load} className="self-end rounded-xl border px-3 py-2 text-sm hover:bg-neutral-50">Uygula</button>
          </div>
        </div>

        {/* Tablo */}
        <div className="border-t border-neutral-200/70">
          <div className="overflow-x-auto bg-white px-4 lg:px-6">
            <table className="w-full table-fixed">
              <thead>
                <tr className="text-left text-sm text-neutral-500">
                  <th className="px-4 lg:px-6 py-3 font-medium w-36">Tarih</th>
                  <th className="px-4 lg:px-6 py-3 font-medium w-36">Kod</th>
                  <th className="px-4 lg:px-6 py-3 font-medium">Müşteri</th>
                  <th className="px-4 lg:px-6 py-3 font-medium w-40">Tip</th>
                  <th className="px-4 lg:px-6 py-3 font-medium w-32">Tutar</th>
                  <th className="px-4 lg:px-6 py-3 font-medium w-40">Durum</th>
                  <th className="px-4 lg:px-6 py-3 font-medium w-44">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {loading && (<tr><td colSpan={7} className="px-6 py-12 text-center text-neutral-500">Yükleniyor…</td></tr>)}
                {!loading && error && (<tr><td colSpan={7} className="px-6 py-12 whitespace-pre-wrap text-center text-rose-600">{error}</td></tr>)}
                {!loading && !error && current.map((r) => (
                  <tr key={r.id} className="border-t border-neutral-200/70 hover:bg-neutral-50 align-middle">
                    <td className="px-4 lg:px-0 py-8 whitespace-nowrap">{new Date(r.date).toLocaleString('tr-TR')}</td>
                    <td className="px-4 lg:px-4 py-3 font-medium">{r.code}</td>
                    <td className="px-4 lg:px-4 py-3">
                      <div className="font-medium text-neutral-900">{r.customer}</div>
                      <div className="text-xs text-neutral-500">{r.phone}</div>
                      <div className="text-xs text-neutral-500 truncate max-w-[340px]">{r.address}</div>
                    </td>
                    <td className="px-4 lg:px-6 py-3">{r.type}</td>
                    <td className="px-4 lg:px-6 py-3 font-semibold tabular-nums">{trCurrency(r.amount)}</td>
                    <td className="px-4 lg:px-6 py-3"><StatusPill status={r.status} /></td>
                    <td className="px-4 lg:px-6 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openDetail(r.id)} className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm hover:bg-neutral-50">Detay</button>
                        <button onClick={() => alert('Yeniden gönder: ' + r.code)} className="rounded-lg bg-orange-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-orange-600">Yeniden Gönder</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && !error && current.length === 0 && (
                  <tr><td colSpan={7} className="px-6 py-12 text-center text-sm text-neutral-500">Kayıt bulunamadı.</td></tr>
                )}
              </tbody>

              {!loading && !error && rows.length > 0 && (
                <tfoot>
                  <tr className="border-t border-neutral-200/70">
                    <td className="px-4 lg:px-6 py-3 text-sm text-neutral-600" colSpan={4}>Toplam {rows.length} sipariş</td>
                    <td className="px-4 lg:px-6 py-3 font-semibold">
                      {trCurrency(total)} 
                    </td>
                    <td colSpan={2} />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>

        {/* pagination */}
        {!loading && !error && (
          <div className="flex items-center justify-between px-4 lg:px-6 py-4 border-t">
            <div className="text-sm text-neutral-500">Sayfa {page} / {pageCount}</div>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}
                className="rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm hover:bg-neutral-50 disabled:opacity-50">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button disabled={page >= pageCount} onClick={() => setPage(p => Math.min(pageCount, p + 1))}
                className="rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm hover:bg-neutral-50 disabled:opacity-50">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Detay Modal */}
      <OrderDetailModal
        open={!!detail || detailLoading || !!detailErr}
        order={detail?.order || null}
        items={detail?.items || []}
        loading={detailLoading}
        error={detailErr}
        onClose={() => { setDetail(null); setDetailErr(null); }}
      />
    </div>
  );
}

/* ---------- Detay Modal ---------- */
function OrderDetailModal({
  open, order, items, loading, error, onClose,
}: {
  open: boolean;
  order: Order | null;
  items: { id: string; name: string; qty: number; price: number }[];
  loading: boolean;
  error: string | null;
  onClose: () => void;
}) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const subtotal = items.reduce((a, i) => a + i.qty * i.price, 0);
  const delivery = order?.type === 'Paket Servis' ? 19 : 0;
  const total = subtotal + delivery;

  const courier = order ? { name: 'Kurye', vehicle: 'Motosiklet', plate: '—', status: order.status, eta: '—' } : null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div role="dialog" aria-modal="true"
        className="absolute left-1/2 top-10 w-[min(720px,92vw)] -translate-x-1/2 rounded-2xl bg-white shadow-xl ring-1 ring-black/5 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div>
            <h3 className="text-lg font-semibold text-neutral-900">{order?.code || 'Sipariş Detayı'}</h3>
            {!!order && <p className="text-xs text-neutral-500">{new Date(order.date).toLocaleString('tr-TR')} • {order.customer}</p>}
          </div>
          <button onClick={onClose} className="rounded-md p-2 text-neutral-500 hover:bg-neutral-100" aria-label="Kapat">
            <X className="h-5 w-5" />
          </button>
        </div>

        {loading && <div className="p-6 text-center text-neutral-500">Yükleniyor…</div>}
        {error && <div className="p-6 text-center text-rose-600">{error}</div>}

        {!loading && !error && order && (
          <div className="grid gap-0 md:grid-cols-[1.2fr_1fr]">
            {/* Items */}
            <div className="p-5">
              <div className="text-sm font-semibold text-neutral-700 mb-2">Sipariş Kalemleri</div>
              <div className="rounded-xl border border-neutral-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-neutral-50 text-xs text-neutral-500">
                    <tr>
                      <th className="text-left px-4 py-2 font-medium">Ürün</th>
                      <th className="text-right px-4 py-2 font-medium w-16">Adet</th>
                      <th className="text-right px-4 py-2 font-medium w-24">Birim</th>
                      <th className="text-right px-4 py-2 font-medium w-28">Tutar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((it) => (
                      <tr key={it.id} className="border-t">
                        <td className="px-4 py-2 text-sm">{it.name}</td>
                        <td className="px-4 py-2 text-sm text-right tabular-nums">{it.qty}</td>
                        <td className="px-4 py-2 text-sm text-right tabular-nums">{trCurrency(it.price)}</td>
                        <td className="px-4 py-2 text-sm text-right tabular-nums">{trCurrency(it.qty * it.price)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t">
                    <tr>
                      <td colSpan={3} className="px-4 py-2 text-right text-sm text-neutral-600">Ara Toplam</td>
                      <td className="px-4 py-2 text-right font-semibold tabular-nums">{trCurrency(subtotal)}</td>
                    </tr>
                    <tr>
                      <td colSpan={3} className="px-4 py-2 text-right text-sm text-neutral-600">Kurye</td>
                      <td className="px-4 py-2 text-right font-semibold tabular-nums">{trCurrency(delivery)}</td>
                    </tr>
                    <tr>
                      <td colSpan={3} className="px-4 py-2 text-right text-sm text-neutral-800">Genel Toplam</td>
                      <td className="px-4 py-2 text-right font-bold tabular-nums">{trCurrency(total)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Courier & meta */}
            <div className="p-5 border-l">
              <div className="text-sm font-semibold text-neutral-700 mb-2">Kurye Bilgisi</div>
              <div className="rounded-xl border border-neutral-200 p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-orange-100 text-orange-700">
                    <Bike className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-neutral-900">{courier?.name}</div>
                    <div className="text-xs text-neutral-500">{courier?.vehicle} • {courier?.plate}</div>
                  </div>
                </div>
                <div className="text-sm"><div className="text-neutral-500">Durum</div><div className="font-medium">{courier?.status}</div></div>
                <div className="text-sm"><div className="text-neutral-500">Tahmini Varış</div><div className="font-medium">{courier?.eta}</div></div>
                <a href={`tel:${order.phone.replace(/\s/g, '')}`} className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-3 py-2 text-sm font-semibold text-white hover:bg-orange-600">
                  <Phone className="h-4 w-4" /> Müşteriyi Ara
                </a>
              </div>

              <div className="mt-5 text-sm font-semibold text-neutral-700 mb-2">Teslimat</div>
              <div className="rounded-xl border border-neutral-200 p-4 text-sm space-y-2">
                <div><span className="text-neutral-500">Tip: </span>{order.type}</div>
                <div><span className="text-neutral-500">Adres: </span>{order.address || '—'}</div>
                <div><span className="text-neutral-500">Sipariş Tarihi: </span>{new Date(order.date).toLocaleString('tr-TR')}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- UI parçaları ---------- */
function StatusPill({ status }: { status: Status }) {
  const map: Record<Status, string> = {
    'Hazırlanıyor': 'bg-amber-500 text-white',
    'Yolda': 'bg-sky-500 text-white',
    'Teslim Edildi': 'bg-emerald-500 text-white',
    'İptal': 'bg-rose-500 text-white',
  };
  return <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold ${map[status]}`}>{status}</span>;
}

function SortBtn({ active, asc, onClick, label }: { active: boolean; asc: boolean; onClick: () => void; label: string }) {
  return (
    <button onClick={onClick}
      className={['inline-flex items-center gap-1 rounded-md px-2 py-1', active ? 'bg-orange-100 text-orange-700' : 'hover:bg-neutral-100'].join(' ')}
      title={`Sırala (${label})`}>
      <SortAsc className={`h-4 w-4 ${asc ? 'rotate-180' : ''}`} />
      {label}
    </button>
  );
}

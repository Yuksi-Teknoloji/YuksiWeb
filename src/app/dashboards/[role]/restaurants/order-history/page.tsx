'use client';

import * as React from 'react';
import { Search, SortAsc, ChevronLeft, ChevronRight, X, Phone, Bike } from 'lucide-react';

type Status = 'Hazırlanıyor' | 'Yolda' | 'Teslim Edildi' | 'İptal';
type Type = 'Paket Servis' | 'Gel-Al' | 'Yerinde';

type Order = {
  id: string;
  code: string;
  customer: string;
  phone: string;
  address: string;
  type: Type;
  date: string;          // ISO yyyy-mm-ddTHH:mm
  amount: number;        // ₺
  status: Status;
};

type OrderItem = { id: string; name: string; qty: number; price: number }; // price per item

const SEED: Order[] = [
  { id: 'o-1', code: 'ORD-240901', customer: 'Ahmet Yılmaz', phone: '05xx 111 22 33', address: 'Feneryolu, Kadıköy',  type: 'Paket Servis', date: '2025-09-21T19:05:00', amount: 345, status: 'Teslim Edildi' },
  { id: 'o-2', code: 'ORD-240902', customer: 'Ayşe Demir',   phone: '05xx 222 33 44', address: 'Barbaros, Beşiktaş',  type: 'Paket Servis', date: '2025-09-22T12:40:00', amount: 189, status: 'Yolda' },
  { id: 'o-3', code: 'ORD-240903', customer: 'Mert K.',       phone: '05xx 333 44 55', address: 'Kozyatağı, Ataşehir', type: 'Gel-Al',       date: '2025-09-22T13:15:00', amount: 99,  status: 'Teslim Edildi' },
  { id: 'o-4', code: 'ORD-240904', customer: 'Elif S.',       phone: '05xx 444 55 66', address: 'Mecidiyeköy, Şişli',  type: 'Paket Servis', date: '2025-09-23T20:10:00', amount: 258, status: 'Hazırlanıyor' },
  { id: 'o-5', code: 'ORD-240905', customer: 'Onur A.',       phone: '05xx 555 66 77', address: 'Ortaköy, Beşiktaş',   type: 'Yerinde',      date: '2025-09-23T21:05:00', amount: 420, status: 'İptal' },
];

export default function OrderHistoryPage() {
  // filters
  const [q, setQ] = React.useState('');
  const [byStatus, setByStatus] = React.useState<'' | Status>('');
  const [byType, setByType] = React.useState<'' | Type>('');
  const [start, setStart] = React.useState(firstDayOfMonth());
  const [end, setEnd] = React.useState(today());
  const [sortKey, setSortKey] = React.useState<'date' | 'amount'>('date');
  const [sortAsc, setSortAsc] = React.useState(false);

  // data
  const [rows] = React.useState<Order[]>(SEED);

  // pagination
  const [page, setPage] = React.useState(1);
  const pageSize = 8;

  // detail modal state
  const [detail, setDetail] = React.useState<{ order: Order; items: OrderItem[] } | null>(null);

  const filtered = React.useMemo(() => {
    const s = start ? new Date(start) : undefined;
    const e = end ? new Date(end) : undefined;

    let list = rows.filter((r) => {
      const mQ =
        !q ||
        r.code.toLowerCase().includes(q.toLowerCase()) ||
        r.customer.toLowerCase().includes(q.toLowerCase()) ||
        r.phone.replace(/\s/g, '').includes(q.replace(/\s/g, ''));

      const mStatus = !byStatus || r.status === byStatus;
      const mType = !byType || r.type === byType;

      const d = new Date(r.date);
      const inRange = (!s || d >= s) && (!e || d <= addDay(e!));

      return mQ && mStatus && mType && inRange;
    });

    list.sort((a, b) => {
      let v = 0;
      if (sortKey === 'date') v = new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortKey === 'amount') v = a.amount - b.amount;
      return sortAsc ? v : -v;
    });

    return list;
  }, [rows, q, byStatus, byType, start, end, sortKey, sortAsc]);

  const total = filtered.reduce((acc, r) => acc + r.amount, 0);

  // page slice
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = filtered.slice((page - 1) * pageSize, page * pageSize);

  React.useEffect(() => { setPage(1); }, [q, byStatus, byType, start, end]); // filtre değiştiğinde başa dön

  return (
    <div className="space-y-6 overflow-x-hidden">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Sipariş Geçmişi</h1>

        <div className="hidden md:flex items-center gap-2 text-sm text-neutral-500">
          <SortBtn
            active={sortKey === 'date'} asc={sortAsc}
            onClick={() => { setSortKey('date'); setSortAsc(v => !v); }}
            label="Tarih"
          />
          <SortBtn
            active={sortKey === 'amount'} asc={sortAsc}
            onClick={() => { setSortKey('amount'); setSortAsc(v => !v); }}
            label="Tutar"
          />
        </div>
      </div>

      <section className="rounded-2xl border border-neutral-200/70 bg-white shadow-sm soft-card overflow-hidden mx-[-16px] lg:mx-[-24px]">
        {/* Filtreler */}
        <div className="px-4 lg:px-6 py-4 sm:py-6">
          <div className="grid grid-flow-col auto-cols-max items-end gap-3">
            {/* search */}
            <div className="w-[260px] sm:w-[320px] shrink-0">
              <label className="mb-1 block text-sm font-semibold text-neutral-700">Kod / Müşteri / Telefon</label>
              <div className="relative">
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="ORD-..., isim veya telefon"
                  className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 pl-9 outline-none ring-2 ring-transparent transition focus:ring-sky-200"
                />
                <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              </div>
            </div>

            {/* status */}
            <div>
              <label className="mb-1 block text-sm font-semibold text-neutral-700">Durum</label>
              <select
                value={byStatus}
                onChange={(e) => setByStatus(e.target.value as Status | '')}
                className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 outline-none ring-2 ring-transparent transition focus:ring-sky-200"
              >
                <option value="">Tümü</option>
                <option>Hazırlanıyor</option>
                <option>Yolda</option>
                <option>Teslim Edildi</option>
                <option>İptal</option>
              </select>
            </div>

            {/* type */}
            <div>
              <label className="mb-1 block text-sm font-semibold text-neutral-700">Teslimat Tipi</label>
              <select
                value={byType}
                onChange={(e) => setByType(e.target.value as Type | '')}
                className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 outline-none ring-2 ring-transparent transition focus:ring-sky-200"
              >
                <option value="">Tümü</option>
                <option>Paket Servis</option>
                <option>Gel-Al</option>
                <option>Yerinde</option>
              </select>
            </div>

            {/* start */}
            <div>
              <label className="mb-1 block text-sm font-semibold text-neutral-700">Başlangıç</label>
              <input
                type="date"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 outline-none ring-2 ring-transparent transition focus:ring-sky-200"
              />
            </div>

            {/* end */}
            <div>
              <label className="mb-1 block text-sm font-semibold text-neutral-700">Bitiş</label>
              <input
                type="date"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 outline-none ring-2 ring-transparent transition focus:ring-sky-200"
              />
            </div>
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
                {current.map((r) => (
                  <tr key={r.id} className="border-t border-neutral-200/70 hover:bg-neutral-50 align-middle">
                    <td className="px-4 lg:px-6 py-3 whitespace-nowrap">
                      {new Date(r.date).toLocaleString('tr-TR')}
                    </td>
                    <td className="px-4 lg:px-6 py-3 font-medium">{r.code}</td>
                    <td className="px-4 lg:px-6 py-3">
                      <div className="font-medium text-neutral-900">{r.customer}</div>
                      <div className="text-xs text-neutral-500">{r.phone}</div>
                      <div className="text-xs text-neutral-500 truncate max-w-[340px]">{r.address}</div>
                    </td>
                    <td className="px-4 lg:px-6 py-3">{r.type}</td>
                    <td className="px-4 lg:px-6 py-3 font-semibold tabular-nums">
                      {formatCurrency(r.amount)}
                    </td>
                    <td className="px-4 lg:px-6 py-3">
                      <StatusPill status={r.status} />
                    </td>
                    <td className="px-4 lg:px-6 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setDetail({ order: r, items: makeItemsFor(r) })}
                          className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm hover:bg-neutral-50"
                        >
                          Detay
                        </button>
                        <button
                          onClick={() => alert('Yeniden gönder: ' + r.code)}
                          className="rounded-lg bg-orange-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-orange-600"
                        >
                          Yeniden Gönder
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {current.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-sm text-neutral-500">
                      Kayıt bulunamadı.
                    </td>
                  </tr>
                )}
              </tbody>

              {filtered.length > 0 && (
                <tfoot>
                  <tr className="border-t border-neutral-200/70">
                    <td className="px-4 lg:px-6 py-3 text-sm text-neutral-600" colSpan={4}>
                      Toplam {filtered.length} sipariş
                    </td>
                    <td className="px-4 lg:px-6 py-3 font-semibold">{formatCurrency(total)}</td>
                    <td colSpan={2} />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>

        {/* pagination */}
        <div className="flex items-center justify-between px-4 lg:px-6 py-4 border-t">
          <div className="text-sm text-neutral-500">
            Sayfa {page} / {pageCount}
          </div>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm hover:bg-neutral-50 disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              disabled={page >= pageCount}
              onClick={() => setPage(p => Math.min(pageCount, p + 1))}
              className="rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm hover:bg-neutral-50 disabled:opacity-50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Detay Modal */}
      <OrderDetailModal
        open={!!detail}
        order={detail?.order || null}
        items={detail?.items || []}
        onClose={() => setDetail(null)}
      />
    </div>
  );
}

/* ---------- Detay Modal ---------- */
function OrderDetailModal({
  open,
  order,
  items,
  onClose,
}: {
  open: boolean;
  order: Order | null;
  items: OrderItem[];
  onClose: () => void;
}) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open || !order) return null;

  const subtotal = items.reduce((a, i) => a + i.qty * i.price, 0);
  const delivery = order.type === 'Paket Servis' ? 19 : 0;
  const total = subtotal + delivery;

  const courier = fakeCourierFor(order.id);

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        className="absolute left-1/2 top-10 w-[min(720px,92vw)] -translate-x-1/2 rounded-2xl bg-white shadow-xl ring-1 ring-black/5 overflow-hidden"
      >
        {/* header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div>
            <h3 className="text-lg font-semibold text-neutral-900">{order.code}</h3>
            <p className="text-xs text-neutral-500">
              {new Date(order.date).toLocaleString('tr-TR')} • {order.customer}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-2 text-neutral-500 hover:bg-neutral-100"
            aria-label="Kapat"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* body */}
        <div className="grid gap-0 md:grid-cols-[1.2fr_1fr]">
          {/* left: items */}
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
                      <td className="px-4 py-2 text-sm text-right tabular-nums">{formatCurrency(it.price)}</td>
                      <td className="px-4 py-2 text-sm text-right tabular-nums">
                        {formatCurrency(it.qty * it.price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t">
                  <tr>
                    <td colSpan={3} className="px-4 py-2 text-right text-sm text-neutral-600">Ara Toplam</td>
                    <td className="px-4 py-2 text-right font-semibold tabular-nums">{formatCurrency(subtotal)}</td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="px-4 py-2 text-right text-sm text-neutral-600">Kurye</td>
                    <td className="px-4 py-2 text-right font-semibold tabular-nums">{formatCurrency(delivery)}</td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="px-4 py-2 text-right text-sm text-neutral-800">Genel Toplam</td>
                    <td className="px-4 py-2 text-right font-bold tabular-nums">{formatCurrency(total)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* right: courier & meta */}
          <div className="p-5 border-l">
            <div className="text-sm font-semibold text-neutral-700 mb-2">Kurye Bilgisi</div>
            <div className="rounded-xl border border-neutral-200 p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-orange-100 text-orange-700">
                  <Bike className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold text-neutral-900">{courier.name}</div>
                  <div className="text-xs text-neutral-500">{courier.vehicle} • {courier.plate}</div>
                </div>
              </div>
              <div className="text-sm">
                <div className="text-neutral-500">Durum</div>
                <div className="font-medium">{courier.status}</div>
              </div>
              <div className="text-sm">
                <div className="text-neutral-500">Tahmini Varış</div>
                <div className="font-medium">{courier.eta}</div>
              </div>
              <a
                href={`tel:${order.phone.replace(/\s/g, '')}`}
                className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-3 py-2 text-sm font-semibold text-white hover:bg-orange-600"
              >
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
      </div>
    </div>
  );
}

/* ---------- helpers ---------- */
function makeItemsFor(order: Order): OrderItem[] {
  // demo üretim — gerçek hayatta API’den gelir
  const bank: OrderItem[][] = [
    [
      { id: 'i1', name: 'Cheeseburger Menü', qty: 1, price: 179 },
      { id: 'i2', name: 'Patates Kızartması', qty: 1, price: 49 },
      { id: 'i3', name: 'Kola 330ml', qty: 1, price: 29 },
    ],
    [
      { id: 'i1', name: 'Margherita Orta', qty: 1, price: 129 },
      { id: 'i2', name: 'Sufle', qty: 1, price: 39 },
      { id: 'i3', name: 'Ayran', qty: 1, price: 19 },
    ],
    [
      { id: 'i1', name: 'Makarna Alfredo', qty: 1, price: 119 },
      { id: 'i2', name: 'Tiramisu', qty: 1, price: 49 },
    ],
  ];
  const idx = Math.abs(hash(order.id)) % bank.length;
  return bank[idx];
}

function fakeCourierFor(orderId: string) {
  const list = [
    { name: 'Kerem D.', vehicle: 'Motosiklet', plate: '34 ABC 987', status: 'Teslimata çıktı', eta: '10-15 dk' },
    { name: 'Seda K.',  vehicle: 'Motosiklet', plate: '34 XYZ 456', status: 'Restoranda',      eta: 'Hazırlanıyor' },
    { name: 'Umut A.',  vehicle: 'Araba',      plate: '34 KRY 321', status: 'Yolda',            eta: '5-8 dk' },
  ];
  return list[Math.abs(hash(orderId)) % list.length];
}

function hash(s: string) { let h = 0; for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i); return h; }

function StatusPill({ status }: { status: Status }) {
  const map: Record<Status, string> = {
    'Hazırlanıyor': 'bg-amber-500 text-white',
    'Yolda': 'bg-sky-500 text-white',
    'Teslim Edildi': 'bg-emerald-500 text-white',
    'İptal': 'bg-rose-500 text-white',
  };
  return (
    <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold ${map[status]}`}>
      {status}
    </span>
  );
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(n);
}
function today() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}
function firstDayOfMonth() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-01`;
}
function addDay(d: Date) {
  const c = new Date(d); c.setDate(c.getDate() + 1); return c;
}

function SortBtn({ active, asc, onClick, label }: { active: boolean; asc: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={[
        'inline-flex items-center gap-1 rounded-md px-2 py-1',
        active ? 'bg-orange-100 text-orange-700' : 'hover:bg-neutral-100',
      ].join(' ')}
      title={`Sırala (${label})`}
    >
      <SortAsc className={`h-4 w-4 ${asc ? 'rotate-180' : ''}`} />
      {label}
    </button>
  );
}

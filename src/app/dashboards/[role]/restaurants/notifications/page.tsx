// src/app/dashboards/[role]/restaurants/notifications/page.tsx
'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';

/* ====================== Types (English) ====================== */
type NotificationType = 'system' | 'order' | 'payout' | 'marketing';
type NotificationStatus = 'unread' | 'read';

type NotificationItem = {
  id: string;
  title: string;
  body: string;
  type: NotificationType;
  status: NotificationStatus;
  createdAt: Date;
  meta?: {
    orderId?: string;
    amount?: number;
  };
};

/* ====================== Helpers ====================== */
function fmtDate(d: Date) {
  return d.toLocaleString('tr-TR');
}

function typeLabel(t: NotificationType) {
  switch (t) {
    case 'system': return 'Sistem';
    case 'order': return 'Sipariş';
    case 'payout': return 'Ödeme';
    case 'marketing': return 'Duyuru';
  }
}

function statusBadgeClasses(s: NotificationStatus) {
  return s === 'unread'
    ? 'bg-amber-100 text-amber-800'
    : 'bg-emerald-100 text-emerald-700';
}

/* ====================== Demo Seed ====================== */
const DEMO: NotificationItem[] = [
  {
    id: crypto.randomUUID(),
    title: 'Yeni siparişiniz var',
    body: 'Sipariş #10234 oluşturuldu. Hazırlamaya başlayın.',
    type: 'order',
    status: 'unread',
    createdAt: new Date(Date.now() - 1000 * 60 * 10),
    meta: { orderId: '10234' },
  },
  {
    id: crypto.randomUUID(),
    title: 'Haftalık ödeme aktarıldı',
    body: '₺12.450 tutarındaki ödeme hesabınıza gönderildi.',
    type: 'payout',
    status: 'read',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8),
    meta: { amount: 12450 },
  },
  {
    id: crypto.randomUUID(),
    title: 'Planlı bakım bildirimi',
    body: 'Bu gece 02:00–03:00 arası kısa süreli kesinti olabilir.',
    type: 'system',
    status: 'unread',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20),
  },
  {
    id: crypto.randomUUID(),
    title: 'Yeni özellik: Menü içe aktarma',
    body: 'Menünüzü Excel ile toplu içe aktarabilirsiniz.',
    type: 'marketing',
    status: 'read',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 30),
  },
  {
    id: crypto.randomUUID(),
    title: 'Sipariş gecikme uyarısı',
    body: 'Sipariş #10212 hedef süreyi aştı. Kurye ile iletişime geçin.',
    type: 'order',
    status: 'unread',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36),
    meta: { orderId: '10212' },
  },
  {
    id: crypto.randomUUID(),
    title: 'Vergi numarası güncellemesi',
    body: 'Hesap profilinizde yeni vergi numarası kaydedildi.',
    type: 'system',
    status: 'read',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
  },
];

/* ====================== Page ====================== */
export default function RestaurantNotificationsPage() {
  const { role } = useParams<{ role: string }>();

  const [items, setItems] = React.useState<NotificationItem[]>(DEMO);
  const [query, setQuery] = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState<'all' | NotificationType>('all');
  const [statusFilter, setStatusFilter] = React.useState<'all' | NotificationStatus>('all');
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [detail, setDetail] = React.useState<NotificationItem | null>(null);

  // simple client-side pagination (demo)
  const [page, setPage] = React.useState(1);
  const pageSize = 6;

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((n) => {
      const byText = !q || (n.title + ' ' + n.body).toLowerCase().includes(q);
      const byType = typeFilter === 'all' || n.type === typeFilter;
      const byStatus = statusFilter === 'all' || n.status === statusFilter;
      return byText && byType && byStatus;
    });
  }, [items, query, typeFilter, statusFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = React.useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  React.useEffect(() => {
    if (page > pageCount) setPage(1);
  }, [pageCount, page]);

  /* ---------- Actions ---------- */
  function toggleSelect(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }
  function toggleSelectAll(currentPageIds: string[]) {
    setSelectedIds(prev => {
      const allSelected = currentPageIds.every(id => prev.has(id));
      const next = new Set(prev);
      if (allSelected) {
        currentPageIds.forEach(id => next.delete(id));
      } else {
        currentPageIds.forEach(id => next.add(id));
      }
      return next;
    });
  }
  function markAsRead(ids: string[]) {
    if (ids.length === 0) return;
    setItems(prev => prev.map(n => ids.includes(n.id) ? { ...n, status: 'read' } : n));
    setSelectedIds(new Set());
  }
  function markAllAsRead() {
    setItems(prev => prev.map(n => ({ ...n, status: 'read' })));
    setSelectedIds(new Set());
  }
  function deleteSelected(ids: string[]) {
    if (ids.length === 0) return;
    if (!confirm('Seçili bildirimler silinsin mi?')) return;
    setItems(prev => prev.filter(n => !ids.includes(n.id)));
    setSelectedIds(new Set());
  }
  function clearFilters() {
    setQuery('');
    setTypeFilter('all');
    setStatusFilter('all');
    setPage(1);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Bildirimler</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={markAllAsRead}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700"
          >
            Tümünü Okundu Yap
          </button>
        </div>
      </div>

      {/* Filters */}
      <section className="rounded-2xl border border-neutral-200/70 bg-white shadow-sm">
        <div className="grid gap-3 p-4 md:grid-cols-4">
          <div className="md:col-span-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ara: başlık veya içerik…"
              className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 text-neutral-800 outline-none ring-2 ring-transparent transition placeholder:text-neutral-400 focus:bg-white focus:ring-sky-200"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-neutral-600">Tür</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="rounded-lg border border-neutral-300 bg-neutral-100 px-3 py-2 text-sm"
            >
              <option value="all">Tümü</option>
              <option value="order">Sipariş</option>
              <option value="payout">Ödeme</option>
              <option value="system">Sistem</option>
              <option value="marketing">Duyuru</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-neutral-600">Durum</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="rounded-lg border border-neutral-300 bg-neutral-100 px-3 py-2 text-sm"
            >
              <option value="all">Tümü</option>
              <option value="unread">Okunmadı</option>
              <option value="read">Okundu</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t px-4 py-3">
          <div className="text-xs text-neutral-500">
            Toplam <strong>{filtered.length}</strong> bildirim
          </div>
          <button
            onClick={clearFilters}
            className="rounded-lg bg-neutral-200 px-3 py-1.5 text-xs font-semibold text-neutral-800 hover:bg-neutral-300"
          >
            Filtreleri Sıfırla
          </button>
        </div>
      </section>

      {/* Table */}
      <section className="rounded-2xl border border-neutral-200/70 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full border-t border-neutral-200/70">
            <thead>
              <tr className="text-left text-sm text-neutral-500">
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    aria-label="Sayfadaki tümünü seç"
                    checked={paged.length > 0 && paged.every(n => selectedIds.has(n.id))}
                    onChange={() => toggleSelectAll(paged.map(n => n.id))}
                  />
                </th>
                <th className="px-4 py-3 font-medium">Başlık</th>
                <th className="px-4 py-3 font-medium w-[140px]">Tür</th>
                <th className="px-4 py-3 font-medium w-[120px]">Durum</th>
                <th className="px-4 py-3 font-medium w-[180px]">Tarih</th>
                <th className="px-4 py-3 font-medium w-[220px]"></th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-neutral-500">
                    Kayıt yok.
                  </td>
                </tr>
              )}

              {paged.map((n) => (
                <tr key={n.id} className="border-t border-neutral-200/70 hover:bg-neutral-50">
                  <td className="px-4 py-3 align-top">
                    <input
                      type="checkbox"
                      aria-label="Seç"
                      checked={selectedIds.has(n.id)}
                      onChange={() => toggleSelect(n.id)}
                    />
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div className="font-semibold text-neutral-900">{n.title}</div>
                    <div className="mt-1 line-clamp-2 text-sm text-neutral-600">{n.body}</div>
                    {/* meta örneği */}
                    {!!n.meta?.orderId && (
                      <div className="mt-1 text-xs text-neutral-500">Sipariş No: #{n.meta.orderId}</div>
                    )}
                    {typeof n.meta?.amount === 'number' && (
                      <div className="mt-1 text-xs text-neutral-500">Tutar: ₺{n.meta.amount.toLocaleString('tr-TR')}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 align-top">{typeLabel(n.type)}</td>
                  <td className="px-4 py-3 align-top">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadgeClasses(n.status)}`}>
                      {n.status === 'unread' ? 'Okunmadı' : 'Okundu'}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-top">{fmtDate(n.createdAt)}</td>
                  <td className="px-4 py-3 align-top">
                    <div className="flex items-center justify-end gap-2">
                      {n.status === 'unread' && (
                        <button
                          onClick={() => markAsRead([n.id])}
                          className="rounded-lg bg-indigo-500 px-3 py-1.5 text-sm font-semibold text-white shadow hover:bg-indigo-600"
                        >
                          Okundu İşaretle
                        </button>
                      )}
                      <button
                        onClick={() => setDetail(n)}
                        className="rounded-lg bg-sky-500 px-3 py-1.5 text-sm font-semibold text-white shadow hover:bg-sky-600"
                      >
                        Görüntüle
                      </button>
                      <button
                        onClick={() => deleteSelected([n.id])}
                        className="rounded-lg bg-rose-500 px-3 py-1.5 text-sm font-semibold text-white shadow hover:bg-rose-600"
                      >
                        Sil
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>

            {paged.length > 0 && (
              <tfoot>
                <tr>
                  <td colSpan={6} className="border-t border-neutral-200/70">
                    <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => markAsRead(Array.from(selectedIds))}
                          disabled={selectedIds.size === 0}
                          className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-600 disabled:opacity-50"
                        >
                          Seçilileri Okundu Yap
                        </button>
                        <button
                          onClick={() => deleteSelected(Array.from(selectedIds))}
                          disabled={selectedIds.size === 0}
                          className="rounded-xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-rose-600 disabled:opacity-50"
                        >
                          Seçilileri Sil
                        </button>
                      </div>

                      {/* Pagination (demo) */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setPage(p => Math.max(1, p - 1))}
                          disabled={page === 1}
                          className="rounded-lg bg-neutral-200 px-3 py-1.5 text-sm font-medium text-neutral-800 hover:bg-neutral-300 disabled:opacity-50"
                        >
                          Önceki
                        </button>
                        <span className="text-sm text-neutral-700">
                          Sayfa <strong>{page}</strong> / {pageCount}
                        </span>
                        <button
                          onClick={() => setPage(p => Math.min(pageCount, p + 1))}
                          disabled={page === pageCount}
                          className="rounded-lg bg-neutral-200 px-3 py-1.5 text-sm font-medium text-neutral-800 hover:bg-neutral-300 disabled:opacity-50"
                        >
                          Sonraki
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </section>

      {/* Detail Side Panel */}
      {detail && (
        <DetailDrawer
          item={detail}
          onClose={() => setDetail(null)}
          onMarkRead={() => {
            markAsRead([detail.id]);
            setDetail(prev => prev ? { ...prev, status: 'read' } : prev);
          }}
          onDelete={() => {
            deleteSelected([detail.id]);
            setDetail(null);
          }}
        />
      )}
    </div>
  );
}

/* ====================== Detail Drawer ====================== */

function DetailDrawer({
  item,
  onClose,
  onMarkRead,
  onDelete,
}: {
  item: NotificationItem;
  onClose: () => void;
  onMarkRead: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 grid bg-black/40">
      <div className="ml-auto h-full w-full max-w-xl bg-white shadow-2xl animate-in slide-in-from-right">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div>
            <h3 className="text-lg font-semibold">{item.title}</h3>
            <div className="mt-1 text-xs text-neutral-500">{fmtDate(item.createdAt)}</div>
          </div>
          <button
            onClick={onClose}
            aria-label="Kapat"
            className="rounded-full p-2 hover:bg-neutral-100"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 p-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadgeClasses(item.status)}`}>
              {item.status === 'unread' ? 'Okunmadı' : 'Okundu'}
            </span>
            <span className="inline-flex items-center rounded-full bg-neutral-200 px-2.5 py-1 text-xs font-semibold text-neutral-700">
              {typeLabel(item.type)}
            </span>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-neutral-900 whitespace-pre-wrap">
            {item.body}
          </div>

          {/* Meta örnekleri */}
          {(item.meta?.orderId || typeof item.meta?.amount === 'number') && (
            <div className="rounded-xl border border-neutral-200 bg-white p-4 text-sm">
              <div className="mb-2 text-neutral-600">Ek Bilgi</div>
              {item.meta?.orderId && (
                <div className="text-neutral-800">Sipariş No: #{item.meta.orderId}</div>
              )}
              {typeof item.meta?.amount === 'number' && (
                <div className="text-neutral-800">Tutar: ₺{item.meta.amount.toLocaleString('tr-TR')}</div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t px-5 py-4">
          {item.status === 'unread' && (
            <button
              onClick={onMarkRead}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700"
            >
              Okundu İşaretle
            </button>
          )}
          <button
            onClick={onDelete}
            className="rounded-xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-rose-600"
          >
            Sil
          </button>
          <button
            onClick={onClose}
            className="rounded-xl bg-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-300"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}

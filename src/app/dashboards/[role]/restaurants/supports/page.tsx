// src/app/dashboards/[role]/restaurants/supports/page.tsx
'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';

/* ====================== Types (English) ====================== */
type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
type TicketPriority = 'low' | 'medium' | 'high';

type SupportTicket = {
  id: string;
  subject: string;
  category: string;
  priority: TicketPriority;
  status: TicketStatus;
  createdAt: Date;
  updatedAt: Date;
  requesterName: string;
  requesterEmail: string;
  messages: Array<{
    id: string;
    author: 'you' | 'support';
    body: string;
    createdAt: Date;
    internal?: boolean; // demo: iç not
  }>;
};

/* ====================== Helpers ====================== */
function fmtDate(d: Date) {
  return d.toLocaleString('tr-TR');
}
function badgeForStatus(s: TicketStatus) {
  switch (s) {
    case 'open': return 'bg-amber-100 text-amber-800';
    case 'in_progress': return 'bg-indigo-100 text-indigo-700';
    case 'resolved': return 'bg-emerald-100 text-emerald-700';
    case 'closed': return 'bg-neutral-200 text-neutral-700';
  }
}
function labelForStatus(s: TicketStatus) {
  return s === 'open' ? 'Açık'
    : s === 'in_progress' ? 'İşlemde'
    : s === 'resolved' ? 'Çözüldü'
    : 'Kapalı';
}
function badgeForPriority(p: TicketPriority) {
  return p === 'high' ? 'bg-rose-100 text-rose-700'
    : p === 'medium' ? 'bg-amber-100 text-amber-800'
    : 'bg-neutral-200 text-neutral-700';
}
function labelForPriority(p: TicketPriority) {
  return p === 'high' ? 'Yüksek' : p === 'medium' ? 'Orta' : 'Düşük';
}

/* ====================== Demo seed ====================== */
const DEMO_TICKETS: SupportTicket[] = [
  {
    id: crypto.randomUUID(),
    subject: 'Menü senkronizasyonu başarısız',
    category: 'Entegrasyon',
    priority: 'high',
    status: 'open',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 1),
    requesterName: 'Yüksel Restoran',
    requesterEmail: 'destek@ornekrestoran.com',
    messages: [
      {
        id: crypto.randomUUID(),
        author: 'you',
        body: 'Merhaba, Trendyol menü aktarımları “401” hatası veriyor.',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8),
      },
      {
        id: crypto.randomUUID(),
        author: 'support',
        body: 'Merhaba, API anahtarınızı güncelleyip tekrar dener misiniz?',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
      },
    ],
  },
  {
    id: crypto.randomUUID(),
    subject: 'Kuryeye bildirim gitmiyor',
    category: 'Operasyon',
    priority: 'medium',
    status: 'in_progress',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    updatedAt: new Date(Date.now() - 1000 * 60 * 30),
    requesterName: 'Yemekhanem',
    requesterEmail: 'iletisim@yemekhanem.com',
    messages: [
      {
        id: crypto.randomUUID(),
        author: 'you',
        body: 'Son 2 siparişte kurye app’e bildirim düşmedi.',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
      },
    ],
  },
  {
    id: crypto.randomUUID(),
    subject: 'Fatura bilgisi değişikliği',
    category: 'Finans',
    priority: 'low',
    status: 'resolved',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
    requesterName: 'Pideci Usta',
    requesterEmail: 'info@pideciusta.com',
    messages: [
      {
        id: crypto.randomUUID(),
        author: 'you',
        body: 'Unvanımız ve vergi numaramız güncellendi, faturaya yansır mı?',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
      },
      {
        id: crypto.randomUUID(),
        author: 'support',
        body: 'Güncellendi, sonraki faturaya otomatik yansıyacak.',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4),
      },
    ],
  },
];

/* ====================== Page ====================== */
export default function RestaurantSupportsPage() {
  const { role } = useParams<{ role: string }>(); // path göstermek istersen
  const [tickets, setTickets] = React.useState<SupportTicket[]>(DEMO_TICKETS);
  const [query, setQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<'all' | TicketStatus>('all');
  const [priorityFilter, setPriorityFilter] = React.useState<'all' | TicketPriority>('all');
  const [selected, setSelected] = React.useState<SupportTicket | null>(null);
  const [openCreate, setOpenCreate] = React.useState(false);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return tickets.filter(t => {
      const byText = !q || [t.subject, t.category, t.requesterName, t.requesterEmail]
        .join(' ')
        .toLowerCase()
        .includes(q);
      const byStatus = statusFilter === 'all' || t.status === statusFilter;
      const byPriority = priorityFilter === 'all' || t.priority === priorityFilter;
      return byText && byStatus && byPriority;
    });
  }, [tickets, query, statusFilter, priorityFilter]);

  function updateStatus(id: string, next: TicketStatus) {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status: next, updatedAt: new Date() } : t));
  }

  function addMessage(id: string, body: string, internal = false) {
    setTickets(prev => prev.map(t => {
      if (t.id !== id) return t;
      const msg = {
        id: crypto.randomUUID(),
        author: 'you' as const,
        body,
        createdAt: new Date(),
        internal,
      };
      return { ...t, messages: [...t.messages, msg], updatedAt: new Date() };
    }));
  }

  function createTicket(input: {
    subject: string;
    category: string;
    priority: TicketPriority;
    body: string;
    requesterName: string;
    requesterEmail: string;
  }) {
    const now = new Date();
    const newTicket: SupportTicket = {
      id: crypto.randomUUID(),
      subject: input.subject,
      category: input.category,
      priority: input.priority,
      status: 'open',
      createdAt: now,
      updatedAt: now,
      requesterName: input.requesterName,
      requesterEmail: input.requesterEmail,
      messages: [{
        id: crypto.randomUUID(),
        author: 'you',
        body: input.body,
        createdAt: now,
      }],
    };
    setTickets(prev => [newTicket, ...prev]);
    setOpenCreate(false);
    setSelected(newTicket);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Destek Talepleri</h1>
        <div className="flex items-center gap-2">
          <button
            className="rounded-xl bg-neutral-200 px-4 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-300"
            onClick={() => setOpenCreate(true)}
          >
            Yeni Talep Oluştur
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
              placeholder="Ara: konu, kategori, ad, e-posta…"
              className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 text-neutral-800 outline-none ring-2 ring-transparent transition placeholder:text-neutral-400 focus:bg-white focus:ring-sky-200"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-neutral-600">Durum</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="rounded-lg border border-neutral-300 bg-neutral-100 px-3 py-2 text-sm"
            >
              <option value="all">Tümü</option>
              <option value="open">Açık</option>
              <option value="in_progress">İşlemde</option>
              <option value="resolved">Çözüldü</option>
              <option value="closed">Kapalı</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-neutral-600">Öncelik</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as any)}
              className="rounded-lg border border-neutral-300 bg-neutral-100 px-3 py-2 text-sm"
            >
              <option value="all">Tümü</option>
              <option value="high">Yüksek</option>
              <option value="medium">Orta</option>
              <option value="low">Düşük</option>
            </select>
          </div>
        </div>
      </section>

      {/* Table */}
      <section className="rounded-2xl border border-neutral-200/70 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full border-t border-neutral-200/70">
            <thead>
              <tr className="text-left text-sm text-neutral-500">
                <th className="px-4 py-3 font-medium">Konu</th>
                <th className="px-4 py-3 font-medium w-[160px]">Kategori</th>
                <th className="px-4 py-3 font-medium w-[130px]">Öncelik</th>
                <th className="px-4 py-3 font-medium w-[130px]">Durum</th>
                <th className="px-4 py-3 font-medium w-[180px]">Güncelleme</th>
                <th className="px-4 py-3 font-medium w-[180px]">Oluşturma</th>
                <th className="px-4 py-3 font-medium w-[160px]"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-sm text-neutral-500">
                    Kayıt yok. Sağ üstten <strong>“Yeni Talep Oluştur”</strong> ile yeni bir talep açabilirsiniz.
                  </td>
                </tr>
              )}

              {filtered.map(t => (
                <tr key={t.id} className="border-t border-neutral-200/70 align-top hover:bg-neutral-50">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-neutral-900">{t.subject}</div>
                    <div className="mt-1 text-xs text-neutral-500">
                      {t.requesterName} • {t.requesterEmail}
                    </div>
                  </td>
                  <td className="px-4 py-3">{t.category}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${badgeForPriority(t.priority)}`}>
                      {labelForPriority(t.priority)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${badgeForStatus(t.status)}`}>
                      {labelForStatus(t.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3">{fmtDate(t.updatedAt)}</td>
                  <td className="px-4 py-3">{fmtDate(t.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelected(t)}
                        className="rounded-lg bg-sky-500 px-3 py-1.5 text-sm font-semibold text-white shadow hover:bg-sky-600"
                      >
                        Görüntüle
                      </button>
                      <MenuStatus t={t} onChange={(s) => updateStatus(t.id, s)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Create modal */}
      {openCreate && (
        <CreateTicketModal
          onClose={() => setOpenCreate(false)}
          onCreate={createTicket}
        />
      )}

      {/* Detail modal */}
      {selected && (
        <DetailModal
          ticket={selected}
          onClose={() => setSelected(null)}
          onReply={(text) => addMessage(selected.id, text, false)}
          onAddInternal={(text) => addMessage(selected.id, text, true)}
          onStatus={(s) => updateStatus(selected.id, s)}
        />
      )}
    </div>
  );
}

/* ====================== Small components ====================== */

function MenuStatus({ t, onChange }: { t: SupportTicket; onChange: (s: TicketStatus) => void }) {
  return (
    <div className="relative">
      <select
        value={t.status}
        onChange={(e) => onChange(e.target.value as TicketStatus)}
        className="rounded-lg border border-neutral-300 bg-neutral-100 px-3 py-1.5 text-sm"
        aria-label="Durumu güncelle"
      >
        <option value="open">Açık</option>
        <option value="in_progress">İşlemde</option>
        <option value="resolved">Çözüldü</option>
        <option value="closed">Kapalı</option>
      </select>
    </div>
  );
}

function CreateTicketModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (input: {
    subject: string;
    category: string;
    priority: TicketPriority;
    body: string;
    requesterName: string;
    requesterEmail: string;
  }) => void;
}) {
  const [subject, setSubject] = React.useState('');
  const [category, setCategory] = React.useState('Genel');
  const [priority, setPriority] = React.useState<TicketPriority>('medium');
  const [body, setBody] = React.useState('');
  const [requesterName, setRequesterName] = React.useState('Restoranım');
  const [requesterEmail, setRequesterEmail] = React.useState('info@restoranim.com');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!subject.trim() || !body.trim()) return;
    onCreate({
      subject: subject.trim(),
      category: category.trim(),
      priority,
      body: body.trim(),
      requesterName: requesterName.trim() || 'Restoran',
      requesterEmail: requesterEmail.trim() || 'iletisim@restoran.com',
    });
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-start overflow-y-auto bg-black/50 p-4">
      <div className="mx-auto w-full max-w-3xl rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h3 className="text-xl font-semibold">Yeni Talep</h3>
          <button className="rounded-full p-2 hover:bg-neutral-100" onClick={onClose} aria-label="Kapat">✕</button>
        </div>

        <form onSubmit={submit} className="space-y-4 p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">Talep Konusu</label>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-sky-200"
                placeholder="Örn: Kuryeye bildirim gitmiyor"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">Kategori</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-sky-200"
              >
                <option>Genel</option>
                <option>Operasyon</option>
                <option>Finans</option>
                <option>Entegrasyon</option>
                <option>Teknik</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">Öncelik</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TicketPriority)}
                className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-sky-200"
              >
                <option value="low">Düşük</option>
                <option value="medium">Orta</option>
                <option value="high">Yüksek</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">E-posta</label>
              <input
                value={requesterEmail}
                onChange={(e) => setRequesterEmail(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-sky-200"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-neutral-700">Ad</label>
              <input
                value={requesterName}
                onChange={(e) => setRequesterName(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-sky-200"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Açıklama</label>
            <textarea
              rows={5}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-sky-200"
              placeholder="Sorunu mümkün olduğunca detaylı anlatın…"
            />
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-300"
            >
              İptal
            </button>
            <button
              type="submit"
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700"
              disabled={!subject.trim() || !body.trim()}
            >
              Talep Oluştur (Demo)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DetailModal({
  ticket,
  onClose,
  onReply,
  onAddInternal,
  onStatus,
}: {
  ticket: SupportTicket;
  onClose: () => void;
  onReply: (text: string) => void;
  onAddInternal: (text: string) => void;
  onStatus: (s: TicketStatus) => void;
}) {
  const [message, setMessage] = React.useState('');
  const [tab, setTab] = React.useState<'conversation' | 'internal'>('conversation');

  function send() {
    if (!message.trim()) return;
    if (tab === 'conversation') onReply(message.trim());
    else onAddInternal(message.trim());
    setMessage('');
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-start overflow-y-auto bg-black/50 p-4">
      <div className="mx-auto w-full max-w-4xl rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div>
            <h3 className="text-xl font-semibold">{ticket.subject}</h3>
            <div className="mt-1 text-xs text-neutral-500">
              {ticket.requesterName} • {ticket.requesterEmail}
            </div>
          </div>
          <button className="rounded-full p-2 hover:bg-neutral-100" onClick={onClose} aria-label="Kapat">✕</button>
        </div>

        <div className="grid gap-4 p-5 md:grid-cols-3">
          {/* Left: info */}
          <div className="space-y-3">
            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
              <div className="text-xs text-neutral-500">Durum</div>
              <div className="mt-1">
                <select
                  value={ticket.status}
                  onChange={(e) => onStatus(e.target.value as TicketStatus)}
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm"
                >
                  <option value="open">Açık</option>
                  <option value="in_progress">İşlemde</option>
                  <option value="resolved">Çözüldü</option>
                  <option value="closed">Kapalı</option>
                </select>
              </div>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
              <div className="text-xs text-neutral-500">Öncelik</div>
              <div className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${badgeForPriority(ticket.priority)}`}>
                {labelForPriority(ticket.priority)}
              </div>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3 text-sm">
              <div><span className="text-neutral-500">Kategori:</span> {ticket.category}</div>
              <div className="mt-1"><span className="text-neutral-500">Oluşturma:</span> {fmtDate(ticket.createdAt)}</div>
              <div className="mt-1"><span className="text-neutral-500">Güncelleme:</span> {fmtDate(ticket.updatedAt)}</div>
            </div>
          </div>

          {/* Right: conversation */}
          <div className="md:col-span-2">
            <div className="mb-3 flex items-center gap-2">
              <button
                className={`rounded-lg px-3 py-1.5 text-sm ${tab === 'conversation' ? 'bg-indigo-600 text-white' : 'bg-neutral-200 text-neutral-800'}`}
                onClick={() => setTab('conversation')}
              >
                Mesajlaşma
              </button>
              <button
                className={`rounded-lg px-3 py-1.5 text-sm ${tab === 'internal' ? 'bg-indigo-600 text-white' : 'bg-neutral-200 text-neutral-800'}`}
                onClick={() => setTab('internal')}
              >
                İç Not
              </button>
            </div>

            <div className="space-y-3 max-h-[50vh] overflow-y-auto rounded-xl border border-neutral-200 p-3">
              {ticket.messages.map(m => (
                <div key={m.id} className={`rounded-lg p-3 ${m.internal ? 'bg-yellow-50 border border-amber-200' : m.author === 'you' ? 'bg-indigo-50 border border-indigo-100' : 'bg-neutral-50 border border-neutral-200'}`}>
                  <div className="mb-1 flex items-center justify-between text-xs text-neutral-500">
                    <span>{m.internal ? 'İç Not' : (m.author === 'you' ? 'Siz' : 'Destek')}</span>
                    <span>{fmtDate(m.createdAt)}</span>
                  </div>
                  <div className="whitespace-pre-wrap text-sm text-neutral-900">{m.body}</div>
                </div>
              ))}
              {ticket.messages.length === 0 && (
                <div className="text-sm text-neutral-500">Henüz mesaj yok.</div>
              )}
            </div>

            <div className="mt-3 flex items-start gap-2">
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={tab === 'conversation' ? 'Mesajınızı yazın…' : 'İç not ekleyin (müşteri görmez)…'}
                className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-sky-200"
              />
              <button
                onClick={send}
                className="h-[42px] rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow hover:bg-indigo-700"
              >
                Gönder (Demo)
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t px-5 py-4">
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

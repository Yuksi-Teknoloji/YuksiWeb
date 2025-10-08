// src/app/dashboards/[role]/restaurants/buy-package/page.tsx
'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';

/* ===================== Types (English) ===================== */
type PackagePlan = {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;          // base price per month
  perVehiclePrice?: number;      // optional add-on per vehicle per month
  features: string[];
  popular?: boolean;
};

type PurchasePayload = {
  packageId: string;
  months: number;
  vehicles: number;
  paymentMethod: PaymentMethod;
  note?: string;
  couponCode?: string;
  totalPrice: number;
};

enum PaymentMethod {
  CreditCard = 'credit_card',
  Transfer = 'bank_transfer',
  Cash = 'cash',
}

/* ===================== Demo data ===================== */
const DEMO_PLANS: PackagePlan[] = [
  {
    id: 'starter',
    name: 'Başlangıç',
    description: 'Küçük işletmeler için temel paket.',
    monthlyPrice: 399,
    perVehiclePrice: 0,
    features: ['Temel sipariş yönetimi', 'E-posta desteği', '1 şube'],
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Büyüyen restoranlar için önerilir.',
    monthlyPrice: 899,
    perVehiclePrice: 49,
    features: ['Gelişmiş raporlama', 'Öncelikli destek', '3 şube', 'Sürücü yönetimi'],
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Kurumsal',
    description: 'Yüksek hacimli operasyonlar için.',
    monthlyPrice: 1899,
    perVehiclePrice: 39,
    features: ['SLA destek', 'Sınırsız şube', 'Gelişmiş entegrasyonlar'],
  },
];

/* Aktif paket örnek kaydı için tip (sadece UI) */
type ActivePackageRow = {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  vehicles: number;
  months: number;
  totalPaid: number;
};

function fmtCurrency(n: number) {
  return n.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 });
}

function addMonths(date: Date, months: number) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function fmtDate(d: Date) {
  return d.toLocaleDateString('tr-TR');
}

export default function BuyPackagePage() {
  const { role } = useParams<{ role: string }>(); // path için gerekirse
  const [plans] = React.useState<PackagePlan[]>(DEMO_PLANS);
  const [active, setActive] = React.useState<ActivePackageRow[]>([]);

  // seçim & form state
  const [selectedId, setSelectedId] = React.useState<string>(plans.find(p => p.popular)?.id ?? plans[0].id);
  const [months, setMonths] = React.useState<number>(3);
  const [vehicles, setVehicles] = React.useState<number>(1);
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethod>(PaymentMethod.CreditCard);
  const [coupon, setCoupon] = React.useState<string>('');
  const [note, setNote] = React.useState<string>('');
  const [submitting, setSubmitting] = React.useState(false);
  const [msg, setMsg] = React.useState<string | null>(null);

  const selectedPlan = React.useMemo(
    () => plans.find(p => p.id === selectedId)!,
    [plans, selectedId]
  );

  const discountRate = React.useMemo(() => {
    // Demo kupon: YUKSI10 => %10 indirim
    return coupon.trim().toUpperCase() === 'YUKSI10' ? 0.1 : 0;
  }, [coupon]);

  const total = React.useMemo(() => {
    const base = selectedPlan.monthlyPrice * months;
    const addOn = (selectedPlan.perVehiclePrice ?? 0) * Math.max(vehicles - 1, 0) * months;
    const subtotal = base + addOn;
    const discount = Math.round(subtotal * discountRate);
    return Math.max(0, subtotal - discount);
  }, [selectedPlan, months, vehicles, discountRate]);

  async function submitDemo(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMsg(null);

    const payload: PurchasePayload = {
      packageId: selectedPlan.id,
      months,
      vehicles,
      paymentMethod,
      note: note.trim() || undefined,
      couponCode: coupon.trim() || undefined,
      totalPrice: total,
    };

    // Demo: API yerine 900ms simülasyon
    setTimeout(() => {
      const now = new Date();
      const row: ActivePackageRow = {
        id: crypto.randomUUID(),
        name: selectedPlan.name,
        startDate: now,
        endDate: addMonths(now, months),
        vehicles,
        months,
        totalPaid: payload.totalPrice,
      };
      setActive(prev => [row, ...prev]);
      setMsg('Paket satın alındı (DEMO).');
      setSubmitting(false);
    }, 900);
  }

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Paket Satın Al</h1>
        <div className="text-sm text-neutral-500">Panel: {role}</div>
      </div>

      {/* Bilgi */}
      <div className="rounded-2xl border border-neutral-200/70 bg-white p-4 shadow-sm">
        <p className="text-neutral-700">
          Aşağıdan işletmenize uygun paketi seçin, süre ve araç sayısını belirleyin. Bu sayfa
          <strong> demo</strong> amaçlıdır; ödeme ve API çağrıları yapılmaz.
        </p>
      </div>

      {/* İçerik */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Paket kartları */}
        <section className="lg:col-span-2 rounded-2xl border border-neutral-200/70 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold">Paketler</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {plans.map((p) => {
              const isSelected = p.id === selectedId;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedId(p.id)}
                  className={`rounded-xl border p-4 text-left transition hover:shadow-sm ${
                    isSelected ? 'border-indigo-500 ring-2 ring-indigo-200 bg-indigo-50/40' : 'border-neutral-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-base font-semibold text-neutral-900">{p.name}</h3>
                    {p.popular && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                        Popüler
                      </span>
                    )}
                  </div>
                  <div className="mt-1 text-sm text-neutral-600">{p.description}</div>
                  <div className="mt-3 text-2xl font-bold text-neutral-900">
                    {fmtCurrency(p.monthlyPrice)} <span className="text-sm font-medium text-neutral-500">/ ay</span>
                  </div>
                  {p.perVehiclePrice ? (
                    <div className="mt-1 text-xs text-neutral-600">
                      + {fmtCurrency(p.perVehiclePrice)} / ay (her ilave araç)
                    </div>
                  ) : null}
                  <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-neutral-700">
                    {p.features.map((f, i) => <li key={i}>{f}</li>)}
                  </ul>
                </button>
              );
            })}
          </div>
        </section>

        {/* Satın alma formu */}
        <section className="rounded-2xl border border-neutral-200/70 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold">Satın Alma</h2>

          <form onSubmit={submitDemo} className="space-y-4">
            <div>
              <div className="text-sm text-neutral-500">Seçili Paket</div>
              <div className="mt-1 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 font-medium">
                {selectedPlan.name}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">Süre (Ay)</label>
                <input
                  type="number"
                  min={1}
                  value={months}
                  onChange={(e) => setMonths(Math.max(1, Number(e.target.value || 1)))}
                  className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-sky-200"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">Araç Sayısı</label>
                <input
                  type="number"
                  min={1}
                  value={vehicles}
                  onChange={(e) => setVehicles(Math.max(1, Number(e.target.value || 1)))}
                  className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-sky-200"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">Ödeme Yöntemi</label>
              <div className="grid gap-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === PaymentMethod.CreditCard}
                    onChange={() => setPaymentMethod(PaymentMethod.CreditCard)}
                  />
                  <span>Kredi Kartı</span>
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === PaymentMethod.Transfer}
                    onChange={() => setPaymentMethod(PaymentMethod.Transfer)}
                  />
                  <span>Havale / EFT</span>
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === PaymentMethod.Cash}
                    onChange={() => setPaymentMethod(PaymentMethod.Cash)}
                  />
                  <span>Nakit</span>
                </label>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">Kupon</label>
                <input
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  placeholder="Örn: YUKSI10"
                  className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-sky-200"
                />
                {discountRate > 0 && (
                  <div className="mt-1 text-xs text-emerald-600">%10 indirim uygulandı.</div>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">Tahmini Toplam</label>
                <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-lg font-semibold">
                  {fmtCurrency(total)}
                </div>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">Not (opsiyonel)</label>
              <textarea
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Siparişe dair açıklama ekleyebilirsiniz…"
                className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-sky-200"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700 disabled:opacity-60"
            >
              {submitting ? 'İşlem yapılıyor…' : 'Satın Al (Demo)'}
            </button>

            {msg && (
              <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                {msg}
              </div>
            )}
          </form>
        </section>
      </div>

      {/* Aktif paketler tablosu */}
      <section className="rounded-2xl border border-neutral-200/70 bg-white shadow-sm">
        <div className="p-4">
          <h2 className="text-lg font-semibold">Aktif Paketlerim (Demo)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full border-t border-neutral-200/70">
            <thead>
              <tr className="text-left text-sm text-neutral-500">
                <th className="px-4 py-3 font-medium">Paket</th>
                <th className="px-4 py-3 font-medium">Başlangıç</th>
                <th className="px-4 py-3 font-medium">Bitiş</th>
                <th className="px-4 py-3 font-medium">Ay</th>
                <th className="px-4 py-3 font-medium">Araç</th>
                <th className="px-4 py-3 font-medium">Ödenen</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {active.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-sm text-neutral-500">
                    Henüz aktif paket yok. Üstten bir paket satın aldığınızda burada listelenir.
                  </td>
                </tr>
              )}
              {active.map((r) => (
                <tr key={r.id} className="border-t border-neutral-200/70">
                  <td className="px-4 py-3 font-medium text-neutral-900">{r.name}</td>
                  <td className="px-4 py-3">{fmtDate(r.startDate)}</td>
                  <td className="px-4 py-3">{fmtDate(r.endDate)}</td>
                  <td className="px-4 py-3">{r.months}</td>
                  <td className="px-4 py-3">{r.vehicles}</td>
                  <td className="px-4 py-3">{fmtCurrency(r.totalPaid)}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setActive(prev => prev.filter(x => x.id !== r.id))}
                      className="rounded-lg bg-rose-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-rose-600"
                    >
                      Kaldır (Demo)
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

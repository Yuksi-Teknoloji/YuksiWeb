// src/app/dashboards/[role]/restaurants/buy-package/page.tsx
'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';

/* ===================== DEMO: negotiated price ===================== */
/** Normalde bu değer admin panelinden her işletme için ayrı kaydedilir.
 *  Demo’da yerel mock’tan okunuyor; yoksa 80 TL varsayılıyor.
 */
type NegotiatedPrice = {
  unitPriceTRY: number;          // 1 paket için anlaşmalı birim fiyat (TRY)
  currency: 'TRY';
  minPackages?: number;          // istersen alt sınır
  maxPackages?: number;          // istersen üst sınır
};

function loadNegotiatedPriceDemo(): NegotiatedPrice {
  // Demo: URL’de ?unit=90 girilirse 90 TL olsun, yoksa 80 TL
  if (typeof window !== 'undefined') {
    const u = new URLSearchParams(window.location.search).get('unit');
    const n = Number(u);
    if (!Number.isNaN(n) && n > 0) return { unitPriceTRY: Math.round(n), currency: 'TRY', minPackages: 10 };
  }
  return { unitPriceTRY: 80, currency: 'TRY', minPackages: 10 };
}

/* ===================== Types ===================== */
type PurchaseRow = {
  id: string;
  createdAt: Date;
  packageCount: number;
  unitPrice: number;
  totalPaid: number;
  paymentMethod: PaymentMethod;
  status: 'pending' | 'paid' | 'failed';
  mockPaymentUrl: string;
};

enum PaymentMethod {
  CreditCard = 'credit_card',
  Transfer = 'bank_transfer',
  Cash = 'cash',
}

/* ===================== Utils ===================== */
const fmtCurrency = (n: number) =>
  n.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 });

const fmtDate = (d: Date) => d.toLocaleString('tr-TR');

/* ===================== Page ===================== */
export default function BuyPackagePage() {
  const { role } = useParams<{ role: string }>();
  const [pricing, setPricing] = React.useState<NegotiatedPrice>(() => loadNegotiatedPriceDemo());

  // Form state
  const [packageCount, setPackageCount] = React.useState<number>(100);
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethod>(PaymentMethod.CreditCard);
  const [coupon, setCoupon] = React.useState<string>('');
  const [note, setNote] = React.useState<string>('');

  // Results
  const [purchases, setPurchases] = React.useState<PurchaseRow[]>([]);
  const [submitting, setSubmitting] = React.useState(false);
  const [info, setInfo] = React.useState<string | null>(null);

  // Discount (DEMO)
  const discountRate = React.useMemo(
    () => (coupon.trim().toUpperCase() === 'YUKSI10' ? 0.1 : 0),
    [coupon]
  );

  const { unitPriceTRY } = pricing;
  const subtotal = unitPriceTRY * Math.max(0, packageCount);
  const discount = Math.round(subtotal * discountRate);
  const total = Math.max(0, subtotal - discount);

  function resetInfoSoon(msg: string) {
    setInfo(msg);
    setTimeout(() => setInfo(null), 4000);
  }

  function simulatePaymentLink(amount: number) {
    const id = crypto.randomUUID().slice(0, 8);
    return `https://pay.yuksi.dev/demo/checkout?ref=${id}&amount=${amount}`;
  }

  async function submitDemo(e: React.FormEvent) {
    e.preventDefault();
    if (pricing.minPackages && packageCount < pricing.minPackages) {
      resetInfoSoon(`En az ${pricing.minPackages} paket satın alabilirsiniz.`);
      return;
    }
    if (pricing.maxPackages && packageCount > pricing.maxPackages) {
      resetInfoSoon(`En fazla ${pricing.maxPackages} paket satın alabilirsiniz.`);
      return;
    }

    setSubmitting(true);
    setInfo(null);

    // (Gerçekte: backend’e POST -> ödeme linki dönsün)
    const paymentUrl = simulatePaymentLink(total);

    // Demo: “ödeme sayfasına yönlendirme” etkisi
    setTimeout(() => {
      const row: PurchaseRow = {
        id: crypto.randomUUID(),
        createdAt: new Date(),
        packageCount,
        unitPrice: unitPriceTRY,
        totalPaid: total,
        paymentMethod,
        status: 'pending',
        mockPaymentUrl: paymentUrl,
      };
      setPurchases(prev => [row, ...prev]);
      setSubmitting(false);
      setInfo('Ödeme sayfasına yönlendiriliyorsunuz (DEMO).');

      // İstersen gerçekten yeni sekmede aç:
      // window.open(paymentUrl, '_blank', 'noopener,noreferrer');
    }, 900);
  }

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Paket Satın Al</h1>
        <div className="text-sm text-neutral-500">Panel: {role}</div>
      </div>

      {/* Anlaşmalı fiyat bilgisi */}
      <section className="rounded-2xl border border-neutral-200/70 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm text-neutral-600">Bu işletme için anlaşmalı birim fiyat</div>
            <div className="mt-1 text-2xl font-bold text-neutral-900">
              {fmtCurrency(pricing.unitPriceTRY)} <span className="text-sm font-medium text-neutral-500">/ paket</span>
            </div>
            {pricing.minPackages ? (
              <div className="mt-1 text-xs text-neutral-600">En az {pricing.minPackages} paket</div>
            ) : null}
          </div>

          {/* DEMO: hızlı değiştir (gerçekte adminden gelir) */}
          <div className="text-xs text-neutral-500">
            DEMO: <button
              className="rounded-lg border px-2 py-1 hover:bg-neutral-50"
              onClick={() => setPricing(p => ({ ...p, unitPriceTRY: p.unitPriceTRY === 80 ? 90 : 80 }))}
            >
              Birim fiyatı {pricing.unitPriceTRY === 80 ? '90' : '80'} TL yap
            </button>
          </div>
        </div>
      </section>

      {/* Satın alma & özet */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Form */}
        <section className="lg:col-span-2 rounded-2xl border border-neutral-200/70 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold">Satın Alma</h2>
          <form onSubmit={submitDemo} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="sm:col-span-1">
                <label className="mb-1 block text-sm font-medium text-neutral-700">Paket Adedi</label>
                <input
                  type="number"
                  min={pricing.minPackages || 1}
                  value={packageCount}
                  onChange={(e) => setPackageCount(Math.max(pricing.minPackages || 1, Number(e.target.value || 1)))}
                  className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-sky-200"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-neutral-700">Ödeme Yöntemi</label>
                <div className="grid grid-cols-3 gap-2">
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
                <label className="mb-1 block text-sm font-medium text-neutral-700">Not (opsiyonel)</label>
                <input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Siparişe dair açıklama…"
                  className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-sky-200"
                />
              </div>
            </div>

            {/* Özet */}
            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3 text-sm">
              <div className="flex items-center justify-between">
                <span>Birim Fiyat</span>
                <span className="font-medium">{fmtCurrency(unitPriceTRY)} / paket</span>
              </div>
              <div className="mt-1 flex items-center justify-between">
                <span>Adet</span>
                <span className="font-medium">{packageCount}</span>
              </div>
              <div className="mt-1 flex items-center justify-between">
                <span>Ara Toplam</span>
                <span className="font-medium">{fmtCurrency(subtotal)}</span>
              </div>
              <div className="mt-1 flex items-center justify-between">
                <span>İndirim</span>
                <span className="font-medium">{discount > 0 ? `– ${fmtCurrency(discount)}` : '-'}</span>
              </div>
              <div className="mt-2 flex items-center justify-between border-t pt-2 text-base">
                <span className="font-semibold">Genel Toplam</span>
                <span className="font-bold">{fmtCurrency(total)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || packageCount <= 0}
              className="w-full rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700 disabled:opacity-60"
            >
              {submitting ? 'İşlem yapılıyor…' : 'Satın Al (Demo)'}
            </button>

            {info && (
              <div className="rounded-md border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-700">
                {info}
              </div>
            )}
          </form>
        </section>

        {/* Bilgilendirme kutusu */}
        <section className="rounded-2xl border border-neutral-200/70 bg-white p-4 shadow-sm">
          <h2 className="mb-2 text-lg font-semibold">Nasıl Çalışır?</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm text-neutral-700">
            <li>Her işletmenin <strong>anlaşmalı birim fiyatı</strong> farklı olabilir (admin panelinden tanımlanır).</li>
            <li>Bu ekranda yalnızca <strong>paket adedi</strong> seçilir; toplam tutar otomatik hesaplanır.</li>
            <li>“Satın Al” sonrası ödeme sayfasına yönlendirilirsiniz (demo linki oluşturulur).</li>
          </ul>
        </section>
      </div>

      {/* Satın alımlar (Demo) */}
      <section className="rounded-2xl border border-neutral-200/70 bg-white shadow-sm">
        <div className="p-4">
          <h2 className="text-lg font-semibold">Satın Alımlarım (Demo)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full border-t border-neutral-200/70">
            <thead>
              <tr className="text-left text-sm text-neutral-500">
                <th className="px-4 py-3 font-medium">Tarih</th>
                <th className="px-4 py-3 font-medium">Adet</th>
                <th className="px-4 py-3 font-medium">Birim</th>
                <th className="px-4 py-3 font-medium">Toplam</th>
                <th className="px-4 py-3 font-medium">Ödeme</th>
                <th className="px-4 py-3 font-medium">Durum</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {purchases.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-sm text-neutral-500">
                    Henüz satın alma yok.
                  </td>
                </tr>
              )}
              {purchases.map((r) => (
                <tr key={r.id} className="border-t border-neutral-200/70">
                  <td className="px-4 py-3">{fmtDate(r.createdAt)}</td>
                  <td className="px-4 py-3">{r.packageCount}</td>
                  <td className="px-4 py-3">{fmtCurrency(r.unitPrice)}</td>
                  <td className="px-4 py-3">{fmtCurrency(r.totalPaid)}</td>
                  <td className="px-4 py-3">
                    {r.paymentMethod === PaymentMethod.CreditCard ? 'Kredi Kartı'
                      : r.paymentMethod === PaymentMethod.Transfer ? 'Havale/EFT' : 'Nakit'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      r.status === 'pending' ? 'bg-amber-100 text-amber-800'
                        : r.status === 'paid' ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-rose-100 text-rose-700'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <a
                      href={r.mockPaymentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg bg-sky-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-sky-600"
                    >
                      Ödeme Linki (Demo)
                    </a>
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

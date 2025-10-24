'use client';

import * as React from 'react';
import { getAuthToken } from '@/utils/auth';

/* ======= types & helpers ======= */
type DeliveryTypeUI = 'today' | 'appointment';
type DeliveryTypeAPI = 'immediate' | 'appointment';

type ExtraServiceKey = 'fragile' | 'helpCarry' | 'returnTrip' | 'stairs' | 'insurance';

const EXTRA_SERVICES: Record<
  ExtraServiceKey,
  { id: number; label: string; price: number }
> = {
  fragile:   { id: 1, label: 'Kırılabilir / Özenli Taşıma', price: 50 },
  helpCarry: { id: 2, label: 'Taşıma Yardımı',              price: 100 },
  returnTrip:{ id: 3, label: 'Gidiş-Dönüş',                 price: 75 },
  stairs:    { id: 4, label: 'Kat Hizmeti (Asansörsüz)',    price: 60 },
  insurance: { id: 5, label: 'Sigorta',                     price: 120 },
};

async function readJson<T = any>(res: Response): Promise<T> {
  const t = await res.text();
  try { return t ? JSON.parse(t) : (null as any); } catch { return (t as any); }
}
const pickMsg = (d: any, fb: string) => d?.error?.message || d?.message || d?.detail || d?.title || fb;

// API errorları için güçlü toplayıcı (array object, array string, map vs.)
function collectErrors(x: any): string {
  const msgs: string[] = [];
  if (x?.message) msgs.push(String(x.message));
  if (x?.data?.message) msgs.push(String(x.data.message));
  const err = x?.errors || x?.error || x?.detail;

  if (Array.isArray(err)) {
    for (const it of err) {
      if (typeof it === 'string') msgs.push(it);
      else if (it && typeof it === 'object') {
        const loc = Array.isArray(it.loc) ? it.loc.join('.') : it.loc ?? '';
        const m = it.msg || it.message || it.detail;
        if (loc && m) msgs.push(`${loc}: ${m}`);
        else if (m) msgs.push(String(m));
      }
    }
  } else if (err && typeof err === 'object') {
    for (const [k, v] of Object.entries(err)) {
      if (Array.isArray(v)) (v as any[]).forEach(m => msgs.push(`${k}: ${m}`));
      else if (v) msgs.push(`${k}: ${v}`);
    }
  }
  return msgs.join('\n');
}

/* ======= page ======= */
export default function CreateLoadPage() {
  // UI state
  const [deliveryType, setDeliveryType] = React.useState<DeliveryTypeUI>('today');

  const [carrierType, setCarrierType] = React.useState('courier');       // swagger örneği 'courier'
  const [carrierVehicle, setCarrierVehicle] = React.useState('motorcycle'); // 'motorcycle'

  const [loadType, setLoadType] = React.useState(''); // UI’da dursun, API’ye gönderilmeyecek

  const [pickup, setPickup] = React.useState('');
  const [pickupLat, setPickupLat] = React.useState<string>('');
  const [pickupLng, setPickupLng] = React.useState<string>('');

  const [dropoff, setDropoff] = React.useState('');
  const [dropLat, setDropLat] = React.useState<string>('');
  const [dropLng, setDropLng] = React.useState<string>('');

  const [note, setNote] = React.useState('');

  const [coupon, setCoupon] = React.useState('');
  const [couponApplied, setCouponApplied] = React.useState<string | null>(null);

  const [extras, setExtras] = React.useState<Record<ExtraServiceKey, boolean>>({
    fragile: false, helpCarry: false, returnTrip: false, stairs: false, insurance: false,
  });

  const [basePrice, setBasePrice] = React.useState<number | ''>(''); // manuel taban ücret
  const extrasTotal = React.useMemo(
    () => (Object.keys(extras) as ExtraServiceKey[])
      .filter(k => extras[k])
      .reduce((sum, k) => sum + EXTRA_SERVICES[k].price, 0),
    [extras]
  );
  const computedTotal = (Number(basePrice || 0) + extrasTotal);

  // !!! allowed: 'cash' | 'card' | 'transfer'
  const [payMethod, setPayMethod] = React.useState<'cash' | 'card' | 'transfer' | ''>('');

  const [files, setFiles] = React.useState<File[]>([]);

  const [busy, setBusy] = React.useState(false);
  const [okMsg, setOkMsg] = React.useState<string | null>(null);
  const [errMsg, setErrMsg] = React.useState<string | null>(null);

  const token = React.useMemo(getAuthToken, []);

  function toggleExtra(key: ExtraServiceKey) { setExtras(p => ({ ...p, [key]: !p[key] })); }
  function applyCoupon() { if (coupon.trim()) setCouponApplied(coupon.trim()); }
  function onUploadChange(e: React.ChangeEvent<HTMLInputElement>) {
    const list = e.target.files ? Array.from(e.target.files) : [];
    if (list.length) setFiles(p => [...p, ...list]);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setOkMsg(null); setErrMsg(null);

    if (!pickup || !dropoff) { setErrMsg('Adresleri girin.'); return; }
    if (!payMethod) { setErrMsg('Ödeme yöntemi seçin.'); return; }

    const deliveryTypeApi: DeliveryTypeAPI = deliveryType === 'today' ? 'immediate' : 'appointment';

    const extraServices = (Object.keys(extras) as ExtraServiceKey[])
      .filter(k => extras[k])
      .map(k => ({ serviceId: EXTRA_SERVICES[k].id, name: EXTRA_SERVICES[k].label, price: EXTRA_SERVICES[k].price }));

    const pLat = Number(pickupLat), pLng = Number(pickupLng);
    const dLat = Number(dropLat),   dLng = Number(dropLng);

    // ---> loadType API'ye GÖNDERİLMİYOR <---
    const body = {
      deliveryType: deliveryTypeApi,
      carrierType,
      vehicleType: carrierVehicle,
      pickupAddress: pickup,
      pickupCoordinates: (Number.isFinite(pLat) && Number.isFinite(pLng)) ? [pLat, pLng] : undefined,
      dropoffAddress: dropoff,
      dropoffCoordinates: (Number.isFinite(dLat) && Number.isFinite(dLng)) ? [dLat, dLng] : undefined,
      specialNotes: note || undefined,
      campaignCode: couponApplied || (coupon.trim() || undefined),
      extraServices,
      extraServicesTotal: extrasTotal,
      totalPrice: computedTotal,
      paymentMethod: payMethod, // 'cash' | 'card' | 'transfer'
      imageFileIds: [],
    };

    setBusy(true);
    try {
      const res = await fetch('/yuksi/admin/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });
      const j = await readJson(res);
      if (!res.ok || (j && j.success === false)) {
        throw new Error(collectErrors(j) || pickMsg(j, `HTTP ${res.status}`));
      }

      setOkMsg(collectErrors(j) || 'Gönderi oluşturuldu.');
      // reset
      setPickup(''); setPickupLat(''); setPickupLng('');
      setDropoff(''); setDropLat(''); setDropLng('');
      setNote(''); setCoupon(''); setCouponApplied(null);
      setExtras({ fragile: false, helpCarry: false, returnTrip: false, stairs: false, insurance: false });
      setBasePrice(''); setPayMethod(''); setFiles([]);
    } catch (e: any) {
      setErrMsg(e?.message || 'Gönderi oluşturulamadı.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Yeni Gönderi</h1>
      </div>

      {okMsg && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 whitespace-pre-line">{okMsg}</div>}
      {errMsg && <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 whitespace-pre-line">{errMsg}</div>}

      {/* Gönderim Tipi */}
      <section className="rounded-2xl border border-neutral-200/70 bg-white p-6 shadow-sm soft-card">
        <h2 className="mb-4 text-lg font-semibold">Gönderim Tipi</h2>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setDeliveryType('today')}
            className={[
              'rounded-xl px-5 py-2 text-sm font-semibold shadow-sm border',
              deliveryType === 'today'
                ? 'bg-indigo-500 text-white border-indigo-500'
                : 'bg-white text-neutral-800 border-neutral-300 hover:bg-neutral-50',
            ].join(' ')}
          >
            Bugün (immediate)
          </button>
          <button
            type="button"
            onClick={() => setDeliveryType('appointment')}
            className={[
              'rounded-xl px-5 py-2 text-sm font-semibold shadow-sm border',
              deliveryType === 'appointment'
                ? 'bg-indigo-500 text-white border-indigo-500'
                : 'bg-white text-neutral-800 border-neutral-300 hover:bg-neutral-50',
            ].join(' ')}
          >
            Randevulu (appointment)
          </button>
        </div>
      </section>

      {/* Üst alanlar */}
      <section className="rounded-2xl border border-neutral-200/70 bg-white p-6 shadow-sm soft-card">
        <div className="grid gap-5 md:grid-cols-2">
          {/* Taşıyıcı Tipi */}
          <div>
            <label className="mb-2 block text-sm font-semibold">Taşıyıcı Tipi</label>
            <select
              value={carrierType}
              onChange={(e) => setCarrierType(e.target.value)}
              className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 outline-none ring-2 ring-transparent transition focus:bg-white focus:ring-sky-200"
            >
              <option value="courier">Kurye</option>
              <option value="minivan">Minivan</option>
              <option value="panelvan">Panelvan</option>
              <option value="truck">Kamyonet</option>
            </select>
          </div>

          {/* Taşıyıcı Aracı */}
          <div>
            <label className="mb-2 block text-sm font-semibold">Taşıyıcı Aracı</label>
            <select
              value={carrierVehicle}
              onChange={(e) => setCarrierVehicle(e.target.value)}
              className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 outline-none ring-2 ring-transparent transition focus:bg-white focus:ring-sky-200"
            >
              <option value="motorcycle">2 Teker (Motosiklet)</option>
              <option value="threewheeler">3 Teker</option>
              <option value="hatchback">Hatchback</option>
              <option value="boxvan">Kapalı Kasa</option>
            </select>
          </div>
        </div>

        {/* Yük tipi (API'ye gönderilmiyor) */}
       {/* <div className="mt-5">
          <label className="mb-2 block text-sm font-semibold">Yük Tipi (sadece not/etiket; API'ye gönderilmiyor)</label>
          <select
            value={loadType}
            onChange={(e) => setLoadType(e.target.value)}
            className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 outline-none ring-2 ring-transparent transition focus:bg-white focus:ring-sky-200"
          >
            <option value="">Seçiniz</option>
            <option value="smallPackage">Küçük Paket</option>
            <option value="document">Evrak</option>
            <option value="furniture">Mobilya</option>
            <option value="appliance">Beyaz Eşya</option>
            <option value="fragile">Hassas / Kırılabilir</option>
          </select>
        </div> */}

        {/* Adresler + Koordinatlar */}
        <div className="mt-6 grid gap-6">
          <div>
            <label className="mb-2 block text-sm font-semibold">Gönderici Adresi</label>
            <input
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
              placeholder="Alış adresi"
              className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 outline-none ring-2 ring-transparent transition focus:bg-white focus:ring-sky-200"
            />
            <div className="mt-3 grid grid-cols-2 gap-3">
              <input value={pickupLat} onChange={(e) => setPickupLat(e.target.value)} placeholder="Lat 40.192" className="rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 outline-none focus:bg-white focus:ring-2 focus:ring-sky-200" />
              <input value={pickupLng} onChange={(e) => setPickupLng(e.target.value)} placeholder="Lng 29.067" className="rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 outline-none focus:bg-white focus:ring-2 focus:ring-sky-200" />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">Teslimat Adresi</label>
            <input
              value={dropoff}
              onChange={(e) => setDropoff(e.target.value)}
              placeholder="Teslim adresi"
              className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 outline-none ring-2 ring-transparent transition focus:bg-white focus:ring-sky-200"
            />
            <div className="mt-3 grid grid-cols-2 gap-3">
              <input value={dropLat} onChange={(e) => setDropLat(e.target.value)} placeholder="Lat 40.198" className="rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 outline-none focus:bg-white focus:ring-2 focus:ring-sky-200" />
              <input value={dropLng} onChange={(e) => setDropLng(e.target.value)} placeholder="Lng 29.071" className="rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 outline-none focus:bg-white focus:ring-2 focus:ring-sky-200" />
            </div>
          </div>
        </div>

        {/* Notlar */}
        <div className="mt-6">
          <label className="mb-2 block text-sm font-semibold">Özel Notlar</label>
          <textarea rows={4} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Örn: Paket sıcak kalmalı…" className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 outline-none ring-2 ring-transparent transition focus:bg-white focus:ring-sky-200" />
        </div>
      </section>

      {/* Alt alanlar */}
      <section className="rounded-2xl border border-neutral-200/70 bg-white p-6 shadow-sm soft-card">
        {/* Kupon */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-semibold">Kampanya Kodu</label>
          <div className="flex overflow-hidden rounded-xl border border-neutral-300">
            <input value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder="Kodu yazın" className="w-full bg-neutral-100 px-3 py-2 outline-none" />
            <button type="button" onClick={applyCoupon} className="bg-rose-50 px-4 text-rose-600 hover:bg-rose-100">Uygula</button>
          </div>
          {couponApplied && <div className="mt-2 text-sm text-emerald-600">“{couponApplied}” kuponu uygulandı.</div>}
        </div>

        {/* Ek Hizmetler */}
        <div className="mb-2 text-sm font-semibold">Ek Hizmetler</div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(Object.keys(EXTRA_SERVICES) as ExtraServiceKey[]).map((k) => (
            <label key={k} className="flex cursor-pointer items-center justify-between rounded-xl border border-neutral-200 px-3 py-2 hover:bg-neutral-50">
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={extras[k]} onChange={() => toggleExtra(k)} className="h-4 w-4" />
                <span className="text-sm">{EXTRA_SERVICES[k].label}</span>
              </div>
              <span className="text-sm font-semibold">{EXTRA_SERVICES[k].price.toFixed(0)}₺</span>
            </label>
          ))}
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-semibold">Taban Ücret (₺)</label>
            <input type="number" min={0} value={basePrice} onChange={(e) => setBasePrice(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))} className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 outline-none focus:bg-white focus:ring-2 focus:ring-sky-200" />
          </div>
          <div className="self-end text-sm">
            <div><span className="font-semibold">Ek Hizmet Toplamı: </span>{extrasTotal}₺</div>
            <div><span className="font-semibold">Genel Toplam: </span>{computedTotal}₺</div>
          </div>
        </div>

        {/* Ödeme yöntemi (cash/card/transfer) */}
        <div className="mt-6">
          <label className="mb-2 block text-sm font-semibold">Ödeme Yöntemi</label>
          <select value={payMethod} onChange={(e) => setPayMethod(e.target.value as any)} className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 outline-none ring-2 ring-transparent transition focus:bg-white focus:ring-sky-200">
            <option value="">Seçiniz</option>
            <option value="cash">Nakit (cash)</option>
            <option value="card">Kart (card)</option>
            <option value="transfer">Havale/EFT (transfer)</option>
          </select>
        </div>

        {/* Resim ekle (ID servisi yok -> boş dizi) */}
        <div className="mt-6">
          <label className="mb-2 block text-sm font-semibold">Resim Ekle</label>
          <input type="file" accept="image/*" multiple onChange={(e) => {
            const list = e.target.files ? Array.from(e.target.files) : [];
            if (list.length) setFiles(p => [...p, ...list]);
          }} />
          {files.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {files.map((f, i) => (
                <div key={i} className="rounded-md border border-neutral-200 bg-white px-2 py-1 text-xs shadow-sm">{f.name}</div>
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="flex items-center justify-end">
        <button type="submit" disabled={busy} className="rounded-2xl bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-600 disabled:opacity-60">
          {busy ? 'Gönderiliyor…' : 'Kaydet'}
        </button>
      </div>
    </form>
  );
}

'use client';

import * as React from 'react';

type DeliveryType = 'today' | 'appointment';

type ExtraServiceKey =
  | 'fragile'
  | 'helpCarry'
  | 'returnTrip'
  | 'stairs'
  | 'insurance';

const EXTRA_SERVICES: Record<
  ExtraServiceKey,
  { label: string; price: number }
> = {
  fragile: { label: 'Kırılabilir / Özenli Taşıma', price: 50 },
  helpCarry: { label: 'Taşıma Yardımı', price: 100 },
  returnTrip: { label: 'Gidiş-Dönüş', price: 75 },
  stairs: { label: 'Kat Hizmeti (Asansörsüz)', price: 60 },
  insurance: { label: 'Sigorta', price: 120 },
};

export default function CreateLoadPage() {
  const [deliveryType, setDeliveryType] = React.useState<DeliveryType>('today');

  const [carrierType, setCarrierType] = React.useState('');
  const [carrierVehicle, setCarrierVehicle] = React.useState('');
  const [loadType, setLoadType] = React.useState('');

  const [pickup, setPickup] = React.useState('');
  const [dropoff, setDropoff] = React.useState('');
  const [note, setNote] = React.useState('');

  const [coupon, setCoupon] = React.useState('');
  const [couponApplied, setCouponApplied] = React.useState<string | null>(null);

  const [extras, setExtras] = React.useState<Record<ExtraServiceKey, boolean>>({
    fragile: false,
    helpCarry: false,
    returnTrip: false,
    stairs: false,
    insurance: false,
  });

  const [payMethod, setPayMethod] = React.useState('');
  const [files, setFiles] = React.useState<File[]>([]);

  const extrasTotal = React.useMemo(
    () =>
      (Object.keys(extras) as ExtraServiceKey[])
        .filter((k) => extras[k])
        .reduce((sum, k) => sum + EXTRA_SERVICES[k].price, 0),
    [extras],
  );

  function toggleExtra(key: ExtraServiceKey) {
    setExtras((p) => ({ ...p, [key]: !p[key] }));
  }

  function applyCoupon() {
    // Demo: boş değilse uygulandı varsayalım
    if (coupon.trim()) setCouponApplied(coupon.trim());
  }

  function onUploadChange(e: React.ChangeEvent<HTMLInputElement>) {
    const list = e.target.files ? Array.from(e.target.files) : [];
    if (list.length) setFiles((p) => [...p, ...list]);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    alert('Gönderi kaydedildi (demo).');
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Yeni Gönderi</h1>
      </div>

      {/* Gönderim Tipi */}
      <section className="rounded-2xl border border-neutral-200/70 bg-white p-6 shadow-sm">
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
            Bugün
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
            Randevulu
          </button>
        </div>
      </section>

      {/* Üst alanlar */}
      <section className="rounded-2xl border border-neutral-200/70 bg-white p-6 shadow-sm">
        <div className="grid gap-5 md:grid-cols-2">
          {/* Taşıyıcı Tipi */}
          <div>
            <label className="mb-2 block text-sm font-semibold">Taşıyıcı Tipi</label>
            <div className="relative">
              <select
                value={carrierType}
                onChange={(e) => setCarrierType(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 text-neutral-800 placeholder:text-neutral-400 outline-none ring-2 ring-transparent transition focus:bg-white focus:border-neutral-300 focus:ring-sky-200"
              >
                <option value="">Seçiniz</option>
                <option value="kurye">Kurye</option>
                <option value="minivan">Minivan</option>
                <option value="panelvan">Panelvan</option>
                <option value="kamyonet">Kamyonet</option>
              </select>
            </div>
          </div>

          {/* Taşıyıcı Aracı */}
          <div>
            <label className="mb-2 block text-sm font-semibold">Taşıyıcı Aracı</label>
            <div className="relative">
              <select
                value={carrierVehicle}
                onChange={(e) => setCarrierVehicle(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 text-neutral-800 placeholder:text-neutral-400 outline-none ring-2 ring-transparent transition focus:bg-white focus:border-neutral-300 focus:ring-sky-200"
              >
                <option value="">Seçiniz</option>
                <option value="2teker">2 Teker (Motosiklet)</option>
                <option value="3teker">3 Teker</option>
                <option value="hatchback">Hatchback</option>
                <option value="kasa">Kapalı Kasa</option>
              </select>
            </div>
          </div>
        </div>

        {/* Yük tipi */}
        <div className="mt-5">
          <label className="mb-2 block text-sm font-semibold">Yük Tipi Seçiniz</label>
          <div className="relative">
            <select
              value={loadType}
              onChange={(e) => setLoadType(e.target.value)}
              className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 text-neutral-800 placeholder:text-neutral-400 outline-none ring-2 ring-transparent transition focus:bg-white focus:border-neutral-300 focus:ring-sky-200"
            >
              <option value="">Seçiniz</option>
              <option value="paket">Küçük Paket</option>
              <option value="evrak">Evrak</option>
              <option value="mobilya">Mobilya</option>
              <option value="beyazesya">Beyaz Eşya</option>
              <option value="hassas">Hassas / Kırılabilir</option>
            </select>
          </div>
        </div>

        {/* Adresler */}
        <div className="mt-6 grid gap-6">
          <div>
            <label className="mb-2 block text-sm font-semibold">Gönderici Adresi</label>
            <input
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
              placeholder="Alış konumu seç"
              className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 text-neutral-800 placeholder:text-neutral-400 outline-none ring-2 ring-transparent transition focus:bg-white focus:border-neutral-300 focus:ring-sky-200"
            />
            <button
              type="button"
              className="mt-2 text-sm font-medium text-indigo-600 hover:underline"
              onClick={() => setPickup('Örn: Yüksi Mah. Örnek Sok. No:10/2, İstanbul')}
            >
              Adreslerimden Seç
            </button>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">Teslimat Adresi</label>
            <input
              value={dropoff}
              onChange={(e) => setDropoff(e.target.value)}
              placeholder="Yeni konum ekle"
              className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 text-neutral-800 placeholder:text-neutral-400 outline-none ring-2 ring-transparent transition focus:bg-white focus:border-neutral-300 focus:ring-sky-200"
            />
            <button
              type="button"
              className="mt-2 text-sm font-medium text-indigo-600 hover:underline"
              onClick={() => setDropoff('Örn: Cumhuriyet Mah. Deneme Cad. No:3, Bursa')}
            >
              Adreslerimden Seç
            </button>
          </div>
        </div>

        {/* Talepler */}
        <div className="mt-6">
          <label className="mb-2 block text-sm font-semibold">Talepleriniz</label>
          <textarea
            rows={4}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Özel taleplerinizi buraya yazabilirsiniz."
            className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 text-neutral-800 placeholder:text-neutral-400 outline-none ring-2 ring-transparent transition focus:bg-white focus:border-neutral-300 focus:ring-sky-200"
          />
        </div>
      </section>

      {/* Alt alanlar */}
      <section className="rounded-2xl border border-neutral-200/70 bg-white p-6 shadow-sm">
        {/* Kampanya */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-semibold">Kampanya Kodu</label>
          <div className="flex overflow-hidden rounded-xl border border-neutral-300">
            <input
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
              placeholder="Kodu Buraya Yaz"
              className="w-full bg-neutral-100 px-3 py-2 outline-none"
            />
            <button
              type="button"
              onClick={applyCoupon}
              className="bg-rose-50 px-4 text-rose-600 hover:bg-rose-100"
            >
              Uygula
            </button>
          </div>
          {couponApplied && (
            <div className="mt-2 text-sm text-emerald-600">
              “{couponApplied}” kuponu uygulandı.
            </div>
          )}
        </div>

        {/* Ek Hizmetler */}
        <div className="mb-2 text-sm font-semibold">Ek Hizmetler</div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(Object.keys(EXTRA_SERVICES) as ExtraServiceKey[]).map((k) => (
            <label
              key={k}
              className="flex cursor-pointer items-center justify-between rounded-xl border border-neutral-200 px-3 py-2 hover:bg-neutral-50"
            >
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={extras[k]}
                  onChange={() => toggleExtra(k)}
                  className="h-4 w-4"
                />
                <span className="text-sm">{EXTRA_SERVICES[k].label}</span>
              </div>
              <span className="text-sm font-semibold">{EXTRA_SERVICES[k].price.toFixed(2)}₺</span>
            </label>
          ))}
        </div>

        <div className="mt-3 text-sm">
          <span className="font-semibold">Ek Hizmet Toplamı: </span>
          <span className="font-semibold">{extrasTotal.toFixed(2)}₺</span>
        </div>

        {/* Ödeme yöntemi */}
        <div className="mt-6">
          <label className="mb-2 block text-sm font-semibold">Ödeme Yöntemi</label>
          <select
            value={payMethod}
            onChange={(e) => setPayMethod(e.target.value)}
            className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 text-neutral-800 placeholder:text-neutral-400 outline-none ring-2 ring-transparent transition focus:bg-white focus:border-neutral-300 focus:ring-sky-200"
          >
            <option value="">Seçiniz</option>
            <option value="cash">Kapıda Nakit</option>
            <option value="card">Kapıda Kart</option>
            <option value="online">Online Ödeme</option>
            <option value="account">Cari Hesap</option>
          </select>
        </div>

        {/* Resim ekle (drag yok, basit input) */}
        <div className="mt-6">
          <label className="mb-2 block text-sm font-semibold">Resim Ekle</label>
          <input type="file" accept="image/*" multiple onChange={onUploadChange} />
          {files.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {files.map((f, i) => (
                <div
                  key={i}
                  className="rounded-md border border-neutral-200 bg-white px-2 py-1 text-xs shadow-sm"
                >
                  {f.name}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="flex items-center justify-end">
        <button
          type="submit"
          className="rounded-2xl bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-600 active:translate-y-px"
        >
          Kaydet
        </button>
      </div>
    </form>
  );
}

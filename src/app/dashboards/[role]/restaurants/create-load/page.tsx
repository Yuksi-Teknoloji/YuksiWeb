// src/app/dashboards/[role]/admin/orders/create-order/page.tsx
'use client';

import * as React from 'react';

/* ---------- küçük yardımcılar ---------- */
async function readJson(res: Response) {
  const t = await res.text();
  try { return t ? JSON.parse(t) : null; } catch { return null; }
}
const pickMsg = (d: any, fb: string) =>
  d?.message || d?.title || d?.detail || d?.error?.message || fb;

function getCookie(name: string) {
  if (typeof document === 'undefined') return '';
  const m = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([$?*|{}\]\\^])/g,'\\$1') + '=([^;]*)'));
  return m ? decodeURIComponent(m[1]) : '';
}

// JWT decode (payload)
function decodeJwtPayload(token: string | null | undefined): any | null {
  if (!token) return null;
  const raw = token.replace(/^Bearer\s+/i, '');
  const parts = raw.split('.');
  if (parts.length < 2) return null;
  try {
    const json = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decodeURIComponent(escape(json)));
  } catch { return null; }
}

// Token’ı olası yerlerden dene
function findToken(): string | null {
  if (typeof window === 'undefined') return null;
  const candKeys = ['auth_token','access_token','token','jwt','id_token','auth','user','session'];
  for (const k of candKeys) {
    const v = localStorage.getItem(k);
    if (!v) continue;
    try {
      const maybe = JSON.parse(v);
      if (typeof maybe === 'string') return maybe;
      if (typeof maybe?.auth_token === 'string') return maybe.auth_token;
      if (typeof maybe?.access_token === 'string') return maybe.access_token;
      if (typeof maybe?.token === 'string') return maybe.token;
      if (typeof maybe?.jwt === 'string') return maybe.jwt;
    } catch {
      if (typeof v === 'string' && v.split('.').length >= 2) return v;
    }
  }
  const cookieCandidates = ['auth_token','access_token','token','jwt','Authorization'];
  for (const c of cookieCandidates) {
    const cv = getCookie(c);
    if (cv) return cv;
  }
  return null;
}

/* ---------- API alanları ---------- */
type ApiType = 'yerinde' | 'paket_servis' | 'gel_al';
type Item = { id: string; product_name: string; price: number; quantity: number };

export default function RestaurantOrderCreate() {
  // hem restaurantId (path’te) hem userId (payload’ta)
  const [restaurantId, setRestaurantId] = React.useState<string | null>(null);
  const [userId, setUserId] = React.useState<string | null>(null);
  const [idErr, setIdErr] = React.useState<string | null>(null);

  // form state
  const [customer, setCustomer] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [address, setAddress] = React.useState('');
  const [deliveryAddress, setDeliveryAddress] = React.useState('');
  const [type, setType] = React.useState<ApiType>('yerinde');
  const [carrierType, setCarrierType] = React.useState('kurye');
  const [vehicleType, setVehicleType] = React.useState<'2_teker_motosiklet'|'3_teker_motosiklet'>('2_teker_motosiklet');
  const [cargoType, setCargoType] = React.useState('');
  const [special, setSpecial] = React.useState('');
  const [items, setItems] = React.useState<Item[]>([
    { id: crypto.randomUUID(), product_name: '', price: 0, quantity: 1 },
  ]);

  const amount = React.useMemo(
    () => items.reduce((s, i) => s + (Number(i.price)||0) * (Number(i.quantity)||0), 0),
    [items]
  );

  const [saving, setSaving] = React.useState(false);
  const [ok, setOk] = React.useState<string | null>(null);
  const [err, setErr] = React.useState<string | null>(null);

  // Mount: token’dan userId/restaurantId çek
  React.useEffect(() => {
    const token = findToken();
    const payload = decodeJwtPayload(token || undefined);

    // JWT örneğin:
    // {
    //   "userId": "0d4b1d8e-...b67",
    //   "userType": "restaurant",
    //   ...
    // }
    const uid =
      (payload?.userId && String(payload.userId)) ||
      (payload?.sub && String(payload.sub)) || null;

    // restaurant tarafında restaurant_id = userId
    const ridFromLS = typeof window !== 'undefined' ? localStorage.getItem('restaurant_id') : null;
    const rid = ridFromLS || uid;

    if (uid) setUserId(uid);
    if (rid) setRestaurantId(rid);

    if (!rid) {
      setIdErr('Token içinde restaurant_id/userId bulunamadı.');
    } else {
      setIdErr(null);
    }
  }, []);

  // kalem helpers
  function addItem() {
    setItems(p => [...p, { id: crypto.randomUUID(), product_name: '', price: 0, quantity: 1 }]);
  }
  function updateItem(id: string, patch: Partial<Item>) {
    setItems(p => p.map(x => (x.id === id ? { ...x, ...patch } : x)));
  }
  function removeItem(id: string) {
    setItems(p => (p.length > 1 ? p.filter(x => x.id !== id) : p));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setOk(null); setErr(null);

    if (!restaurantId) {
      setErr(idErr || 'Restaurant ID yok.');
      return;
    }

    setSaving(true);
    try {
      const cleanItems = items
        .filter(i => i.product_name.trim() && i.quantity > 0)
        .map(i => ({
          product_name: i.product_name.trim(),
          price: +Number(i.price || 0).toFixed(2),
          quantity: Number(i.quantity || 0),
        }));
      if (cleanItems.length === 0) throw new Error('En az bir ürün ekleyin.');

      // 👉 user_id’yi payload’a ekliyoruz
      const payload = {
        user_id: userId || restaurantId, // garanti olsun
        customer: customer.trim(),
        phone: phone.trim(),
        address: address.trim(),
        delivery_address: (deliveryAddress || address).trim(),
        type,
        amount: +amount.toFixed(2),
        carrier_type: carrierType || 'kurye',
        vehicle_type: vehicleType,
        cargo_type: cargoType || 'string',
        special_requests: special || '',
        items: cleanItems,
      };

      const token = findToken();

      const res = await fetch(`/yuksi/restaurant/${restaurantId}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      const data = await readJson(res);
      if (!res.ok) throw new Error(pickMsg(data, `HTTP ${res.status}`));

      setOk(data?.message || `Sipariş oluşturuldu (ID: ${data?.data?.id || '—'})`);

      // form reset
      (e.target as HTMLFormElement).reset?.();
      setCustomer(''); setPhone(''); setAddress(''); setDeliveryAddress('');
      setType('yerinde'); setCarrierType('kurye'); setVehicleType('2_teker_motosiklet');
      setCargoType(''); setSpecial('');
      setItems([{ id: crypto.randomUUID(), product_name: '', price: 0, quantity: 1 }]);
    } catch (ex: any) {
      setErr(ex?.message || 'Sipariş gönderilemedi.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <h1 className="text-2xl font-semibold">Yeni Sipariş</h1>

      {/* ID bilgi alanı (debug/farkındalık) */}
      <div className="text-xs text-neutral-600">
        {restaurantId ? <>restaurant_id: <b>{restaurantId}</b></> : <>{idErr}</>}
        {userId && <> • user_id: <b>{userId}</b></>}
      </div>

      {/* Temel alanlar */}
      <section className="rounded-2xl border border-neutral-200/70 bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Müşteri</label>
            <input value={customer} onChange={e=>setCustomer(e.target.value)} required className="w-full rounded-xl border px-3 py-2"/>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Telefon</label>
            <input value={phone} onChange={e=>setPhone(e.target.value)} required className="w-full rounded-xl border px-3 py-2"/>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Adres</label>
            <input value={address} onChange={e=>setAddress(e.target.value)} required className="w-full rounded-xl border px-3 py-2"/>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Teslimat Adresi</label>
            <input value={deliveryAddress} onChange={e=>setDeliveryAddress(e.target.value)} className="w-full rounded-xl border px-3 py-2" placeholder="Boş bırakılırsa Adres kullanılır"/>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Sipariş Tipi</label>
            <select value={type} onChange={e=>setType(e.target.value as ApiType)} className="w-full rounded-xl border px-3 py-2">
              <option value="yerinde">Yerinde</option>
              <option value="gel_al">Gel-Al</option>
              <option value="paket_servis">Paket Servis</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium">Taşıyıcı</label>
              <select value={carrierType} onChange={e=>setCarrierType(e.target.value)} className="w-full rounded-xl border px-3 py-2">
                <option value="kurye">kurye</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Araç</label>
              <select value={vehicleType} onChange={e=>setVehicleType(e.target.value as any)} className="w-full rounded-xl border px-3 py-2">
                <option value="2_teker_motosiklet">2_teker_motosiklet</option>
                <option value="3_teker_motosiklet">3_teker_motosiklet</option>
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Kargo Tipi</label>
            <input value={cargoType} onChange={e=>setCargoType(e.target.value)} className="w-full rounded-xl border px-3 py-2" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Özel İstek</label>
            <input value={special} onChange={e=>setSpecial(e.target.value)} className="w-full rounded-xl border px-3 py-2" />
          </div>
        </div>
      </section>

      {/* Kalemler */}
      <section className="rounded-2xl border border-neutral-200/70 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Kalemler</h2>
          <button type="button" onClick={addItem} className="rounded-lg border px-3 py-1.5 text-sm hover:bg-neutral-50">+ Ekle</button>
        </div>

        <div className="mt-3 grid gap-3">
          {items.map(it => (
            <div key={it.id} className="grid gap-3 sm:grid-cols-[1fr,140px,140px,100px]">
              <input
                value={it.product_name}
                onChange={e=>updateItem(it.id, { product_name: e.target.value })}
                placeholder="Ürün adı"
                className="rounded-xl border px-3 py-2"
              />
              <input
                type="number"
                step="0.01"
                value={it.price}
                onChange={e=>updateItem(it.id, { price: Number(e.target.value) || 0 })}
                className="rounded-xl border px-3 py-2 text-right"
              />
              <input
                type="number"
                min={1}
                value={it.quantity}
                onChange={e=>updateItem(it.id, { quantity: Math.max(1, Number(e.target.value) || 1) })}
                className="rounded-xl border px-3 py-2 text-right"
              />
              <div className="flex items-center justify-between">
                <strong className="tabular-nums">{((it.price||0)*(it.quantity||0)).toFixed(2)}₺</strong>
                <button type="button" onClick={()=>removeItem(it.id)} className="rounded-md bg-rose-100 px-3 py-1.5 text-sm text-rose-700 hover:bg-rose-200">Sil</button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-end gap-4">
          <span className="text-sm">Genel Toplam</span>
          <span className="text-base font-bold tabular-nums">{amount.toFixed(2)}₺</span>
        </div>
      </section>

      <div className="flex items-center justify-end gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-2xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {saving ? 'Gönderiliyor…' : 'Kaydet'}
        </button>
        {ok && <div className="text-sm text-emerald-600">{ok}</div>}
        {err && <div className="text-sm text-rose-600">{err}</div>}
      </div>
    </form>
  );
}

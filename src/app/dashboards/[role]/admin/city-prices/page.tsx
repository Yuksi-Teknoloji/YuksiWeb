'use client';

import * as React from 'react';
import { X } from 'lucide-react';

type PriceRow = {
  id: string;
  lineName: string; // Hat Adı
  city: string;     // İl
  district: string; // İlçe
  prices: {
    kurye: number;
    minivan: number;
    panelvan: number;
    kamyonet: number;
    kamyon: number;
  };
};

const SEED: PriceRow[] = [
  {
    id: 'p1',
    lineName: 'Kadıköy',
    city: 'İSTANBUL',
    district: 'AVCILAR',
    prices: { kurye: 30, minivan: 1000, panelvan: 10000, kamyonet: 20000, kamyon: 50000 },
  },
  {
    id: 'p2',
    lineName: 'Bursa',
    city: 'BURSA',
    district: 'KESTEL',
    prices: { kurye: 30, minivan: 60, panelvan: 80, kamyonet: 90, kamyon: 100 },
  },
];

export default function CityPricesPage() {
  const [rows, setRows] = React.useState<PriceRow[]>(SEED);
  const [filterCity, setFilterCity] = React.useState('');
  const [filterDistrict, setFilterDistrict] = React.useState('');
  const [isOpen, setIsOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);

  // Modal form state
  const [form, setForm] = React.useState<PriceRow>({
    id: '',
    lineName: '',
    city: '',
    district: '',
    prices: { kurye: 0, minivan: 0, panelvan: 0, kamyonet: 0, kamyon: 0 },
  });

  const filtered = rows.filter(r => {
    const byCity = filterCity ? r.city.toLowerCase().includes(filterCity.toLowerCase()) : true;
    const byDistrict = filterDistrict
      ? r.district.toLowerCase().includes(filterDistrict.toLowerCase())
      : true;
    return byCity && byDistrict;
  });

  function openCreate() {
    setEditingId(null);
    setForm({
      id: '',
      lineName: '',
      city: '',
      district: '',
      prices: { kurye: 0, minivan: 0, panelvan: 0, kamyonet: 0, kamyon: 0 },
    });
    setIsOpen(true);
  }

  function openEdit(row: PriceRow) {
    setEditingId(row.id);
    setForm(row);
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
  }

  function onChange<K extends keyof PriceRow>(key: K, value: PriceRow[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  function setPrice(part: keyof PriceRow['prices'], value: number) {
    setForm(prev => ({ ...prev, prices: { ...prev.prices, [part]: value } }));
  }

  function onSave() {
    if (!form.lineName || !form.city || !form.district) {
      alert('Hat adı, il ve ilçe zorunludur.');
      return;
    }

    if (editingId) {
      setRows(prev => prev.map(r => (r.id === editingId ? { ...form, id: editingId } : r)));
    } else {
      setRows(prev => [{ ...form, id: crypto.randomUUID() }, ...prev]);
    }
    setIsOpen(false);
  }

  function onDelete(id: string) {
    if (confirm('Bu hattı silmek istediğine emin misin?')) {
      setRows(prev => prev.filter(r => r.id !== id));
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Şehir Listesi</h1>

      {/* Filtre + Yeni şehir ekle */}
      <section className="rounded-2xl border border-neutral-200/70 bg-white p-4 shadow-sm soft-card">
        <div className="flex items-center justify-between">
          <button
            onClick={openCreate}
            className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-sky-600 active:translate-y-px"
          >
            Yeni Şehir Ekle
          </button>

          <div className="flex gap-4">
            <div className="w-72">
              <label className="mb-1 block text-sm font-semibold text-neutral-600">İl</label>
              <input
                placeholder="İl Seçiniz"
                value={filterCity}
                onChange={e => setFilterCity(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 outline-none ring-2 ring-transparent transition focus:bg-white focus:ring-sky-200"
              />
            </div>
            <div className="w-72">
              <label className="mb-1 block text-sm font-semibold text-neutral-600">İlçe</label>
              <input
                placeholder=""
                value={filterDistrict}
                onChange={e => setFilterDistrict(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 outline-none ring-2 ring-transparent transition focus:bg-white focus:ring-sky-200"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Liste */}
      <section className="rounded-2xl border border-neutral-200/70 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-neutral-200/70 text-left text-sm text-neutral-500">
                <th className="px-6 py-3 font-medium">Hat Adı</th>
                <th className="px-6 py-3 font-medium">İl</th>
                <th className="px-6 py-3 font-medium">İlçe</th>
                <th className="px-6 py-3 font-medium">Fiyatlar</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id} className="border-t border-neutral-200/70 align-top hover:bg-neutral-50">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-neutral-900">{r.lineName}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-neutral-900">{r.city}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-neutral-900">{r.district}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="whitespace-pre-line text-neutral-800">
                      {[
                        `Kurye : ${r.prices.kurye} ₺`,
                        `Minivan : ${r.prices.minivan} ₺`,
                        `Panelvan : ${r.prices.panelvan} ₺`,
                        `Kamyonet : ${r.prices.kamyonet} ₺`,
                        `Kamyon : ${r.prices.kamyon} ₺`,
                      ].join('\n')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onDelete(r.id)}
                        className="rounded-lg bg-rose-500 px-4 py-1.5 text-sm font-semibold text-white shadow hover:bg-rose-600"
                      >
                        Sil
                      </button>
                      <button
                        onClick={() => openEdit(r)}
                        className="rounded-lg bg-emerald-500 px-4 py-1.5 text-sm font-semibold text-white shadow hover:bg-emerald-600"
                      >
                        Düzenle
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-neutral-500">
                    Kayıt bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-2xl bg-white shadow-xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-200/70 bg-white p-4">
              <div className="text-lg font-semibold">Yeni Hat Ekle</div>
              <button
                onClick={closeModal}
                className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100"
                aria-label="Kapat"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 p-4">
              <Input
                label="Hat Adı"
                value={form.lineName}
                onChange={v => onChange('lineName', v)}
              />
              <Input label="İl" value={form.city} onChange={v => onChange('city', v)} />
              <Input label="İlçe" value={form.district} onChange={v => onChange('district', v)} />

              <Input
                label="Kurye Km Ücreti"
                type="number"
                value={String(form.prices.kurye)}
                onChange={v => setPrice('kurye', Number(v))}
              />
              <Input
                label="Minivan Km Ücreti"
                type="number"
                value={String(form.prices.minivan)}
                onChange={v => setPrice('minivan', Number(v))}
              />
              <Input
                label="Panelvan Km Ücreti"
                type="number"
                value={String(form.prices.panelvan)}
                onChange={v => setPrice('panelvan', Number(v))}
              />
              <Input
                label="Kamyonet Km Ücreti"
                type="number"
                value={String(form.prices.kamyonet)}
                onChange={v => setPrice('kamyonet', Number(v))}
              />
              <Input
                label="Kamyon Km Ücreti"
                type="number"
                value={String(form.prices.kamyon)}
                onChange={v => setPrice('kamyon', Number(v))}
              />

              <div className="mt-4 flex items-center justify-end gap-3">
                <button
                  onClick={closeModal}
                  className="rounded-xl bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600 ring-1 ring-rose-200 hover:bg-rose-100"
                >
                  İptal
                </button>
                <button
                  onClick={onSave}
                  className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-600"
                >
                  Kaydet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- küçük yardımcı input ---------- */
function Input({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: React.HTMLInputTypeAttribute;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-semibold text-neutral-700">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 outline-none ring-2 ring-transparent transition focus:bg-white focus:ring-sky-200"
      />
    </div>
  );
}

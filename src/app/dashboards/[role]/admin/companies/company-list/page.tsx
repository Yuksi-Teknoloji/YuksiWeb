'use client';

import * as React from 'react';
import Link from 'next/link';

type Company = {
  id: string;
  plate: string;       // Şirket Plakası
  owner: string;       // Şirket Sahibi
  minOrder: number;    // Min Sip
  city: string;
  district: string;
  active: boolean;
};

const SEED: Company[] = [
  { id: 'c1', plate: '34 ABC 123', owner: 'Yüksi Lojistik', minOrder: 250, city: 'İstanbul', district: 'Kadıköy', active: true },
  { id: 'c2', plate: '06 XYZ 987', owner: 'Hızlı Kargo',    minOrder: 150, city: 'Ankara',   district: 'Çankaya', active: false },
];

export default function CompanyListPage({
  params,
}: {
  params: { role: string };
}) {
  const role = params.role;

  // filtre state’leri
  const [q, setQ] = React.useState('');
  const [city, setCity] = React.useState('');
  const [district, setDistrict] = React.useState('');
  const [onlyActive, setOnlyActive] = React.useState(false);

  // >>> YENİ: dosya yükleme state’leri
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [uploadInfo, setUploadInfo] = React.useState<{ name: string; sizeKB: number; type: string } | null>(null);
  const [csvPreview, setCsvPreview] = React.useState<string[][]>([]); // ilk birkaç satır

  const data = React.useMemo(() => {
    return SEED.filter((c) => {
      if (onlyActive && !c.active) return false;
      if (city && !c.city.toLowerCase().includes(city.trim().toLowerCase())) return false;
      if (district && !c.district.toLowerCase().includes(district.trim().toLowerCase())) return false;
      if (q) {
        const t = q.trim().toLowerCase();
        const hit =
          c.plate.toLowerCase().includes(t) ||
          c.owner.toLowerCase().includes(t);
        if (!hit) return false;
      }
      return true;
    });
  }, [q, city, district, onlyActive]);

  const createHref = `/dashboards/${role}/admin/companies/create-company`;

  // >>> YENİ: butondan dosya seçiciyi aç
  const openPicker = () => fileInputRef.current?.click();

  // >>> YENİ: seçilen dosyayı işle
  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    setUploadInfo({ name: f.name, sizeKB: Math.round(f.size / 1024), type: f.type || 'unknown' });
    setCsvPreview([]);

    // Sadece CSV için hızlı önizleme (xlsx okumak için client’ta bir kütüphane gerekir)
    const isCsv = /\.csv$/i.test(f.name) || f.type === 'text/csv';
    if (isCsv) {
      const reader = new FileReader();
      reader.onload = () => {
        const text = String(reader.result || '');
        // çok basit, virgül ayrımlı parser (tırnak kaçırtma vs. yok – demo)
        const lines = text.split(/\r?\n/).slice(0, 10); // ilk 10 satır
        const rows = lines
          .map((l) => l.trim())
          .filter(Boolean)
          .map((l) => l.split(',').map((cell) => cell.trim()));
        setCsvPreview(rows);
      };
      reader.readAsText(f, 'utf-8');
    } else {
      // xlsx/xls: burada sadece bilgi gösteriyoruz
      // parse etmek istersen daha sonra SheetJS gibi bir kütüphane ekleyebiliriz.
    }

    // aynı dosyayı tekrar seçebilmek için input’u sıfırla
    e.target.value = '';
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <h1 className="mb-4 text-2xl font-semibold">Şirket Listesi</h1>

      {/* Arama / Filtre Kartı */}
      <section className="rounded-2xl border border-neutral-200/70 bg-white p-6 shadow-sm soft-card">
        <h2 className="mb-4 text-xl font-semibold text-neutral-700">Şirket Bul</h2>

        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Arama yap"
          className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 text-neutral-800 placeholder:text-neutral-400 outline-none ring-2 ring-transparent transition focus:bg-white focus:border-neutral-300 focus:ring-sky-200"
        />

        <div className="grid items-end gap-4 md:grid-cols-[1fr_1fr_auto_auto]">
          <div>
            <label className="mb-1 block text-sm font-semibold text-neutral-600">Şehir Seçiniz</label>
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 text-neutral-800 placeholder:text-neutral-400 outline-none ring-2 ring-transparent transition focus:bg-white focus:border-neutral-300 focus:ring-sky-200"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-neutral-600">İlçe Seçiniz</label>
            <input
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 text-neutral-800 placeholder:text-neutral-400 outline-none ring-2 ring-transparent transition focus:bg-white focus:border-neutral-300 focus:ring-sky-200"
            />
          </div>

          {/* Aktif/Pasif toggle */}
          <div className="flex flex-col">
            <span className="mb-1 text-sm font-semibold text-neutral-600">Aktif / Pasif</span>
            <Toggle checked={onlyActive} onChange={setOnlyActive} />
          </div>

          {/* Aksiyon butonları */}
          <div className="flex items-end gap-3">
            <Link
              href={createHref}
              className="inline-flex items-center justify-center rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-600 active:translate-y-px"
            >
              Şirket Ekle
            </Link>
            <button
              type="button"
              onClick={openPicker}
              className="rounded-xl bg-neutral-800 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-neutral-900 active:translate-y-px"
            >
              Excelden Yükle
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={onPick}
            />
          </div>
        </div>
        {/* Yüklenen dosya bilgisi & CSV önizleme */}
        {uploadInfo && (
          <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
            <div className="text-sm text-neutral-700">
              <span className="font-semibold">Seçilen Dosya:</span> {uploadInfo.name} • {uploadInfo.sizeKB} KB
            </div>

            {csvPreview.length > 0 && (
              <div className="mt-3 overflow-x-auto">
                <table className="min-w-[480px] border-separate border-spacing-y-2">
                  <tbody>
                    {csvPreview.map((row, i) => (
                      <tr key={i}>
                        {row.map((cell, j) => (
                          <td key={j} className="rounded-md bg-white px-3 py-1 text-sm text-neutral-700 ring-1 ring-neutral-200">
                            {cell || <span className="opacity-50">—</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-2 text-xs text-neutral-500">İlk {csvPreview.length} satır gösteriliyor.</div>
              </div>
            )}

            {csvPreview.length === 0 && /\.xlsx?$/i.test(uploadInfo.name) && (
              <div className="mt-2 text-xs text-neutral-600">
                Excel dosyası seçildi. İçeri aktarma için backend veya SheetJS gibi bir kütüphane entegre edebiliriz.
              </div>
            )}
          </div>
        )}

        {/* Ayırıcı çizgi */}
        <div className="mt-6 h-px w-full bg-neutral-200/70" />
        {/* Tablo başlığı */}
        <div className="mt-4 grid grid-cols-3 gap-4 text-sm font-semibold text-neutral-700">
          <div>Şirket Plakası</div>
          <div>Şirket Sahibi</div>
          <div className="text-right">Min Sip</div>
        </div>

        {/* Satırlar */}
        <div className="mt-2">
          {data.length === 0 ? (
            <div className="py-10 text-center text-sm text-neutral-500">
              Kriterlere uyan şirket bulunamadı.
            </div>
          ) : (
            <ul className="divide-y divide-neutral-200">
              {data.map((c) => (
                <li key={c.id} className="grid grid-cols-3 items-center gap-4 py-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-block h-2.5 w-2.5 rounded-full ${c.active ? 'bg-emerald-500' : 'bg-neutral-400'}`}
                      title={c.active ? 'Aktif' : 'Pasif'}
                    />
                    <span className="font-medium text-neutral-900">{c.plate}</span>
                  </div>
                  <div className="text-neutral-800">{c.owner}</div>
                  <div className="text-right text-neutral-900">{c.minOrder.toLocaleString('tr-TR')}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

/* Basit Toggle */
function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
      className={`relative inline-flex h-9 w-16 items-center rounded-full transition ${
        checked ? 'bg-indigo-500' : 'bg-neutral-300'
      }`}
    >
      <span
        className={`absolute left-1 top-1 h-7 w-7 rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-7' : ''
        }`}
      />
    </button>
  );
}

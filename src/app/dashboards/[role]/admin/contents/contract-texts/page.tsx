'use client';

import * as React from 'react';

type ContractRow = {
  id: string;
  title: string;         // İçerik Başlığı
  kind: 'agree' | 'page' | 'post';
  badge?: string;        // küçük turuncu rozet (örn: YÜKSİ)
};

const initialRows: ContractRow[] = [
  { id: 'ct-1', title: 'Kurye Gizlilik Sözleşmesi',      kind: 'agree', badge: 'YÜKSİ' },
  { id: 'ct-2', title: 'Kurye Taşıyıcı Sözleşmesi',      kind: 'agree', badge: 'YÜKSİ' },
  { id: 'ct-3', title: 'Gizlilik Sözleşmesi',            kind: 'agree', badge: 'YÜKSİ' },
  { id: 'ct-4', title: 'Kullanıcı Sözleşmesi',           kind: 'agree', badge: 'YÜKSİ' },
];

export default function ContractTextsPage() {
  const [rows, setRows] = React.useState<ContractRow[]>(initialRows);

  const handleAdd = () => {
    const n = rows.length + 1;
    setRows(prev => [
      ...prev,
      { id: crypto.randomUUID(), title: `Yeni Sözleşme ${n}`, kind: 'agree', badge: 'YÜKSİ' },
    ]);
  };

  const handleDelete = (id: string) => {
    setRows(prev => prev.filter(r => r.id !== id));
  };

  const handleEdit = (id: string) => {
    const r = rows.find(x => x.id === id);
    if (!r) return;
    const newTitle = prompt('İçerik Başlığı', r.title) ?? r.title;
    const newKind = (prompt('Tür (agree/page/post)', r.kind) as ContractRow['kind']) ?? r.kind;
    setRows(prev => prev.map(x => (x.id === id ? { ...x, title: newTitle, kind: newKind } : x)));
  };

  return (
    <div className="space-y-4">
      {/* Sayfa başlığı */}
      <div className="px-2 sm:px-0">
        <h1 className="text-2xl font-semibold tracking-tight">İçerik Listesi</h1>
      </div>

      {/* Kart */}
      <section className="rounded-2xl border border-neutral-200/70 bg-white shadow-sm">
        {/* Üst bar: sağda “Yeni Ekle” */}
        <div className="flex items-center justify-end p-5 sm:p-6">
          <button
            onClick={handleAdd}
            className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-sky-600 active:translate-y-px"
          >
            Yeni Ekle
          </button>
        </div>

        <div className="h-px w-full bg-neutral-200/70" />

        {/* Tablo */}
        <div className="overflow-x-auto">
          <table className="min-w-full table-fixed">
            <thead>
              <tr className="text-left text-sm text-neutral-500">
                <th className="px-6 py-3 font-medium">İçerik Başlığı</th>
                <th className="w-40 px-6 py-3 font-medium"></th>{/* boş başlık hizası için */}
                <th className="w-40 px-6 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id} className="border-t border-neutral-200/70 align-middle">
                  {/* Başlık + rozet */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {r.badge && (
                        <span className="inline-flex items-center rounded-sm bg-orange-500 px-2 py-0.5 text-[11px] font-semibold text-white">
                          {r.badge}
                        </span>
                      )}
                      <span className="font-semibold text-neutral-900">{r.title}</span>
                    </div>
                  </td>

                  {/* Tür (ekranda “agree” yazıyor) */}
                  <td className="px-6 py-4 text-neutral-700">{r.kind}</td>

                  {/* Aksiyonlar */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="rounded-md bg-red-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-600 active:translate-y-px"
                      >
                        Sil
                      </button>
                      <button
                        onClick={() => handleEdit(r.id)}
                        className="rounded-md bg-green-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-600 active:translate-y-px"
                      >
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {rows.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-sm text-neutral-500">
                    Henüz içerik yok. Sağ üstten <strong>“Yeni Ekle”</strong> ile ekleyebilirsin.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

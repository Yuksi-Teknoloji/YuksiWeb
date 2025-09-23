'use client';

import * as React from 'react';

type ContentRow = {
  id: string;
  title: string;     // İçerik Başlığı
  type: 'page' | 'post';
  badge?: string;    // küçük turuncu etiket (örn: YÜKSİ)
};

const initialRows: ContentRow[] = [
  { id: 'c-1', title: 'Yüksi Hakkımızda', type: 'page', badge: 'YÜKSİ' },
];

export default function ContentPageList() {
  const [rows, setRows] = React.useState<ContentRow[]>(initialRows);
  const [open, setOpen] = React.useState(false);

  const handleAdd = () => setOpen(true);

  const handleDelete = (id: string) => {
    setRows(prev => prev.filter(r => r.id !== id));
  };

  const handleEdit = (id: string) => {
    const r = rows.find(x => x.id === id);
    if (!r) return;
    const newTitle = prompt('İçerik Başlığı', r.title) ?? r.title;
    const newType = (prompt('Tür (page/post)', r.type) as 'page' | 'post') ?? r.type;
    setRows(prev => prev.map(x => (x.id === id ? { ...x, title: newTitle, type: newType } : x)));
  };

  function handleCreate(payload: {
    title: string;
    type: 'page' | 'post';
    showInMenu: boolean;
    showInFooter: boolean;
    content: string;
    imageUrl: string;
  }) {
    setRows(prev => [
      { id: crypto.randomUUID(), title: payload.title, type: payload.type, badge: 'YÜKSİ' },
      ...prev,
    ]);
    setOpen(false);
  }

  return (
    <div className="space-y-4">
      {/* Sayfa başlığı */}
      <div className="px-2 sm:px-0">
        <h1 className="text-2xl font-semibold tracking-tight">İçerik Listesi</h1>
      </div>

      {/* Kart */}
      <section className="rounded-2xl border border-neutral-200/70 bg-white shadow-sm soft-card">
        {/* Üst şerit */}
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
                <th className="w-40 px-6 py-3 font-medium">Tür</th>
                <th className="w-44 px-6 py-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id} className="border-t border-neutral-200/70 align-middle">
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
                  <td className="px-6 py-4 text-neutral-700">{r.type}</td>
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

      {open && <CreateModal onClose={() => setOpen(false)} onCreate={handleCreate} />}
    </div>
  );
}

/* -------- Modal (öncekilerle aynı stil) -------- */

function CreateModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (data: {
    title: string;
    type: 'page' | 'post';
    showInMenu: boolean;
    showInFooter: boolean;
    content: string;
    imageUrl: string;
  }) => void;
}) {
  const [title, setTitle] = React.useState('');
  const [type, setType] = React.useState<'page' | 'post'>('page');
  const [showInMenu, setShowInMenu] = React.useState(false);
  const [showInFooter, setShowInFooter] = React.useState(false);
  const [content, setContent] = React.useState('');
  const [file, setFile] = React.useState<File | null>(null);
  const [preview, setPreview] = React.useState<string>('');

  React.useEffect(() => {
    if (!file) {
      setPreview('');
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    onCreate({
      title,
      type,
      showInMenu,
      showInFooter,
      content,
      imageUrl: preview,
    });
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-start overflow-y-auto bg-black/50 p-4">
      <div className="mx-auto w-full max-w-6xl rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h3 className="text-xl font-semibold">Yeni Alt Bölüm Oluştur</h3>
          <button
            className="rounded-full p-2 hover:bg-neutral-100"
            onClick={onClose}
            aria-label="Kapat"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <form onSubmit={submit} className="space-y-6 p-5">
          {/* Başlık */}
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Başlık"
            className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-neutral-800 outline-none ring-2 ring-transparent transition focus:border-neutral-300 focus:ring-sky-200"
          />

          {/* Tür */}
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700">İçerik Türü</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as 'page' | 'post')}
              className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-neutral-800 outline-none ring-2 ring-transparent transition focus:border-neutral-300 focus:ring-sky-200"
            >
              <option value="page">Sayfa (page)</option>
              <option value="post">Gönderi (post)</option>
            </select>
          </div>

          {/* Toggle'lar */}
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={showInMenu}
                onChange={(e) => setShowInMenu(e.target.checked)}
                className="h-5 w-5 rounded border-neutral-300"
              />
              <span>Menü'de Göster</span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={showInFooter}
                onChange={(e) => setShowInFooter(e.target.checked)}
                className="h-5 w-5 rounded border-neutral-300"
              />
              <span>Footer'da Göster</span>
            </label>
          </div>

          {/* Editör benzetimi */}
          <div className="rounded-xl border border-neutral-300">
            <div className="flex items-center gap-3 border-b px-3 py-2 text-sm text-neutral-500">
              <span>Paragraph</span>
              <span className="mx-1">•</span>
              <span>B</span>
              <span>I</span>
              <span>• • •</span>
            </div>
            <textarea
              rows={12}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="h-[320px] w-full resize-y rounded-b-xl px-3 py-2 outline-none"
            />
          </div>

          {/* Resim yükle */}
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700">Resim yükle</label>
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-neutral-800 outline-none ring-2 ring-transparent transition focus:border-neutral-300 focus:ring-sky-200"
              />
              {preview && (
                <img
                  src={preview}
                  alt="Önizleme"
                  className="h-14 w-14 rounded-lg object-cover ring-1 ring-neutral-200"
                />
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-start">
            <button
              type="submit"
              className="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-600"
              disabled={!title}
            >
              Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

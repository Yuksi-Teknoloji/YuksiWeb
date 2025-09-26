// src/app/dashboards/[role]/restaurants/profile/page.tsx
'use client';

import * as React from 'react';
import Image from 'next/image';

type Contact = {
  manager: string;
  phone: string;
  email: string;
};

export default function RestaurantProfilePage() {
  const [address, setAddress] = React.useState(
    'KESTEL Ahmet Vefikpaşa OSB Mahallesi, Bursa Caddesi No:73, Kestel/Bursa.'
  );
  const [contact, setContact] = React.useState<Contact>({
    manager: 'Yetkili: Rıdvan Berat Çalış',
    phone: 'Yetkili No: 05xx xxx xxx',
    email: 'Yetkili E-mail : ridvan_yuksi@gmail.com',
  });
  const [hours, setHours] = React.useState('Açılış: 08.00   Kapanış: 12.00');

  // Hangi alan düzenlemede?
  const [editing, setEditing] = React.useState<{
    address?: boolean;
    manager?: boolean;
    phone?: boolean;
    email?: boolean;
    hours?: boolean;
  }>({});

  function toggle(field: keyof typeof editing) {
    setEditing((s) => ({ ...s, [field]: !s[field] }));
  }

  function saveAll() {
    alert('Bilgiler kaydedildi (demo).');
    setEditing({});
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Profil</h1>

      <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Sol içerik */}
        <div className="rounded-2xl border border-neutral-200/70 bg-orange-50 p-4 sm:p-6">
          {/* Adres */}
          <Block title="Adres:">
            <Row>
              <input
                className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 outline-none disabled:bg-white"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={!editing.address}
              />
              <EditButton onClick={() => toggle('address')} active={!!editing.address} />
            </Row>
          </Block>

          {/* İletişim */}
          <Block title="İletişim">
            <Row>
              <input
                className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 outline-none disabled:bg-white"
                value={contact.manager}
                onChange={(e) => setContact({ ...contact, manager: e.target.value })}
                disabled={!editing.manager}
              />
              <EditButton onClick={() => toggle('manager')} active={!!editing.manager} />
            </Row>

            <Row>
              <input
                className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 outline-none disabled:bg-white"
                value={contact.phone}
                onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                disabled={!editing.phone}
              />
              <EditButton onClick={() => toggle('phone')} active={!!editing.phone} />
            </Row>

            <Row>
              <input
                className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 outline-none disabled:bg-white"
                value={contact.email}
                onChange={(e) => setContact({ ...contact, email: e.target.value })}
                disabled={!editing.email}
              />
              <EditButton onClick={() => toggle('email')} active={!!editing.email} />
            </Row>
          </Block>

          {/* Çalışma Saatleri */}
          <Block title="Çalışma Saatleri">
            <Row>
              <input
                className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 outline-none disabled:bg-white"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                disabled={!editing.hours}
              />
              <EditButton onClick={() => toggle('hours')} active={!!editing.hours} />
            </Row>
          </Block>

          {/* Kaydet */}
          <div className="flex justify-center pt-4">
            <button
              onClick={saveAll}
              className="rounded-xl border border-orange-300 bg-white px-6 py-2.5 text-sm font-semibold text-orange-500 shadow-sm hover:bg-orange-50"
            >
              Kaydet
            </button>
          </div>
        </div>

        {/* Sağ panel */}
        <aside className="rounded-2xl border border-neutral-200/70 bg-white p-6">
          <div className="flex flex-col items-center text-center">
            <div className="relative h-24 w-24">
              <Image
                src="/avatar-demo.jpg" // public/ içine bir görsel ekleyebilirsin
                alt="profile"
                fill
                className="rounded-full object-cover ring-4 ring-orange-100"
              />
            </div>

            <div className="mt-4 space-y-2 text-sm">
              <p>
                <span className="font-semibold text-orange-600">Yetkili:</span>{' '}
                Rıdvan Berat Çalış
              </p>
              <p>
                <span className="font-semibold text-orange-600">Restorant:</span>{' '}
                Yüksi Restorant
              </p>
              <p>3 yıldır kurumsal üye</p>
              <p>
                Paket Ortalaması:
                <button
                  className="ml-1 align-baseline text-orange-600 underline underline-offset-2"
                  onClick={() => alert('Günlük 57 paket (demo)')}
                >
                  (Günlük 57)
                </button>
              </p>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}

/* ---- küçük yardımcılar ---- */
function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <div className="mb-2 text-sm font-semibold text-neutral-800">{title}</div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-3">
      {children}
    </div>
  );
}

function EditButton({ onClick, active }: { onClick: () => void; active: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition
        ${active ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-emerald-500 hover:bg-emerald-600'}
      `}
    >
      DÜZENLE
    </button>
  );
}

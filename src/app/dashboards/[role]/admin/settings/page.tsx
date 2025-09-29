// src/app/(dashboards)/[role]/settings/page.tsx
import type { Role } from "@/types/auth";

export default function Settings({ params }: { params: { role: Role } }) {
  return <div className="rounded-2xl bg-white p-4 shadow">Ayarlar – {params.role}</div>;
}

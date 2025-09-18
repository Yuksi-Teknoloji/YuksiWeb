// src/app/(dashboards)/[role]/page.tsx
import type { Role } from "@/types/auth";

export default function RoleHome({ params }: { params: { role: Role } }) {
  return (
    <section className="rounded-2xl bg-white p-4 shadow">
      <h2 className="font-semibold mb-2">Hoş geldiniz</h2>
      <p className="text-sm text-neutral-600">Bu sayfa {params.role} rolü için ana ekrandır.</p>
    </section>
  );
}

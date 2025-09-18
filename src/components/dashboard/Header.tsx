// src/components/dashboard/Header.tsx
export default function Header({ title }: { title: string }) {
  return (
    <header className="sticky top-0 z-10 bg-white border-b px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <h1 className="text-lg font-semibold">{title}</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-neutral-500">Admin</span>
          <div className="h-8 w-8 rounded-full bg-neutral-200" />
        </div>
      </div>
    </header>
  );
}

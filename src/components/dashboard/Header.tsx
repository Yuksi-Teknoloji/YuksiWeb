// src/components/dashboard/Header.tsx
"use client";

import { useEffect, useRef, useState } from "react";

export default function Header({
  title,
  titleClass = "",
  headerClass = "",
  userLabel = "Hesabım",
}: {
  title: string;
  titleClass?: string;
  headerClass?: string;
  userLabel?: string; // opsiyonel: dilediğinde isim geçebil
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // menu dışına tıklayınca kapat
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const handleLogout = () => {
    try {
      localStorage.removeItem("YUKSI_TOKEN");
      localStorage.removeItem("YUKSI_ROLE");
    } catch {}
    window.location.href = "/"; // ana sayfaya at
  };

  return (
    <header
      className={[
        "sticky top-0 z-10 px-4 py-3 border-b",
        headerClass || "bg-white border-neutral-200 text-neutral-900",
      ].join(" ")}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <h1 className={["text-lg font-semibold", titleClass].join(" ")}>{title}</h1>

        {/* user area + dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setOpen((s) => !s)}
            className="flex items-center gap-3 rounded-lg px-2 py-1 hover:bg-white/10"
            title={userLabel}
          >
            <span className="text-sm opacity-80">{userLabel}</span>
            <div className="h-8 w-8 rounded-full bg-white/30" />
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-44 rounded-xl border border-neutral-200 bg-white text-neutral-800 shadow-lg">
              {/* istersen başka seçenekler de ekleyebilirsin */}
              <button
                onClick={handleLogout}
                className="w-full px-3 py-2 text-left rounded-t-xl hover:bg-neutral-50"
              >
                Çıkış Yap
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

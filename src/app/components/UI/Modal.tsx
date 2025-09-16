// src/components/ui/Modal.tsx
"use client";

import { useRouter } from "next/navigation";
import React from "react";

export default function Modal({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  const router = useRouter();

  const onClose = () => {
    // bir önceki route'a dön
    router.back();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4
                 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="w-full max-w-md rounded-3xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()} // içeriğe tıklayınca kapanmasın
      >
        <header className="px-6 pt-5">
          {title ? (
            <h2 className="text-lg font-semibold text-neutral-800">{title}</h2>
          ) : null}
        </header>
        <div className="p-6 pt-4">
          {children}
        </div>
      </div>
    </div>
  );
}

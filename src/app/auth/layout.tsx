// src/app/layout.tsx
import React from "react";
import "./globals.css"; // import your global styles if any

export const metadata = {
  title: "YuksiWeb Admin",
  description: "Admin Dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className="min-h-screen bg-neutral-100 antialiased">
        {children}
      </body>
    </html>
  );
}

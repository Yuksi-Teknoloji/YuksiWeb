import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../styles/globals.css";
import Script from "next/script"; // ✅ Add Script

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Yüksi",
  description: "Auth UI",
};

export default function RootLayout({
  children,
  modal, // parallel route slot
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className="min-h-dvh bg-neutral-100 antialiased">
        {children}
        {/* Modal overlay */}
        {modal}

        {/* ✅ Bootstrap JS loaded only in browser */}
        <Script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}

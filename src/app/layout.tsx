import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../../globals.css";

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
  modal,           // parallel route slot
}: {
  children: React.ReactNode;
  modal: React.ReactNode;   // 
}) {
  return (
    <html lang="tr">
      <body className="min-h-dvh bg-neutral-100 antialiased">
        {children}
        {/* Modal overlay en sonda render edilir */}
        {modal}
      </body>
    </html>
  );
}
